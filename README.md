# Portfolio v2

Portfolio personale di Francesco Fallavena: una landing page in italiano e inglese con CV,
progetti, articoli e un **AI Assistant** che risponde sulle informazioni del sito. Stack:
**React 19 + TypeScript + Vite**, deploy su **Netlify**, AI via **OpenRouter**.

Tutti i contenuti stanno in `knowledge-base/**` (Markdown + frontmatter), unica fonte sia per la
UI sia per l'AI.

## Documentazione

- [`docs/STATO.md`](docs/STATO.md): dove siamo oggi e cosa manca. **Si parte da qui.**
- [`docs/registro.md`](docs/registro.md): le Fasi, una per riga.
- [`docs/devlog.md`](docs/devlog.md): il diario, dalla Fase 1 a oggi.
- [`docs/conoscenza/`](docs/conoscenza/): come funziona il sito e le trappole note.
- [`docs/adr/`](docs/adr/): le decisioni architetturali.
- [`CLAUDE.md`](CLAUDE.md): convenzioni, numerazione delle Fasi e rituale di fine Fase.

## Avvio in locale

```bash
npm install
npm run dev        # solo frontend, http://localhost:5173
npm run dev:full   # frontend + Netlify Function dell'Assistant (serve .env, vedi .env.example)
```

## Build e controlli

```bash
npm run lint       # oxlint
npm run build      # tsc -b + vite build → dist/
npm run preview    # serve dist/ in locale
npm run og         # rigenera public/og.png, l'immagine di anteprima del link
```

La CI GitHub (`.github/workflows/ci.yml`) esegue lint e build su ogni PR e su ogni push su `main`.

## Deploy su Netlify

Il repo include `netlify.toml`, quindi Netlify si configura da solo. Se il sito risulta **bianco**
dopo il deploy, controlla in Netlify → Site settings → Build & deploy → Build settings (le
impostazioni salvate a mano nella dashboard hanno la precedenza su `netlify.toml`):

- **Base directory**: vuoto
- **Build command**: `npm run build`
- **Publish directory**: `dist`, la causa più comune di pagina bianca

L'`index.html` alla radice del repo punta a `/src/main.tsx`, che solo Vite in sviluppo sa
eseguire; `dist/index.html` punta al bundle compilato ed è quello da pubblicare. Nella Console del
browser (F12) un errore su `/src/main.tsx` o un «Unexpected token» confermano questa causa.

Per l'AI Assistant in produzione serve la variabile d'ambiente `OPENROUTER_API_KEY` nelle
impostazioni del sito Netlify.

## Lavorare con Claude Code

Le convenzioni del progetto sono in `CLAUDE.md`. Nelle sessioni Claude Code sul web l'hook
`.claude/hooks/session-start.sh` esegue `npm ci` all'avvio, così lint e build sono subito
disponibili. I comandi `/nuovo-piano` e `/fine-fase` (in `.claude/commands/`) aprono un piano e
chiudono una Fase seguendo le regole di `CLAUDE.md`.
