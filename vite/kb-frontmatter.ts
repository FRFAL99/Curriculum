import fs from "node:fs";
import matter from "gray-matter";
import type { Plugin } from "vite";

/**
 * Legge il frontmatter della knowledge base in build, non nel browser
 * (piano v3, Fase 27).
 *
 * `src/lib/knowledgeBase.ts` importa i `.md` con il suffisso `?kb`: questo
 * plugin li risolve in un modulo che esporta `{ data, content }` già
 * separati. Così `gray-matter`, `js-yaml`, `esprima` e il polyfill di
 * `Buffer` restano in Node e non finiscono nel bundle.
 *
 * Il modulo è JSON: il frontmatter non deve contenere valori che JSON non
 * sa rappresentare (date YAML non tra virgolette diventerebbero stringhe).
 * Lo controlla `tests/knowledge-base.test.ts`.
 */

export const KB_QUERY = "?kb";

export function parseKbFile(raw: string): { data: Record<string, unknown>; content: string } {
  // gray-matter tiene una cache per contenuto e restituisce lo stesso oggetto:
  // si copia, così chi lo riceve non può sporcare la cache.
  const { data, content } = matter(raw);
  return { data: { ...data }, content };
}

export function kbFrontmatter(): Plugin {
  return {
    name: "kb-frontmatter",
    enforce: "pre",
    load(id) {
      if (!id.endsWith(".md" + KB_QUERY)) return null;
      const file = id.slice(0, -KB_QUERY.length);
      this.addWatchFile(file);
      const parsed = parseKbFile(fs.readFileSync(file, "utf-8"));
      return { code: `export default ${JSON.stringify(parsed)};`, map: null };
    },
  };
}
