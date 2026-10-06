import { FOLLOWUPS_MARKER, MAX_FOLLOWUPS, SOURCES_MARKER, parseAnswer, readSse, visibleAnswer } from "./lib/answer";
import { loadKnowledgeBase } from "./lib/kb";

/**
 * AI Assistant — Fase 10.
 *
 * Un'unica chiamata a OpenRouter: lo stesso prompt classifica lo scope
 * della domanda (IN_SCOPE/PARTIALLY_IN_SCOPE/OUT_OF_SCOPE, criterio dal
 * documento di visione "Knowledge Base + AI Assistant") e genera la
 * risposta grounded. Niente retrieval semantico/vector DB: la Knowledge
 * Base è piccola, viene passata per intero (filtrata per lingua) come
 * contesto.
 *
 * Dal piano v4 la risposta arriva in streaming: la function legge gli eventi
 * SSE di OpenRouter e manda al browser righe NDJSON, `{ "delta": "…" }` mentre
 * il testo arriva e `{ "done": true, answer, sources, followups, stats }` alla
 * fine. Gli errori che si scoprono prima del primo testo restano codici HTTP
 * con corpo JSON, come prima; dopo, arrivano come riga `{ "error": "…" }`.
 */

const MAX_MESSAGE_LENGTH = 2000;
const MAX_HISTORY_LENGTH = 10;
// La cronologia arriva dal browser: senza tetti chiunque può gonfiare il
// prompt e consumare in poche chiamate la quota giornaliera dei modelli :free.
const MAX_HISTORY_ITEM_LENGTH = 4000;
const MAX_HISTORY_TOTAL_LENGTH = 12000;
// I modelli :free di ripiego "ragionano" prima di rispondere e il
// ragionamento conta nei token di output: con 1000 le risposte lunghe si
// troncavano prima del blocco fonti.
const MAX_OUTPUT_TOKENS = 2500;

/**
 * Modelli :free usati in cascata tramite il parametro `models` di
 * OpenRouter: se il primo è stato rimosso dal free tier (404) o è
 * saturo (429 upstream), OpenRouter passa al successivo. Il catalogo
 * :free cambia spesso, quindi un solo id fisso prima o poi si rompe.
 */
const DEFAULT_MODELS = [
  "nvidia/nemotron-3-super-120b-a12b:free",
  "google/gemma-4-31b-it:free",
  "google/gemma-4-26b-a4b-it:free",
];

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

interface UpstreamUsage {
  prompt_tokens?: number;
  completion_tokens?: number;
  total_tokens?: number;
}

/** Un evento dello stream di OpenRouter (formato chat completions). */
interface UpstreamChunk {
  model?: string;
  choices?: { delta?: { content?: string | null }; finish_reason?: string | null }[];
  usage?: UpstreamUsage;
  error?: unknown;
}

interface RequestBody {
  message?: unknown;
  language?: unknown;
  history?: unknown;
}

const REFUSAL_EXAMPLE: Record<"it" | "en", string> = {
  it: "Questo esula dalla mia knowledge base. Sono qui per aiutarti a esplorare i progetti, l'esperienza e il background tecnico di Francesco.",
  en: "That's outside my knowledge base. I'm here to help you explore Francesco's projects, experience and technical background.",
};

function isValidHistory(value: unknown): value is ChatMessage[] {
  if (!Array.isArray(value) || value.length > MAX_HISTORY_LENGTH) return false;
  let total = 0;
  return value.every((m) => {
    if (!m || typeof m !== "object") return false;
    const { role, content } = m as Record<string, unknown>;
    if ((role !== "user" && role !== "assistant") || typeof content !== "string") return false;
    total += content.length;
    return content.length <= MAX_HISTORY_ITEM_LENGTH && total <= MAX_HISTORY_TOTAL_LENGTH;
  });
}

