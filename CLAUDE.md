# CLAUDE.md

Portfolio personale di Francesco (React 19 + TypeScript + Vite, deploy su
Netlify, AI Assistant via OpenRouter in `netlify/functions/assistant.ts`).

## Lingua e commit

- Rispondi in italiano.
- Commit in italiano, formato conventional: `feat(scope): …`, `fix(scope): …`,
  `style: …`, `docs: …`.
- Lavora su un branch e apri una PR: mai push diretto su `main`.

## Contenuti: la knowledge base è la fonte unica

- `knowledge-base/**` (Markdown + frontmatter) è l'unica fonte dei contenuti
  su Francesco, letta sia dalla UI (`src/lib/knowledgeBase.ts`) sia dall'AI
  (`netlify/functions/lib/kb.ts`). Vedi `docs/ADR-001-knowledge-base.md`.
- Mai testo di contenuto hardcoded nei componenti; `src/context/translations.ts`
  contiene solo etichette di interfaccia.
- Ogni documento esiste in coppia `.it.md` / `.en.md`: aggiorna sempre
  entrambe le lingue insieme.

## Prima di consegnare

- `npm run lint` (oxlint) e `npm run build` (`tsc -b` + `vite build`) devono
  passare.
- Il sito è usato molto da mobile: verifica ogni modifica UI anche a
  larghezza telefono.
- Per cambi sostanziali aggiungi un log in `docs/FASEnn_LOG.md` (numerazione
  progressiva) e aggiorna il README.

## Netlify

- `publish = "dist"`: pubblicare la radice del repo dà una pagina bianca.
- I `.md` della knowledge base sono letti a runtime dalla function tramite
  `included_files` in `netlify.toml`: non spostarli senza aggiornarlo.
- `OPENROUTER_API_KEY` serve solo per `npm run dev:full` (vedi `.env.example`).
