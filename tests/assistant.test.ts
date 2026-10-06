import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import handler from "../netlify/functions/assistant";

/**
 * Prova la function dell'AI Assistant dalla sua porta d'ingresso (piano v2,
 * Fase 25): una `Request` vera, `fetch` sostituita, nessuna chiave e nessuna
 * rete. Difende le regole delle Fasi 19-20 — tetti della cronologia, cascata
 * di modelli :free, errori che non devono far trapelare dettagli di OpenRouter.
 */

interface UpstreamCall {
  models: string[];
  messages: { role: string; content: string }[];
  max_tokens: number;
}

/** L'ultima richiesta che la function ha mandato a OpenRouter. */
let lastCall: UpstreamCall | undefined;

function stubUpstream(
  body: unknown,
  init: ResponseInit = { status: 200, headers: { "Content-Type": "application/json" } },
) {
  vi.stubGlobal(
    "fetch",
    vi.fn(async (_url: string, options: { body: string }) => {
      lastCall = JSON.parse(options.body) as UpstreamCall;
      return new Response(typeof body === "string" ? body : JSON.stringify(body), init);
    }),
  );
}

/** La forma di risposta che OpenRouter restituisce davvero. */
function completion(content: string) {
  return {
    model: "nvidia/nemotron-3-super-120b-a12b:free",
    choices: [{ message: { content }, finish_reason: "stop" }],
    usage: { prompt_tokens: 100, completion_tokens: 50, total_tokens: 150 },
  };
}

const ask = (body: unknown, method = "POST") =>
  handler(
    new Request("https://example.invalid/api/assistant", {
      method,
      body: method === "POST" ? JSON.stringify(body) : undefined,
      headers: { "Content-Type": "application/json" },
    }),
  );

beforeEach(() => {
  lastCall = undefined;
  process.env.OPENROUTER_API_KEY = "chiave-di-prova";
  delete process.env.OPENROUTER_MODEL;
});

afterEach(() => {
  vi.unstubAllGlobals();
  delete process.env.OPENROUTER_API_KEY;
  delete process.env.OPENROUTER_MODEL;
});

describe("richieste rifiutate prima di chiamare OpenRouter", () => {
  it("risponde 405 a GET", async () => {
    stubUpstream(completion("niente"));
    expect((await ask(undefined, "GET")).status).toBe(405);
    expect(lastCall).toBeUndefined();
  });

  it("risponde 400 a un corpo che non è JSON", async () => {
    const res = await handler(
      new Request("https://example.invalid/api/assistant", { method: "POST", body: "{" }),
    );
    expect(res.status).toBe(400);
  });

  it.each([
    ["message assente", {}],
    ["message vuoto", { message: "" }],
    ["message non stringa", { message: 42 }],
    ["message oltre 2000 caratteri", { message: "a".repeat(2001) }],
  ])("risponde 400 con %s", async (_caso, body) => {
    expect((await ask(body)).status).toBe(400);
  });

  it.each([
    ["più di 10 messaggi", Array.from({ length: 11 }, () => ({ role: "user", content: "ciao" }))],
    ["un messaggio oltre 4000 caratteri", [{ role: "user", content: "a".repeat(4001) }]],
    [
      "un totale oltre 12000 caratteri",
      Array.from({ length: 4 }, () => ({ role: "user", content: "a".repeat(3500) })),
    ],
    ["un ruolo sconosciuto", [{ role: "system", content: "ciao" }]],
  ])("risponde 400 a una cronologia con %s", async (_caso, history) => {
    expect((await ask({ message: "ciao", history })).status).toBe(400);
  });

  it("accetta una cronologia al limite dei 10 messaggi", async () => {
    stubUpstream(completion("ok"));
    const history = Array.from({ length: 10 }, () => ({ role: "user", content: "ciao" }));
    expect((await ask({ message: "ciao", history })).status).toBe(200);
  });

  it("risponde 500 senza OPENROUTER_API_KEY", async () => {
    delete process.env.OPENROUTER_API_KEY;
    expect((await ask({ message: "ciao" })).status).toBe(500);
  });
});