function buildSystemPrompt(language: "it" | "en", docs: ReturnType<typeof loadKnowledgeBase>): string {
  const kbDump = docs
    .map((doc) => `### ${doc.path}\n${JSON.stringify(doc.frontmatter)}\n\n${doc.body}`)
    .join("\n\n---\n\n");

  return `You are the AI assistant embedded in Francesco Fallavena's portfolio website. You answer questions ONLY using the Knowledge Base provided below — you are not a general-purpose chatbot.

Classify every question into one of three scopes before answering:
- IN_SCOPE: about Francesco's projects, experience, skills, education, technologies, portfolio architecture, career, or contact info. Answer using the Knowledge Base.
- PARTIALLY_IN_SCOPE: a technical question related to something Francesco used (e.g. "why did Francesco choose Firebase?"). Answer only in the context of his portfolio/experience, not as general knowledge.
- OUT_OF_SCOPE: anything else (weather, news, jokes, translation, general knowledge, unrelated coding help). Politely refuse, in ${language === "it" ? "Italian" : "English"}, in the tone of this example: "${REFUSAL_EXAMPLE[language]}"

This classification is for your own internal reasoning only — never write the words "IN_SCOPE", "PARTIALLY_IN_SCOPE", or "OUT_OF_SCOPE" (or any label/heading naming the scope) in your reply. The user must see only the natural-language answer itself, starting directly with your first sentence.

Always answer in ${language === "it" ? "Italian" : "English"}. You are an assistant speaking about Francesco, not Francesco himself: always refer to him in the third person by name (e.g. "${language === "it" ? "Francesco ha lavorato…" : "Francesco has worked…"}"), never with "I"/"my", even when the visitor addresses him as "you".

Never add facts, opinions or preferences that are not in the Knowledge Base (e.g. which project is his favourite, skills or tasks not listed, dates). If the Knowledge Base does not cover what was asked, say so briefly and offer what it does cover.

Knowledge Base:

${kbDump}

---

After the answer, write a line containing exactly ${FOLLOWUPS_MARKER} followed by up to ${MAX_FOLLOWUPS} short follow-up questions (one per line, at most 80 characters each, in ${language === "it" ? "Italian" : "English"}) that the visitor might ask next and that the Knowledge Base above can actually answer. Write them as the visitor would ask them, about Francesco in the third person. Do not repeat a question already asked in this conversation. After an OUT_OF_SCOPE refusal, suggest questions that bring the visitor back to Francesco's profile.

This is a strict formatting rule, not optional: every single response you write, with NO exceptions, MUST end with a line containing exactly ${SOURCES_MARKER} followed by one line per Knowledge Base document path (copy the "### path" lines above verbatim) that you actually used. If you used no document (e.g. an OUT_OF_SCOPE refusal), still write the marker on its own line with nothing after it. Never omit this block.

Example ending for an answer grounded on one document:
${FOLLOWUPS_MARKER}
${language === "it" ? "Che tecnologie ha usato per il sito?" : "Which technologies did he use for the site?"}
${language === "it" ? "Ha esperienza con il cloud?" : "Does he have cloud experience?"}
${SOURCES_MARKER}
knowledge-base/projects/antichita-fallavena.${language}.md`;
}

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

