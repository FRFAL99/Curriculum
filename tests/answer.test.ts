import { describe, expect, it } from "vitest";
import { parseAnswer, readSse, visibleAnswer } from "../netlify/functions/lib/answer";

/**
 * Le funzioni pure che leggono la risposta del modello (piano v4): blocchi
 * di domande suggerite e fonti, testo mostrabile durante lo streaming, SSE.
 */

const PATHS = new Set(["knowledge-base/about.it.md", "knowledge-base/skills.md"]);

describe("parseAnswer", () => {
  it("accetta i due blocchi in qualunque ordine", () => {
    const parsed = parseAnswer(
      "Risposta.\n---SOURCES---\nknowledge-base/skills.md\n---FOLLOWUPS---\nUna domanda?",
      PATHS,
    );
    expect(parsed).toEqual({ answer: "Risposta.", sources: ["knowledge-base/skills.md"], followups: ["Una domanda?"] });
  });

  it("toglie elenchi e virgolette, scarta duplicati e domande troppo lunghe, ne tiene tre", () => {
    const { followups } = parseAnswer(
      [
        "Risposta.",
        "---FOLLOWUPS---",
        "- «Dove ha studiato?»",
        "1) Dove ha studiato?",
        `* ${"a".repeat(121)}`,
        "Che lingue parla?",
        "Dove vive?",
        "Che hobby ha?",
      ].join("\n"),
      PATHS,
    );
    expect(followups).toEqual(["Dove ha studiato?", "Che lingue parla?", "Dove vive?"]);
  });

  it("senza blocchi restituisce solo la risposta", () => {
    expect(parseAnswer("Solo testo.", PATHS)).toEqual({ answer: "Solo testo.", sources: [], followups: [] });
  });
});

describe("visibleAnswer", () => {
  const RAW =
    "OUT_OF_SCOPE:\n\nQuesto esula dalla knowledge base --- ma posso parlarti di Francesco.\n---FOLLOWUPS---\nDove lavora?\n---SOURCES---\n";

  it("cresce sempre per aggiunta, qualunque sia la grandezza dei pezzi", () => {
    for (const size of [1, 2, 3, 5, 8, 13]) {
      let previous = "";
      for (let end = 0; end <= RAW.length; end += size) {
        const visible = visibleAnswer(RAW.slice(0, end));
        expect(visible.startsWith(previous)).toBe(true);
        previous = visible;
      }
      expect(visibleAnswer(RAW).trim()).toBe(parseAnswer(RAW, PATHS).answer);
    }
  });

  it("trattiene l'inizio finché può essere un'etichetta di scope", () => {
    expect(visibleAnswer("IN_SC")).toBe("");
    expect(visibleAnswer("IN_SCOPE:")).toBe("");
    expect(visibleAnswer("In 2022 Francesco")).toBe("In 2022 Francesco");
  });

  it("trattiene la coda finché può essere un marcatore", () => {
    expect(visibleAnswer("Testo.\n---SOU")).toBe("Testo.\n");
    expect(visibleAnswer("Testo.\n---FOLLOWUPS---\nDomanda?")).toBe("Testo.\n");
  });
});

describe("readSse", () => {
  function streamOf(...parts: string[]): ReadableStream<Uint8Array> {
    const encoder = new TextEncoder();
    return new ReadableStream({
      start(controller) {
        for (const part of parts) controller.enqueue(encoder.encode(part));
        controller.close();
      },
    });
  }

  it("ricompone eventi spezzati fra due pezzi, salta commenti e righe rotte, si ferma a [DONE]", async () => {
    const events: unknown[] = [];
    for await (const event of readSse(
      streamOf(": OPENROUTER PROCESSING\n\ndata: {\"a\":", "1}\n\ndata: non-json\n\ndata: {\"b\":2}\n\ndata: [DONE]\n\ndata: {\"c\":3}\n\n"),
    )) {
      events.push(event);
    }
    expect(events).toEqual([{ a: 1 }, { b: 2 }]);
  });
});
