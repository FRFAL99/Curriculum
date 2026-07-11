import { marked } from "marked";

/**
 * Renderizza markdown inline (grassetto, link, corsivo) in HTML, senza
 * avvolgere il risultato in un <p>. Serve per i campi di testo che oggi
 * arrivano dalla Knowledge Base (es. descrizioni, responsabilità) e che
 * prima erano stringhe HTML grezze dentro `translations.ts`.
 *
 * Uso previsto: dangerouslySetInnerHTML, esattamente come nel codice
 * pre-Fase 8 — cambia solo la fonte del testo (Markdown invece di HTML
 * scritto a mano), non il meccanismo di rendering.
 */
export function renderInline(markdown: string): string {
  return marked.parseInline(markdown, { async: false }) as string;
}

/**
 * Renderizza un blocco Markdown completo (paragrafi, liste, titoli) in HTML.
 * Usato per il body dei documenti della Knowledge Base (es. il Knowledge
 * Document Viewer della Fase 9).
 */
export function renderBlock(markdown: string): string {
  return marked.parse(markdown, { async: false }) as string;
}

/**
 * Estrae la sezione "## Overview" da un body multi-sezione (Fase 9, es.
 * i progetti con Overview/Problem/Solution/Challenges), da usare come
 * teaser breve nelle card. Se il body non ha sezioni (es. developer
 * notes, ancora a paragrafo singolo), ritorna il body intero.
 */
export function getOverviewExcerpt(body: string): string {
  const match = body.match(/##\s+Overview\s*\n([\s\S]*?)(?=\n##\s|$)/i);
  return (match ? match[1] : body).trim();
}