export default async (req: Request): Promise<Response> => {
  if (req.method !== "POST") {
    return jsonResponse({ error: "Method Not Allowed" }, 405);
  }

  let body: RequestBody;
  try {
    body = (await req.json()) as RequestBody;
  } catch {
    return jsonResponse({ error: "Invalid JSON body" }, 400);
  }

  const { message, language: rawLanguage, history: rawHistory } = body;

  if (typeof message !== "string" || message.length === 0 || message.length > MAX_MESSAGE_LENGTH) {
    return jsonResponse({ error: `"message" must be a non-empty string up to ${MAX_MESSAGE_LENGTH} characters` }, 400);
  }
  const language: "it" | "en" = rawLanguage === "en" ? "en" : "it";
  if (rawHistory !== undefined && !isValidHistory(rawHistory)) {
    return jsonResponse(
      {
        error: `"history" must be an array of at most ${MAX_HISTORY_LENGTH} {role, content} messages, each up to ${MAX_HISTORY_ITEM_LENGTH} characters and ${MAX_HISTORY_TOTAL_LENGTH} in total`,
      },
      400,
    );
  }
  const history = (rawHistory as ChatMessage[] | undefined) ?? [];

  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    return jsonResponse({ error: "Server misconfigured: missing OPENROUTER_API_KEY" }, 500);
  }
  // OPENROUTER_MODEL (se impostato) ha la precedenza, i default restano come fallback.
  const envModel = process.env.OPENROUTER_MODEL?.trim();
  // OpenRouter accetta al massimo 3 modelli nell'array `models`.
  const models = [...new Set([...(envModel ? [envModel] : []), ...DEFAULT_MODELS])].slice(0, 3);

  let docs: ReturnType<typeof loadKnowledgeBase>;
  try {
    docs = loadKnowledgeBase().filter((doc) => !doc.lang || doc.lang === language);
  } catch (err) {
    console.error("Failed to load knowledge base:", err);
    return jsonResponse({ error: "Server misconfigured: failed to load knowledge base" }, 500);
  }
  const validPaths = new Set(docs.map((doc) => doc.path));

  const messages = [
    { role: "system", content: buildSystemPrompt(language, docs) },
    ...history,
    { role: "user", content: message },
  ];

  const requestStartedAt = Date.now();
  let upstream: Response;
  try {
    upstream = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://curriculumfrfal.netlify.app",
        "X-Title": "Francesco Fallavena - Portfolio Assistant",
      },
      body: JSON.stringify({
        models,
        messages,
        stream: true,
        // L'ultimo evento dello stream porta i token usati (per le statistiche).
        usage: { include: true },
        temperature: 0.3,
        max_tokens: MAX_OUTPUT_TOKENS,
        // Ragionamento breve e non restituito: ignorato dai modelli che non ragionano.
        reasoning: { effort: "low", exclude: true },
      }),
    });
  } catch (err) {
    console.error("OpenRouter fetch failed:", err);
    return jsonResponse({ error: "upstream_unreachable" }, 502);
  }

  if (upstream.status === 429) {
    console.error("OpenRouter rate limit hit");
    return jsonResponse({ error: "rate_limited" }, 429);
  }

  if (!upstream.ok) {
    const detail = await upstream.text().catch(() => "");
    console.error(`OpenRouter error ${upstream.status}:`, detail);
    // Il dettaglio resta nei log della function: al visitatore basta sapere
    // che l'assistente non è disponibile (la UI mostra un messaggio tradotto).
    return jsonResponse({ error: "upstream_error" }, 502);
  }

  if (!upstream.body) {
    console.error("OpenRouter response without a body");
    return jsonResponse({ error: "upstream_error" }, 502);
  }

  const events = readSse(upstream.body);
  let raw = "";
  let model: string | undefined;
  let finishReason: string | undefined;
  let usage: UpstreamUsage | undefined;

  /** Legge il prossimo evento; `false` quando lo stream è finito. */
  async function pull(): Promise<boolean> {
    const next = await events.next();
    if (next.done) return false;
    const chunk = next.value as UpstreamChunk;
    if (chunk.error) throw new Error(`OpenRouter stream error: ${JSON.stringify(chunk.error).slice(0, 300)}`);
    model ??= chunk.model;
    if (chunk.usage) usage = chunk.usage;
    const choice = chunk.choices?.[0];
    if (typeof choice?.delta?.content === "string") raw += choice.delta.content;
    if (choice?.finish_reason) finishReason = choice.finish_reason;
    return true;
  }

  // Si aspetta il primo testo mostrabile prima di rispondere: finché non è
  // partito niente, un errore resta un codice HTTP che la UI sa tradurre.
  try {
    while (visibleAnswer(raw) === "" && (await pull()));
  } catch (err) {
    console.error(err);
    return jsonResponse({ error: "upstream_error" }, 502);
  }
  if (raw.trim() === "") {
    console.error("OpenRouter stream ended without content");
    return jsonResponse({ error: "upstream_error" }, 502);
  }

  const encoder = new TextEncoder();
  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const send = (line: unknown) => controller.enqueue(encoder.encode(JSON.stringify(line) + "\n"));
      let sent = 0;
      const flush = () => {
        const visible = visibleAnswer(raw);
        if (visible.length > sent) {
          send({ delta: visible.slice(sent) });
          sent = visible.length;
        }
      };

      try {
        flush();
        while (await pull()) flush();

        if (finishReason === "length") {
          console.warn(`OpenRouter answer truncated at ${MAX_OUTPUT_TOKENS} tokens (model ${model})`);
        }
        const elapsedMs = Date.now() - requestStartedAt;
        const outputTokens = usage?.completion_tokens ?? 0;
        const stats = {
          model: model ?? models[0],
          inputTokens: usage?.prompt_tokens ?? 0,
          outputTokens,
          totalTokens: usage?.total_tokens ?? 0,
          elapsedMs,
          tokensPerSecond: outputTokens > 0 ? Math.round((outputTokens / (elapsedMs / 1000)) * 10) / 10 : 0,
        };
        send({ done: true, ...parseAnswer(raw, validPaths), stats });
      } catch (err) {
        console.error(err);
        send({ error: "upstream_error" });
      }
      controller.close();
    },
  });

  return new Response(stream, {
    status: 200,
    headers: { "Content-Type": "application/x-ndjson; charset=utf-8", "Cache-Control": "no-cache" },
  });
};

/**
 * Percorso pubblico e rate limit per visitatore (regola nativa Netlify,
 * disponibile anche sul piano gratuito). I limiti non si possono definire in
 * `netlify.toml` per le function, per questo il percorso vive qui e non più
 * in un `[[redirects]]`. Oltre il limite Netlify risponde 429 da solo.
 */
export const config = {
  path: "/api/assistant",
  rateLimit: {
    windowLimit: 10,
    windowSize: 60,
    aggregateBy: ["ip", "domain"],
  },
};