describe("modelli", () => {
  it("usa i tre :free di default", async () => {
    stubUpstream(completion("ok"));
    await ask({ message: "ciao" });
    expect(lastCall?.models).toEqual([
      "nvidia/nemotron-3-super-120b-a12b:free",
      "google/gemma-4-31b-it:free",
      "google/gemma-4-26b-a4b-it:free",
    ]);
  });

  it("mette OPENROUTER_MODEL per primo, senza superare i tre", async () => {
    process.env.OPENROUTER_MODEL = "un/modello:free";
    stubUpstream(completion("ok"));
    await ask({ message: "ciao" });
    expect(lastCall?.models[0]).toBe("un/modello:free");
    expect(lastCall?.models).toHaveLength(3);
  });

  it("non duplica un modello già nei default", async () => {
    process.env.OPENROUTER_MODEL = "google/gemma-4-31b-it:free";
    stubUpstream(completion("ok"));
    await ask({ message: "ciao" });
    expect(new Set(lastCall?.models).size).toBe(lastCall?.models.length);
  });
});

describe("contesto", () => {
  it("passa solo i documenti della lingua chiesta, più i lang-neutral", async () => {
    stubUpstream(completion("ok"));
    await ask({ message: "ciao", language: "en" });
    const prompt = lastCall!.messages[0].content;
    expect(prompt).toContain("knowledge-base/about.en.md");
    expect(prompt).not.toContain("knowledge-base/about.it.md");
    expect(prompt).toContain("knowledge-base/skills.md");
  });

  it("tratta come italiano una lingua non riconosciuta", async () => {
    stubUpstream(completion("ok"));
    await ask({ message: "ciao", language: "de" });
    expect(lastCall!.messages[0].content).toContain("knowledge-base/about.it.md");
  });
});

describe("risposta", () => {
  it("separa risposta e fonti, scartando i percorsi inventati", async () => {
    stubUpstream(
      completion(
        "La risposta.\n---SOURCES---\nknowledge-base/about.it.md\nknowledge-base/inventato.md",
      ),
    );
    const body = (await ask({ message: "ciao" })).json() as Promise<{
      answer: string;
      sources: string[];
    }>;
    expect((await body).answer).toBe("La risposta.");
    expect((await body).sources).toEqual(["knowledge-base/about.it.md"]);
  });

  it("toglie l'etichetta di scope dalla risposta", async () => {
    stubUpstream(completion("IN_SCOPE:\nLa risposta."));
    const { answer } = (await (await ask({ message: "ciao" })).json()) as { answer: string };
    expect(answer).toBe("La risposta.");
  });

  it("restituisce le statistiche di generazione", async () => {
    stubUpstream(completion("ok"));
    const { stats } = (await (await ask({ message: "ciao" })).json()) as {
      stats: { model: string; totalTokens: number };
    };
    expect(stats.model).toBe("nvidia/nemotron-3-super-120b-a12b:free");
    expect(stats.totalTokens).toBe(150);
  });
});

describe("errori di OpenRouter", () => {
  it("passa il 429 al visitatore come rate_limited", async () => {
    stubUpstream({ error: "quota" }, { status: 429 });
    const res = await ask({ message: "ciao" });
    expect(res.status).toBe(429);
    expect(await res.json()).toEqual({ error: "rate_limited" });
  });

  it("non fa trapelare il dettaglio di un errore upstream", async () => {
    stubUpstream("chiave API non valida: sk-segreto", { status: 401 });
    const res = await ask({ message: "ciao" });
    expect(res.status).toBe(502);
    expect(await res.text()).not.toContain("sk-segreto");
  });

  it("risponde 502 se OpenRouter è irraggiungibile", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => { throw new Error("rete assente"); }));
    expect((await ask({ message: "ciao" })).status).toBe(502);
  });

  it("risponde 502 se la risposta non ha il contenuto atteso", async () => {
    stubUpstream({ choices: [] });
    expect((await ask({ message: "ciao" })).status).toBe(502);
  });
});
