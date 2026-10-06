import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { describe, expect, it } from "vitest";

/**
 * Controlla la knowledge base vera (piano v2, Fase 24).
 *
 * La regola «ogni documento esiste in coppia .it.md / .en.md» e i campi che i
 * getter di `src/lib/knowledgeBase.ts` leggono senza verificarli erano affidati
 * alla sola disciplina: una coppia rotta non ferma né lint né build, e il sito
 * mostra una sezione vuota in una lingua sola. Se un test qui fallisce, si
 * sistema il contenuto in entrambe le lingue, non il test.
 */

const KB_ROOT = path.join(process.cwd(), "knowledge-base");

interface Doc {
  /** Percorso relativo alla radice del repo, es. "knowledge-base/about.it.md" */
  path: string;
  /** Nome senza suffisso di lingua né estensione, con la cartella: "projects/portfolio-v2" */
  key: string;
  lang?: "it" | "en";
  data: Record<string, unknown>;
  body: string;
}

function walk(dir: string): string[] {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) return walk(full);
    return entry.name.endsWith(".md") ? [full] : [];
  });
}

const DOCS: Doc[] = walk(KB_ROOT).map((file) => {
  const rel = path.relative(KB_ROOT, file).split(path.sep).join("/");
  const withoutExt = rel.replace(/\.md$/, "");
  const langMatch = withoutExt.match(/\.(it|en)$/);
  const { data, content } = matter(fs.readFileSync(file, "utf-8"));
  return {
    path: `knowledge-base/${rel}`,
    key: langMatch ? withoutExt.replace(/\.(it|en)$/, "") : withoutExt,
    lang: langMatch ? (langMatch[1] as "it" | "en") : undefined,
    data: data as Record<string, unknown>,
    body: content.trim(),
  };
});

/** I documenti senza lingua: valgono per entrambe (ADR-001). */
const LANG_NEUTRAL = ["skills", "config/contacts", "config/socials"];

/** Campi che i getter di src/lib/knowledgeBase.ts leggono dando per scontato che ci siano. */
const REQUIRED: Record<string, string[]> = {
  about: ["name", "role", "location", "availability", "languages", "softSkills"],
  experience: ["slug", "role", "company", "dateStart", "order", "skills", "responsibilities"],
  education: ["slug", "degree", "institution", "grade", "dateStart", "dateEnd", "order"],
  project: ["slug", "title", "stack", "image", "demoUrl", "githubUrl", "order"],
  "developer-note": ["slug", "title", "date", "order"],
  skills: ["categories"],
  contact: ["email", "phone", "phoneHref", "location"],
  social: ["github", "githubLabel", "linkedin", "linkedinLabel"],
};

const localized = DOCS.filter((d) => d.lang);

it("trova i documenti della knowledge base", () => {
  expect(DOCS.length).toBeGreaterThan(0);
  expect(localized.length).toBeGreaterThan(0);
});

describe("coppie it/en", () => {
  const keys = [...new Set(localized.map((d) => d.key))].sort();

  it.each(keys)("%s esiste in italiano e in inglese", (key) => {
    const langs = localized.filter((d) => d.key === key).map((d) => d.lang);
    expect(langs.sort()).toEqual(["en", "it"]);
  });

  it.each(keys)("%s ha lo stesso type nelle due lingue", (key) => {
    const types = new Set(localized.filter((d) => d.key === key).map((d) => d.data.type));
    expect([...types]).toHaveLength(1);
  });

  it.each(keys)("%s ha lo stesso slug nelle due lingue", (key) => {
    const slugs = new Set(localized.filter((d) => d.key === key).map((d) => d.data.slug));
    expect([...slugs]).toHaveLength(1);
  });
});

describe("frontmatter", () => {
  it.each(DOCS.map((d) => [d.path, d] as const))("%s dichiara un type noto", (_path, doc) => {
    expect(Object.keys(REQUIRED)).toContain(doc.data.type);
  });

  it.each(DOCS.map((d) => [d.path, d] as const))("%s ha i campi obbligatori", (_path, doc) => {
    const required = REQUIRED[doc.data.type as string] ?? [];
    const missing = required.filter((field) => doc.data[field] === undefined);
    expect(missing).toEqual([]);
  });

  it.each(localized.map((d) => [d.path, d] as const))(
    "%s ha lang coerente col nome del file",
    (_path, doc) => {
      expect(doc.data.lang).toBe(doc.lang);
    },
  );

  it.each(DOCS.filter((d) => !d.lang).map((d) => [d.path, d] as const))(
    "%s è lang-neutral e non dichiara lang",
    (_path, doc) => {
      expect(LANG_NEUTRAL).toContain(doc.key);
      expect(doc.data.lang).toBeUndefined();
    },
  );

  it.each(DOCS.filter((d) => d.data.type === "project").map((d) => [d.path, d] as const))(
    "%s punta a un'immagine che esiste in public/",
    (_path, doc) => {
      const image = doc.data.image as string;
      expect(fs.existsSync(path.join(process.cwd(), "public", image))).toBe(true);
    },
  );
});

describe("corpo", () => {
  /**
   * `skills.md` e i file di `config/` tengono tutto nel frontmatter, e il corpo
   * di `education` è la tesi, che non tutti i titoli di studio hanno
   * (`src/windows/Resume/index.tsx:143` lo rende solo se c'è).
   */
  const withBody = DOCS.filter(
    (d) => !["skills", "contact", "social", "education"].includes(d.data.type as string),
  );

  it.each(withBody.map((d) => [d.path, d] as const))("%s non è vuoto", (_path, doc) => {
    expect(doc.body.length).toBeGreaterThan(0);
  });
});
