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
| La UI     | `src/lib/knowledgeBase.ts`     | `import.meta.glob` a build time, frontmatter con `gray-matter` |
| L'AI      | `netlify/functions/lib/kb.ts`  | `fs` a runtime nella function; i `.md` arrivano nel bundle grazie a `included_files` in `netlify.toml` |

`src/context/translations.ts` contiene **solo** etichette di interfaccia, mai contenuto.

## L'`<head>` della pagina

`index.html` non contiene testo su Francesco: il segnaposto `<!-- kb-head -->` viene sostituito in
build (e in `npm run dev`) dal plugin `vite/kb-head.ts`, che legge `knowledge-base/about.en.md` e
scrive `<title>` («nome — ruolo»), meta description (le prime frasi del corpo, ≤ 160 caratteri),
Open Graph e Twitter card. L'anteprima è in inglese per scelta (piano v1); `og:url` e `canonical`
usano la variabile `URL` che Netlify imposta in build, e mancano nelle build locali.

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
  polyfills.ts                Buffer per gray-matter nel browser
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
- CI (`.github/workflows/ci.yml`): `npm run lint` e `npm run build` su ogni PR e su ogni push su
  `main`. Test automatici: nessuno, per ora.
