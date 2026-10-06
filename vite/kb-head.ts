import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import type { Plugin } from "vite";

/**
 * Genera dalla knowledge base le parti di index.html che parlano di
 * Francesco (piano v1):
 * - Fase 21: `<head>` con titolo, description, Open Graph e Twitter card;
 * - Fase 22: l'immagine di anteprima public/og.png;
 * - Fase 23: un profilo statico dentro `#root`, per chi non esegue
 *   JavaScript, e lo JSON-LD `Person`.
 *
 * Tutto viene da `about.en.md` e `config/*.md`: l'anteprima è in inglese per
 * scelta (piano v1, decisione 2). index.html contiene solo i segnaposto.
 */

const HEAD_PLACEHOLDER = "<!-- kb-head -->";
const ROOT_PLACEHOLDER = "<!-- kb-static -->";
const DESCRIPTION_MAX = 160;
/** Generata da `npm run og` (scripts/og-image.mjs) e committata in public/. */
const OG_IMAGE = "og.png";

export interface Profile {
  name: string;
  role: string;
  location?: string;
  body: string;
  email?: string;
  github?: string;
  linkedin?: string;
}

function frontmatter(root: string, file: string): { data: Record<string, unknown>; content: string } {
  const { data, content } = matter(fs.readFileSync(path.join(root, "knowledge-base", file), "utf-8"));
  return { data, content };
}

const str = (v: unknown): string | undefined => (typeof v === "string" && v.trim() ? v : undefined);

function readProfile(root: string): Profile {
  const about = frontmatter(root, "about.en.md");
  const contacts = frontmatter(root, "config/contacts.md").data;
  const socials = frontmatter(root, "config/socials.md").data;
  const name = str(about.data.name);
  const role = str(about.data.role);
  if (!name || !role) throw new Error("kb-head: name o role mancanti in about.en.md");
  return {
    name,
    role,
    location: str(about.data.location),
    body: about.content,
    email: str(contacts.email),
    github: str(socials.github),
    linkedin: str(socials.linkedin),
  };
}

