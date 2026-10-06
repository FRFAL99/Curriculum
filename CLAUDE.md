# CLAUDE.md

Portfolio personale di Francesco (React 19 + TypeScript + Vite, deploy su
Netlify, AI Assistant via OpenRouter in `netlify/functions/assistant.ts`).

## Prima di tutto, leggi questi

| Vuoi sapere…                                          | Leggi                              |
| ----------------------------------------------------- | ---------------------------------- |
| dove siamo **oggi** e cosa manca                      | `docs/STATO.md`                    |
| che numero ha una Fase, e se è chiusa                 | `docs/registro.md`                 |
| **come funziona** il sito, adesso                     | `docs/conoscenza/architettura.md`  |
| cosa ha già fatto perdere tempo                       | `docs/conoscenza/trappole.md`      |
| cosa si è **deciso** e perché, per il lavoro in corso | il piano `docs/piano-vN-*.md`      |
| una scelta architetturale irreversibile               | `docs/adr/`                        |

**Non leggere `docs/devlog.md` per intero**: si greppa, `grep -n '^## ' docs/devlog.md` ne dà
l'indice. `docs/archivio/` contiene il vecchio documento di visione e il sito v1: storia, non
istruzioni.

## Lingua e commit

- Rispondi in italiano.
- Commit in italiano, formato conventional: `feat(scope): …`, `fix(scope): …`,
  `style: …`, `docs: …`.
- Lavora su un branch e apri una PR: mai push diretto su `main`.

## Contenuti: la knowledge base è la fonte unica

- `knowledge-base/**` (Markdown + frontmatter) è l'unica fonte dei contenuti
  su Francesco, letta sia dalla UI (`src/lib/knowledgeBase.ts`) sia dall'AI
  (`netlify/functions/lib/kb.ts`). Vedi `docs/adr/0001-knowledge-base.md`.
- Mai testo di contenuto hardcoded nei componenti; `src/context/translations.ts`
  contiene solo etichette di interfaccia.
- Ogni documento esiste in coppia `.it.md` / `.en.md`: aggiorna sempre
  entrambe le lingue insieme.

## Numerazione delle Fasi

1. **Non si rinumera e non si riusa mai** un numero.
2. **Un numero si assegna scrivendo un piano** (`/nuovo-piano`), che lo dichiara in testa e lo
   scrive subito in `docs/registro.md`.
3. **Il lavoro fuori piano non prende un numero**: è una voce di devlog con la sola data.
4. **«Che numero è il prossimo» ha una sola fonte**: il «prossimo numero libero» di
   `docs/registro.md`.

Un piano nuovo parte da `docs/piano-TEMPLATE.md`.

## Rituale di fine Fase (`/fine-fase`)

1. `npm run lint` (oxlint), `npm test` (vitest) e `npm run build` (`tsc -b` + `vite build`) passano.
2. Il sito è usato molto da mobile: ogni modifica UI si verifica anche a larghezza telefono.
3. `docs/registro.md`: la riga della Fase passa a ✅.
4. `docs/devlog.md`: voce nuova **in testa**, `## AAAA-MM-GG — Fase N: <titolo>`, chiusa da
   `### Verifica`. Il lavoro fuori piano usa `## AAAA-MM-GG — Fuori piano: <titolo>`.
5. `docs/STATO.md`: **solo se cambia dove siamo**. Ciò che è diventato fatto **si cancella** da
   «cosa manca». STATO resta sotto le 100 righe.
6. Come funziona il sito è cambiato → `docs/conoscenza/architettura.md`. Una trappola nuova →
   `docs/conoscenza/trappole.md`.
7. Commit su un branch e PR verso `main`.

Anche le correzioni piccole fuori piano chiudono con lint, test, build, verifica mobile e una voce
di devlog.

Un piano si consegna in **un'unica PR**, una per piano, non una per Fase (chiesto da Francesco il
6 ottobre 2026).

## Dove si scrive cosa

| Cambia…                                 | Scrivi in                                             |
| --------------------------------------- | ----------------------------------------------------- |
| dove siamo oggi                         | `docs/STATO.md`, e cancella ciò che non è più aperto  |
| lo stato di una Fase                    | `docs/registro.md`                                    |
| com'è andata oggi                       | `docs/devlog.md`, in testa                            |
| come funziona il sito, adesso           | `docs/conoscenza/architettura.md`                     |
| una trappola che si può riscoprire      | `docs/conoscenza/trappole.md`                         |
| una decisione del lavoro in corso       | il piano `docs/piano-vN-*.md`                         |
| una scelta architetturale irreversibile | `docs/adr/`                                           |
| come si avvia e si pubblica il sito     | `README.md`                                           |

## Netlify

- `publish = "dist"`: pubblicare la radice del repo dà una pagina bianca.
- I `.md` della knowledge base sono letti a runtime dalla function tramite
  `included_files` in `netlify.toml`: non spostarli senza aggiornarlo.
- `OPENROUTER_API_KEY` serve solo per `npm run dev:full` (vedi `.env.example`).
