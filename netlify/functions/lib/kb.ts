import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";

/**
 * Loader della Knowledge Base per la Netlify Function (Fase 10).
 *
 * `src/lib/knowledgeBase.ts` usa `import.meta.glob`, un'API solo Vite:
 * non è utilizzabile qui, dove il bundling è fatto da esbuild in Node
 * puro (vedi `netlify.toml`, `included_files` per far includere i .md
 * nel bundle della function). I dati restano un'unica fonte di verità
 * (i file `.md` sotto `knowledge-base/`); questa è una seconda, minima
 * implementazione del loader per il runtime Node.
 */

export interface KnowledgeDoc {
  path: string;
  lang?: string;
  frontmatter: Record<string, unknown>;
  body: string;
}

const KB_ROOT = path.join(process.cwd(), "knowledge-base");

function walk(dir: string): string[] {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) return walk(full);
    return entry.name.endsWith(".md") ? [full] : [];
  });
}

export function loadKnowledgeBase(): KnowledgeDoc[] {
  return walk(KB_ROOT).map((file) => {
    const raw = fs.readFileSync(file, "utf-8");
    const { data, content } = matter(raw);
    const relPath = path.relative(process.cwd(), file).split(path.sep).join("/");
    return {
      path: relPath,
      lang: typeof data.lang === "string" ? data.lang : undefined,
      frontmatter: data,
      body: content.trim(),
    };
  });
}