/** Il corpo Markdown come paragrafi di testo semplice. */
function paragraphs(body: string): string[] {
  return body
    .split(/\n\s*\n/)
    .map((p) => p.replace(/[*_`#>]/g, "").replace(/\s+/g, " ").trim())
    .filter(Boolean);
}

/** Le prime frasi del corpo, senza superare DESCRIPTION_MAX (almeno una frase). */
export function describe(body: string): string {
  const text = paragraphs(body).join(" ");
  const sentences = text.match(/[^.!?]+[.!?]+/g) ?? [text];
  let out = sentences[0].trim();
  for (const s of sentences.slice(1)) {
    const next = `${out} ${s.trim()}`;
    if (next.length > DESCRIPTION_MAX) break;
    out = next;
  }
  return out;
}

function escape(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

const trimSlash = (url: string) => url.replace(/\/+$/, "");

export function renderHead(p: Profile, siteUrl?: string, assetUrl = siteUrl): string {
  const title = `${p.name} — ${p.role}`;
  const description = describe(p.body);
  const tags = [
    `<title>${escape(title)}</title>`,
    `<meta name="description" content="${escape(description)}" />`,
    `<meta name="author" content="${escape(p.name)}" />`,
    `<meta property="og:type" content="profile" />`,
    `<meta property="og:site_name" content="${escape(p.name)}" />`,
    `<meta property="og:title" content="${escape(title)}" />`,
    `<meta property="og:description" content="${escape(description)}" />`,
    `<meta property="og:locale" content="en_US" />`,
    `<meta property="og:locale:alternate" content="it_IT" />`,
    `<meta name="twitter:card" content="summary_large_image" />`,
    `<meta name="twitter:title" content="${escape(title)}" />`,
    `<meta name="twitter:description" content="${escape(description)}" />`,
  ];
  const url = siteUrl ? `${trimSlash(siteUrl)}/` : undefined;
  if (url) {
    const image = `${trimSlash(assetUrl ?? url)}/${OG_IMAGE}`;
    tags.push(
      `<meta property="og:url" content="${escape(url)}" />`,
      `<link rel="canonical" href="${escape(url)}" />`,
      `<meta property="og:image" content="${escape(image)}" />`,
      `<meta property="og:image:width" content="1200" />`,
      `<meta property="og:image:height" content="630" />`,
      `<meta property="og:image:alt" content="${escape(title)}" />`,
      `<meta name="twitter:image" content="${escape(image)}" />`,
    );
  }

  const person: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: p.name,
    jobTitle: p.role,
    description,
  };
  if (url) person.url = url;
  if (p.email) person.email = `mailto:${p.email}`;
  if (p.location) person.homeLocation = { "@type": "Place", name: p.location };
  const sameAs = [p.github, p.linkedin].filter(Boolean);
  if (sameAs.length) person.sameAs = sameAs;
  // `<` escapato: il JSON non può chiudere lo <script> che lo contiene.
  const jsonLd = JSON.stringify(person).replace(/</g, "\\u003c");
  tags.push(`<script type="application/ld+json">${jsonLd}</script>`);

  // Con JavaScript il profilo statico non si vede mai: React lo sostituisce
  // al montaggio, e fino ad allora la classe `js` lo nasconde (niente flash).
  tags.push(
    `<script>document.documentElement.classList.add("js")</script>`,
    `<style>${STATIC_CSS}</style>`,
  );
  return tags.join("\n    ");
}

// Usa le variabili di src/styles/tokens.css, che il CSS del bundle carica anche
// senza JavaScript: senza `data-theme` vale il tema di default, lo scuro.
const STATIC_CSS = [
  ".js .kb-static{display:none}",
  ".kb-static{box-sizing:border-box;max-width:40rem;margin:0 auto;padding:4rem 1rem;",
  "font-family:var(--font-sans,sans-serif);line-height:1.6;color:var(--text-primary,#f2ede4)}",
  ".kb-static h1{font-family:var(--font-mono,monospace);font-size:2rem;margin:0 0 .25rem}",
  ".kb-static .role{color:var(--accent,#e2853f);font-size:1.25rem;margin:0 0 .25rem}",
  ".kb-static .where{color:var(--text-secondary,#b3a99a);margin:0 0 1.5rem}",
  ".kb-static a{color:var(--accent,#e2853f)}",
  ".kb-static ul{padding-left:1.25rem}",
].join("");

export function renderStatic(p: Profile): string {
  const links = [
    p.email && `<li><a href="mailto:${escape(p.email)}">${escape(p.email)}</a></li>`,
    p.linkedin && `<li><a href="${escape(p.linkedin)}">LinkedIn</a></li>`,
    p.github && `<li><a href="${escape(p.github)}">GitHub</a></li>`,
  ].filter(Boolean);
  return [
    `<main class="kb-static">`,
    `<h1>${escape(p.name)}</h1>`,
    `<p class="role">${escape(p.role)}</p>`,
    p.location ? `<p class="where">${escape(p.location)}</p>` : "",
    ...paragraphs(p.body).map((t) => `<p>${escape(t)}</p>`),
    links.length ? `<ul>${links.join("")}</ul>` : "",
    `</main>`,
  ]
    .filter(Boolean)
    .join("");
}

export function kbHead(): Plugin {
  let root = process.cwd();
  return {
    name: "kb-head",
    configResolved(config) {
      root = config.root;
    },
    transformIndexHtml(html) {
      for (const placeholder of [HEAD_PLACEHOLDER, ROOT_PLACEHOLDER]) {
        if (!html.includes(placeholder)) {
          throw new Error(`kb-head: segnaposto ${placeholder} assente da index.html`);
        }
      }
      if (!fs.existsSync(path.join(root, "public", OG_IMAGE))) {
        throw new Error(`kb-head: public/${OG_IMAGE} assente, lancia \`npm run og\``);
      }
      // Netlify imposta URL in build (dominio principale del sito, anche
      // nelle anteprime): senza, og:url, canonical e og:image si omettono.
      // L'immagine di un'anteprima di deploy punta all'anteprima stessa
      // (DEPLOY_PRIME_URL), perché in produzione og.png potrebbe non esserci ancora.
      const { URL: siteUrl, CONTEXT, DEPLOY_PRIME_URL } = process.env;
      const assetUrl = CONTEXT && CONTEXT !== "production" ? DEPLOY_PRIME_URL : siteUrl;
      const profile = readProfile(root);
      return html
        .replace(HEAD_PLACEHOLDER, renderHead(profile, siteUrl, assetUrl ?? siteUrl))
        .replace(ROOT_PLACEHOLDER, renderStatic(profile));
    },
  };
}
