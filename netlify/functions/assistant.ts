import { loadKnowledgeBase } from "./lib/kb";

/**
 * AI Assistant — Fase 10.
 *
 * Un'unica chiamata a Gemini: lo stesso prompt classifica lo scope
 * della domanda (IN_SCOPE/PARTIALLY_IN_SCOPE/OUT_OF_SCOPE, criterio dal
 * documento di visione "Knowledge Base + AI Assistant") e genera la
 * risposta grounded. Niente retrieval semantico/vector DB: la Knowledge
 * Base è piccola, viene passata per intero (filtrata per lingua) come
 * contesto.
 */

const SOURCES_MARKER = "---SOURCES---";
const MAX_MESSAGE_LENGTH = 2000;
const MAX_HISTORY_LENGTH = 10;

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
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
  return value.every((m) => {
    if (!m || typeof m !== "object") return false;
    const { role, content } = m as Record<string, unknown>;
    return (role === "user" || role === "assistant") && typeof content === "string";
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

Always answer in ${language === "it" ? "Italian" : "English"}, in first person as if you were speaking on Francesco's behalf (not as Francesco himself).

Knowledge Base:

${kbDump}

---

This is a strict formatting rule, not optional: every single response you write, with NO exceptions, MUST end with a line containing exactly ${SOURCES_MARKER} followed by one line per Knowledge Base document path (copy the "### path" lines above verbatim) that you actually used. If you used no document (e.g. an OUT_OF_SCOPE refusal), still write the marker on its own line with nothing after it. Never omit this block.

Example ending for an answer grounded on one document:
${SOURCES_MARKER}
knowledge-base/projects/antichita-fallavena.it.md`;
}

function parseAnswer(raw: string, validPaths: Set<string>): { answer: string; sources: string[] } {
  const idx = raw.indexOf(SOURCES_MARKER);
  if (idx === -1) return { answer: raw.trim(), sources: [] };

  const answer = raw.slice(0, idx).trim();
  const sources = raw
    .slice(idx + SOURCES_MARKER.length)
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => validPaths.has(line));

  return { answer, sources };
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
    return jsonResponse({ error: `"history" must be an array of at most ${MAX_HISTORY_LENGTH} {role, content} messages` }, 400);
  }
  const history = (rawHistory as ChatMessage[] | undefined) ?? [];

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return jsonResponse({ error: "Server misconfigured: missing GEMINI_API_KEY" }, 500);
  }
  const model = process.env.GEMINI_MODEL ?? "gemini-flash-latest";

  let docs: ReturnType<typeof loadKnowledgeBase>;
  try {
    docs = loadKnowledgeBase().filter((doc) => !doc.lang || doc.lang === language);
  } catch (err) {
    console.error("Failed to load knowledge base:", err);
    return jsonResponse({ error: "Server misconfigured: failed to load knowledge base" }, 500);
  }
  const validPaths = new Set(docs.map((doc) => doc.path));

  const contents = [
    ...history.map((m) => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content }],
    })),
    { role: "user", parts: [{ text: message }] },
  ];

  let upstream: Response;
  try {
    upstream = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, {
      method: "POST",
      headers: {
        "x-goog-api-key": apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: buildSystemPrompt(language, docs) }] },
        contents,
        generationConfig: { temperature: 0.3, maxOutputTokens: 1000 },
      }),
    });
  } catch (err) {
    console.error("Gemini fetch failed:", err);
    return jsonResponse({ error: "Failed to reach Gemini" }, 502);
  }

  if (!upstream.ok) {
    const detail = await upstream.text().catch(() => "");
    console.error(`Gemini error ${upstream.status}:`, detail);
    return jsonResponse({ error: `Gemini error: ${upstream.status}`, detail: detail.slice(0, 500) }, 502);
  }

  const data = (await upstream.json()) as {
    candidates?: { content?: { parts?: { text?: string }[] } }[];
  };
  const raw = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (typeof raw !== "string") {
    return jsonResponse({ error: "Unexpected Gemini response shape" }, 502);
  }

  return jsonResponse(parseAnswer(raw, validPaths));
};
