# Come funziona il sito, oggi

Fotografia del sito **adesso**. Quando una Fase cambia una delle cose scritte qui, questo file si
aggiorna nella stessa PR; la cronaca di come ci si è arrivati sta in [../devlog.md](../devlog.md).

## In una frase

Una landing page React 19 + TypeScript + Vite, pubblicata su Netlify, con quattro tab (Home,
Resume, Projects, Notes) e un AI Assistant che risponde sulla Knowledge Base tramite una Netlify
Function che chiama OpenRouter.

## La Knowledge Base è la fonte unica dei contenuti

Tutto ciò che il sito dice su Francesco sta in `knowledge-base/**` (Markdown + frontmatter). La
scelta e le alternative scartate sono in [../adr/0001-knowledge-base.md](../adr/0001-knowledge-base.md).

```
knowledge-base/
  about.it.md, about.en.md
  config/            contacts.md, socials.md (lang-neutral)
  experience/        un .it.md + .en.md per ruolo
  education/         un .it.md + .en.md per titolo di studio
  projects/          un .it.md + .en.md per progetto (case study)
  developer-notes/   un .it.md + .en.md per articolo long-form
  skills.md          lang-neutral, etichette di categoria bilingui nel frontmatter
```

La stessa cartella è letta da due loader diversi:

| Chi legge | Loader                         | Come                                                        |
| --------- | ------------------------------ | ----------------------------------------------------------- |
| La UI     | `src/lib/knowledgeBase.ts`     | `import.meta.glob` con `?kb` a build time: il plugin `vite/kb-frontmatter.ts` separa frontmatter e corpo con `gray-matter` in Node, nel browser arriva JSON |
| L'AI      | `netlify/functions/lib/kb.ts`  | `fs` a runtime nella function; i `.md` arrivano nel bundle grazie a `included_files` in `netlify.toml` |

`src/context/translations.ts` contiene **solo** etichette di interfaccia, mai contenuto.

## L'`<head>` della pagina

`index.html` non contiene testo su Francesco: i segnaposto `<!-- kb-head -->` e `<!-- kb-static -->`
vengono sostituiti in build (e in `npm run dev`) dal plugin `vite/kb-head.ts`, che legge
`knowledge-base/about.en.md` e `config/*.md` e scrive `<title>` («nome — ruolo»), meta description (le prime frasi del corpo, ≤ 160 caratteri),
Open Graph, Twitter card e uno JSON-LD `Person`. L'anteprima è in inglese per scelta (piano v1); `og:url` e `canonical`
usano la variabile `URL` che Netlify imposta in build, e mancano nelle build locali.

L'immagine di anteprima è `public/og.png` (1200×630), **committata**: la genera `npm run og`
(`scripts/og-image.mjs`) leggendo nome, ruolo e luogo da `about.en.md`, con un Chromium
(`CHROMIUM_PATH`, altrimenti Google Chrome installato). La build fallisce se manca. Nelle
anteprime di deploy `og:image` punta all'anteprima stessa (`DEPLOY_PRIME_URL`), in produzione a
`URL`.

Dentro `#root` lo stesso plugin mette un profilo statico (`<main class="kb-static">`: nome, ruolo,
luogo, riassunto, email, LinkedIn, GitHub) per chi non esegue JavaScript. Con JavaScript non si
vede mai: uno script inline nel `<head>` aggiunge la classe `js` a `<html>`, che lo nasconde, e
React lo sostituisce al montaggio. Usa le variabili di `tokens.css`, quindi senza JavaScript il
sito appare nel tema scuro di default.

## La UI

```
src/
  App.tsx                     LanguageProvider + Desktop + PrintableResume
  desktop/
    Desktop.tsx               Shell: topbar a 4 tab, tema, deep-link via hash (#resume, #projects, #notes), hamburger mobile
    HomeBackdrop.tsx          Sfondo animato della Home (traiettoria verticale su mobile)
    HomeFooter.tsx            Contatti inline in fondo alla Home
    KnowledgeExplorer.tsx     Albero della KB con ricerca (laterale su desktop, nell'hamburger su mobile)
    DocumentDetail.tsx        Visualizzatore di un documento della KB, con «torna indietro»
    DeveloperNotesSection.tsx Tab Notes: indice degli articoli + lettore
    Wallpaper.tsx             Sfondo a griglia degli altri tab
  windows/                    Contenuti dei tab (il nome è un'eredità del sito «desktop»)
    Assistant/                Chat dell'AI Assistant (Home)
    Resume/                   CV completo + PrintableResume.tsx per il PDF via window.print()
    Projects/                 Card dei progetti + case study
    Skills/                   Competenze per categoria, usate dentro il Resume
  context/                    Lingua IT/EN (auto-detect + localStorage), etichette UI
  lib/                        Loader KB, helper Markdown → HTML
  utils/                      localStorage sicuro, hook useIsMobile (640 px)
  styles/tokens.css           Palette, font, ombre, radius
```

Il tema (chiaro/scuro) e la lingua sono salvati in `localStorage`. Anche la conversazione con
l'Assistant, ma `src/main.tsx` la cancella a ogni caricamento: ogni visita riparte con la chat
vuota.

## L'AI Assistant

- **Endpoint**: `POST /api/assistant`, dichiarato nel `config` esportato da
  `netlify/functions/assistant.ts` (non in `netlify.toml`).
- **Input**: `{ message, language, history? }`. Limiti: messaggio ≤ 2000 caratteri, cronologia
  ≤ 10 messaggi, ognuno ≤ 4000 caratteri, totale ≤ 12000, altrimenti 400.
- **Contesto**: tutta la KB nella lingua richiesta, più i file lang-neutral, va nel prompt; la risposta chiude con un blocco
  fonti che la UI mostra come link ai documenti.
- **Modelli**: `OPENROUTER_MODEL` se impostato, poi i default `:free` di `DEFAULT_MODELS`, al
  massimo tre tentativi.
- **Quota**: piano gratuito di OpenRouter (50 richieste/giorno sui `:free`), protetto da un rate
  limit Netlify di 10 richieste ogni 60 s per IP.
- **Errori**: la function non espone dettagli di OpenRouter; la UI mostra messaggi tradotti.

## Build, deploy e controlli

- `npm run build` = `tsc -b` (app + function) + `vite build` → `dist/`.
- Netlify pubblica `dist/` con Node 22; le function stanno in `netlify/functions`.
- `npm run dev` avvia solo il frontend; `npm run dev:full` (netlify dev) anche la function, e
  richiede `OPENROUTER_API_KEY` in `.env` (vedi `.env.example`).
- `npm test` = `vitest run`: i test stanno in `tests/` e girano in Node, senza chiave OpenRouter e
  senza rete. Coprono la knowledge base vera (coppie `.it.md`/`.en.md`, `type`, campi
  obbligatori), la function dell'Assistant chiamata dalla sua porta d'ingresso con `fetch`
  sostituita, il plugin `kb-head` e gli helper Markdown. `tsconfig.tests.json` li fa controllare
  anche da `tsc -b`.
- `npm run size` (`scripts/check-bundle.mjs`) misura i `.js` di `dist/assets` con gzip e
  fallisce sopra 120 KB (piano v3). Oggi un solo file da 103 KB: metà è `react-dom`, il resto
  `marked` e `dompurify` per le risposte dell'Assistant, i componenti e i testi della KB.
- CI (`.github/workflows/ci.yml`): `npm run lint`, `npm test`, `npm run build` e `npm run size`
  su ogni PR e su ogni push su `main`.
