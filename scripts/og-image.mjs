// Genera public/og.png, l'immagine di anteprima del link (piano v1, Fase 22).
//
// Nome, ruolo e luogo vengono da knowledge-base/about.en.md: se cambiano,
// si rilancia `npm run og` e si committa il PNG. Serve un Chromium: quello
// indicato da CHROMIUM_PATH, altrimenti Google Chrome installato.
import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { chromium } from "playwright-core";

const root = path.resolve(import.meta.dirname, "..");
const { data } = matter(fs.readFileSync(path.join(root, "knowledge-base/about.en.md"), "utf-8"));
for (const key of ["name", "role", "location"]) {
  if (typeof data[key] !== "string") throw new Error(`og: ${key} mancante in about.en.md`);
}

const escape = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

// Colori del tema chiaro di src/styles/tokens.css.
const html = `<!doctype html>
<html><head><meta charset="utf-8">
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500&family=JetBrains+Mono:wght@500;600&display=block" rel="stylesheet">
<style>
  html, body { margin: 0; width: 1200px; height: 630px; }
  body {
    background: radial-gradient(circle at 78% 30%, rgba(168, 84, 31, 0.08), transparent 55%), #faf8f4;
    color: #231f1a; font-family: Inter, sans-serif; position: relative; overflow: hidden;
  }
  svg { position: absolute; inset: 0; }
  .text { position: absolute; left: 96px; bottom: 120px; right: 96px; }
  h1 { font-family: "JetBrains Mono", monospace; font-weight: 600; font-size: 76px;
       letter-spacing: -1.5px; margin: 0 0 20px; }
  .role { font-size: 40px; font-weight: 500; color: #a8541f; margin: 0 0 28px; }
  .where { font-family: "JetBrains Mono", monospace; font-size: 24px; color: #6b6255; margin: 0; }
  .rule { position: absolute; left: 96px; right: 96px; bottom: 72px; height: 1px;
          background: rgba(35, 28, 20, 0.12); }
</style></head><body>
<svg width="1200" height="630" viewBox="0 0 1200 630" fill="none">
  <path d="M990 630 C 1080 540, 970 420, 1050 310 S 1090 150, 1110 70"
        stroke="#a8541f" stroke-opacity="0.35" stroke-width="3" stroke-linecap="round"/>
  <circle cx="1050" cy="310" r="7" fill="#a8541f" fill-opacity="0.55"/>
  <circle cx="1110" cy="70" r="9" fill="#a8541f"/>
</svg>
<div class="text">
  <h1>${escape(data.name)}</h1>
  <p class="role">${escape(data.role)}</p>
  <p class="where">${escape(data.location)}</p>
</div>
<div class="rule"></div>
</body></html>`;

const executablePath = process.env.CHROMIUM_PATH;
const browser = await chromium.launch(executablePath ? { executablePath } : { channel: "chrome" });
const page = await browser.newPage({ viewport: { width: 1200, height: 630 } });
await page.setContent(html, { waitUntil: "networkidle" });
await page.evaluate(() => document.fonts.ready);
const out = path.join(root, "public/og.png");
await page.screenshot({ path: out });
await browser.close();
console.log(`og: scritto ${path.relative(root, out)} per «${data.name} — ${data.role}»`);
