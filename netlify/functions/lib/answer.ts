/**
 * Come si legge la risposta del modello (piano v4).
 *
 * Il modello scrive la risposta, poi due blocchi introdotti da un marcatore
 * su una riga a sé: le domande suggerite e le fonti. Qui stanno le funzioni
 * pure che separano le parti, sia a risposta completa (`parseAnswer`) sia
 * mentre arriva in streaming (`visibleAnswer`), più il lettore degli eventi
 * SSE di OpenRouter.
 */

export const SOURCES_MARKER = "---SOURCES---";
export const FOLLOWUPS_MARKER = "---FOLLOWUPS---";
const MARKERS = [SOURCES_MARKER, FOLLOWUPS_MARKER];

export const MAX_FOLLOWUPS = 3;
const MAX_FOLLOWUP_LENGTH = 120;

const SCOPE_LABELS = ["IN_SCOPE", "PARTIALLY_IN_SCOPE", "OUT_OF_SCOPE"];
const SCOPE_LABEL_PREFIX = /^(IN_SCOPE|PARTIALLY_IN_SCOPE|OUT_OF_SCOPE)\s*:?\s*\n+/i;
const SCOPE_LABEL_ALONE = /^(IN_SCOPE|PARTIALLY_IN_SCOPE|OUT_OF_SCOPE)\s*:?\s*$/i;

export interface ParsedAnswer {
  answer: string;
  sources: string[];
  followups: string[];
}

/** Indice del primo marcatore nel testo, o -1. */
function firstMarker(raw: string): number {
  const found = MARKERS.map((m) => raw.indexOf(m)).filter((i) => i !== -1);
  return found.length ? Math.min(...found) : -1;
}

/** Le righe del blocco che segue `marker`, fino al marcatore successivo. */
function blockLines(raw: string, marker: string): string[] {
  const start = raw.indexOf(marker);
  if (start === -1) return [];
  const rest = raw.slice(start + marker.length);
  const end = firstMarker(rest);
  return (end === -1 ? rest : rest.slice(0, end))
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

function cleanFollowup(line: string): string {
  return line
    .replace(/^([-*•]|\d+[.)])\s+/, "")
    .replace(/^["“'«]+|["”'»]+$/g, "")
    .trim();
}

export function parseAnswer(raw: string, validPaths: Set<string>): ParsedAnswer {
  const cut = firstMarker(raw);
  const answer = (cut === -1 ? raw : raw.slice(0, cut)).trim().replace(SCOPE_LABEL_PREFIX, "");
  const sources = [...new Set(blockLines(raw, SOURCES_MARKER).filter((line) => validPaths.has(line)))];
  const followups = [
    ...new Set(
      blockLines(raw, FOLLOWUPS_MARKER)
        .map(cleanFollowup)
        .filter((q) => q.length > 0 && q.length <= MAX_FOLLOWUP_LENGTH),
    ),
  ].slice(0, MAX_FOLLOWUPS);
  return { answer, sources, followups };
}

/**
 * La parte della risposta che si può già mostrare mentre arriva.
 *
 * Cresce sempre per aggiunta (ogni valore è un prefisso del successivo), così
 * la function può mandare al browser solo la differenza. Trattiene:
 * - l'inizio, finché potrebbe ancora essere un'etichetta di scope;
 * - la coda, finché potrebbe essere l'inizio di un marcatore;
 * - tutto ciò che segue il primo marcatore.
 */
export function visibleAnswer(raw: string): string {
  let text = raw.trimStart();

  const upper = text.toUpperCase();
  if (SCOPE_LABELS.some((label) => label.startsWith(upper)) || SCOPE_LABEL_ALONE.test(text)) return "";
  text = text.replace(SCOPE_LABEL_PREFIX, "").trimStart();

  const cut = firstMarker(text);
  if (cut !== -1) return text.slice(0, cut);

  for (let keep = Math.min(text.length, Math.max(...MARKERS.map((m) => m.length)) - 1); keep > 0; keep--) {
    const tail = text.slice(-keep);
    if (MARKERS.some((m) => m.startsWith(tail))) return text.slice(0, -keep);
  }
  return text;
}

/**
 * Gli eventi `data:` di uno stream SSE, già letti come JSON. Salta i
 * commenti (OpenRouter manda `: OPENROUTER PROCESSING` mentre il modello è
 * in coda) e si ferma a `[DONE]`.
 */
export async function* readSse(body: ReadableStream<Uint8Array>): AsyncGenerator<unknown> {
  const reader = body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  try {
    for (;;) {
      const { value, done } = await reader.read();
      buffer += done ? decoder.decode() : decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = done ? "" : (lines.pop() ?? "");
      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed.startsWith("data:")) continue;
        const data = trimmed.slice(5).trim();
        if (data === "[DONE]") return;
        try {
          yield JSON.parse(data);
        } catch {
          // una riga malformata non deve fermare la risposta
        }
      }
      if (done) return;
    }
  } finally {
    reader.releaseLock();
  }
}
