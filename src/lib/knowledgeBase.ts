import matter from "gray-matter";
import type { Language } from "../context/translations";

/**
 * Knowledge Base loader — Fase 8.
 *
 * Single Source of Truth: ogni documento sotto /knowledge-base è letto qui
 * a build-time (import.meta.glob con `eager: true` = nessuna fetch a
 * runtime, i contenuti finiscono nel bundle come stringhe statiche, esattamente
 * come prima con i .json — cambia solo il formato sorgente).
 *
 * I componenti React NON devono più contenere testo hardcoded: leggono da
 * qui tramite i getter esportati in fondo al file.
 */

// Vite: pattern ancorato alla root del progetto (vite.config.ts di default
// non cambia `root`, quindi "/knowledge-base" corrisponde alla cartella
// alla radice del repo, accanto a src/).
const rawFiles = import.meta.glob("/knowledge-base/**/*.md", {
  eager: true,
  query: "?raw",
  import: "default",
}) as Record<string, string>;

export interface KnowledgeDoc<TFrontmatter = Record<string, unknown>> {
  /** Percorso relativo, es. "knowledge-base/projects/antichita-fallavena.it.md" */
  path: string;
  /** Nome file senza suffisso lingua ed estensione, es. "antichita-fallavena" */
  slug: string;
  /** Assente per i documenti lang-neutral (skills, contacts, socials) */
  lang?: Language;
  type: string;
  frontmatter: TFrontmatter;
  /** Corpo Markdown, frontmatter escluso */
  body: string;
}

function parseAll(): KnowledgeDoc[] {
  return Object.entries(rawFiles).map(([path, raw]) => {
    const { data, content } = matter(raw);
    const filename = path.split("/").pop()!.replace(/\.md$/, "");
    const langMatch = filename.match(/\.(it|en)$/);
    const lang = langMatch ? (langMatch[1] as Language) : undefined;
    const slug = lang ? filename.replace(/\.(it|en)$/, "") : filename;

    return {
      path: path.replace(/^\/+/, ""),
      slug,
      lang,
      type: typeof data.type === "string" ? data.type : "unknown",
      frontmatter: data,
      body: content.trim(),
    };
  });
}

const ALL_DOCS: KnowledgeDoc[] = parseAll();

function byOrder(a: KnowledgeDoc, b: KnowledgeDoc): number {
  const oa = typeof a.frontmatter.order === "number" ? a.frontmatter.order : 0;
  const ob = typeof b.frontmatter.order === "number" ? b.frontmatter.order : 0;
  return oa - ob;
}

function byType(type: string, lang?: Language): KnowledgeDoc[] {
  return ALL_DOCS.filter((d) => d.type === type && (lang ? d.lang === lang : true)).sort(byOrder);
}

// ---------------------------------------------------------------------------
// Tipi di frontmatter per documento (solo i campi che i componenti leggono
// oggi; estendibili liberamente in fasi future senza rompere i getter).
// ---------------------------------------------------------------------------

export interface AboutFrontmatter {
  name: string;
  role: string;
  location: string;
  availability: string;
  languages: { name: string; level: string }[];
  softSkills: string[];
}

export interface ExperienceFrontmatter {
  slug: string;
  role: string;
  company: string;
  dateStart: string;
  dateEnd: string | null;
  order: number;
  skills: string[];
  responsibilities: string[];
}

export interface EducationFrontmatter {
  slug: string;
  degree: string;
  institution: string;
  grade: string;
  dateStart: string;
  dateEnd: string;
  order: number;
}

export interface ProjectFrontmatter {
  slug: string;
  title: string;
  stack: string[];
  image: string;
  demoUrl: string;
  githubUrl: string;
  order: number;
}

export interface DeveloperNoteFrontmatter {
  slug: string;
  title: string;
  date: string;
  order: number;
  /** Estratto breve per la card indice; se assente si usa getOverviewExcerpt. */
  summary?: string;
  /** Tag editoriali mostrati nella card e nel lettore. */
  tags?: string[];
  /** Campi legacy stile LOG/changelog, opzionali (non usati nello stile blog). */
  logId?: string;
  status?: string;
}

export interface SkillCategory {
  key: string;
  icon: string;
  labels: { it: string; en: string };
  skills: string[];
}

export interface SkillsFrontmatter {
  categories: SkillCategory[];
}

export interface ContactFrontmatter {
  email: string;
  phone: string;
  phoneHref: string;
  location: string;
}

export interface SocialFrontmatter {
  github: string;
  githubLabel: string;
  linkedin: string;
  linkedinLabel: string;
}

// ---------------------------------------------------------------------------
// Getter pubblici — questa è l'unica API che i componenti devono usare.
// ---------------------------------------------------------------------------

export function getAbout(lang: Language): KnowledgeDoc<AboutFrontmatter> | undefined {
  return byType("about", lang)[0] as unknown as KnowledgeDoc<AboutFrontmatter> | undefined;
}

export function getExperience(lang: Language): KnowledgeDoc<ExperienceFrontmatter>[] {
  return byType("experience", lang) as unknown as KnowledgeDoc<ExperienceFrontmatter>[];
}

export function getEducation(lang: Language): KnowledgeDoc<EducationFrontmatter>[] {
  return byType("education", lang) as unknown as KnowledgeDoc<EducationFrontmatter>[];
}

export function getProjects(lang: Language): KnowledgeDoc<ProjectFrontmatter>[] {
  return byType("project", lang) as unknown as KnowledgeDoc<ProjectFrontmatter>[];
}

export function getDeveloperNotes(lang: Language): KnowledgeDoc<DeveloperNoteFrontmatter>[] {
  return byType("developer-note", lang) as unknown as KnowledgeDoc<DeveloperNoteFrontmatter>[];
}

export function getSkills(): KnowledgeDoc<SkillsFrontmatter> | undefined {
  return byType("skills")[0] as unknown as KnowledgeDoc<SkillsFrontmatter> | undefined;
}

export function getContacts(): KnowledgeDoc<ContactFrontmatter> | undefined {
  return byType("contact")[0] as unknown as KnowledgeDoc<ContactFrontmatter> | undefined;
}

export function getSocials(): KnowledgeDoc<SocialFrontmatter> | undefined {
  return byType("social")[0] as unknown as KnowledgeDoc<SocialFrontmatter> | undefined;
}

/**
 * Tutti i documenti, non filtrati. Non ancora usato da nessun componente:
 * pensato per il retrieval dell'AI Assistant (Fase 10) e per il Knowledge
 * Document Viewer (Fase 9), che avranno bisogno di iterare/cercare su tutta
 * la Knowledge Base invece che su un singolo tipo.
 */
export function getAllDocs(): KnowledgeDoc[] {
  return ALL_DOCS;
}
