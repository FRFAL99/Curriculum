import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import type { Plugin } from "vite";

/**
 * Genera l'<head> di index.html dalla knowledge base (piano v1, Fase 21).
 *
 * Titolo, description e Open Graph vengono da `about.en.md`: l'anteprima
 * del link è in inglese per scelta (piano v1, decisione 2); l'immagine è
 * public/og.png (Fase 22). Nessun testo su
 * Francesco è scritto in index.html, che contiene solo il segnaposto.
 */

const PLACEHOLDER = "<!-- kb-head -->";
const DESCRIPTION_MAX = 160;
/** Generata da `npm run og` (scripts/og-image.mjs) e committata in public/. */
const OG_IMAGE = "og.png";

interface About {
  name: string;
  role: string;
  body: string;
}

function readAbout(root: string): About {
  const file = path.join(root, "knowledge-base", "about.en.md");
  const { data, content } = matter(fs.readFileSync(file, "utf-8"));
  if (typeof data.name !== "string" || typeof data.role !== "string") {
    throw new Error(`kb-head: name o role mancanti in ${file}`);
  }
  return { name: data.name, role: data.role, body: content };
}

/** Le prime frasi del corpo, senza superare DESCRIPTION_MAX (almeno una frase). */
export function describe(body: string): string {
  const text = body.replace(/[*_`#>]/g, "").replace(/\s+/g, " ").trim();
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

export function renderHead(about: About, siteUrl?: string, assetUrl = siteUrl): string {
  const title = `${about.name} — ${about.role}`;
  const description = describe(about.body);
  const tags = [
    `<title>${escape(title)}</title>`,
    `<meta name="description" content="${escape(description)}" />`,
    `<meta name="author" content="${escape(about.name)}" />`,
    `<meta property="og:type" content="profile" />`,
    `<meta property="og:site_name" content="${escape(about.name)}" />`,
    `<meta property="og:title" content="${escape(title)}" />`,
    `<meta property="og:description" content="${escape(description)}" />`,
    `<meta property="og:locale" content="en_US" />`,
    `<meta property="og:locale:alternate" content="it_IT" />`,
    `<meta name="twitter:card" content="summary_large_image" />`,
    `<meta name="twitter:title" content="${escape(title)}" />`,
    `<meta name="twitter:description" content="${escape(description)}" />`,
  ];
  if (siteUrl) {
    const url = siteUrl.replace(/\/+$/, "") + "/";
    const image = `${(assetUrl ?? url).replace(/\/+$/, "")}/${OG_IMAGE}`;
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
  return tags.join("\n    ");
}

export function kbHead(): Plugin {
  let root = process.cwd();
  return {
    name: "kb-head",
    configResolved(config) {
      root = config.root;
    },
    transformIndexHtml(html) {
      if (!html.includes(PLACEHOLDER)) {
        throw new Error(`kb-head: segnaposto ${PLACEHOLDER} assente da index.html`);
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
      return html.replace(PLACEHOLDER, renderHead(readAbout(root), siteUrl, assetUrl ?? siteUrl));
    },
  };
}
