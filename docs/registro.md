# Registro delle Fasi

Una riga per Fase, dalla 1 in avanti. È l'unico posto in cui guardare per sapere **che numero ha
una Fase, a che piano appartiene e se è chiusa**. Com'è andata sta in [devlog.md](devlog.md), dove
siamo adesso sta in [STATO.md](STATO.md).

## Prossimo numero libero: **33**

## Le regole

1. **Un numero non si rinumera e non si riusa mai.**
2. **Un numero si assegna scrivendo un piano**, che lo dichiara in testa («occupa le Fasi
   21–23»). Si scrive qui in quel momento, con stato ⬜, non a piano finito.
3. **Il lavoro fuori piano non prende un numero.** È una voce di devlog con la sola data. Le
   Fasi 19 e 20 sono nate così prima di questa regola e tengono il loro numero.
4. Una PR può chiudere più Fasi, ma una Fase non si chiude a metà: o ✅ o 🟡 con il motivo nel
   devlog.

Stato: ✅ chiusa · 🟡 in parte · ⬜ non fatta.

## I piani prima di questo registro

Le Fasi 1–20 sono nate prima dei file `piano-vN`. I «piani» della tabella sono i documenti di
allora:

- **roadmap v2**: `Curriculum_Portfolio_v2_Roadmap.md`, mai committata; il sito «desktop» con
  finestre.
- **visione KB+AI**: [archivio/VISION.md](archivio/VISION.md), Knowledge Base e AI Assistant.
- **—**: Fasi decise sul momento, senza un documento di piano.

Dalla Fase 21 la colonna `Piano` indica il file `piano-vN-*.md`.

## La tabella

| N  | Titolo                                     | Piano         | Stato | Devlog     |
| -- | ------------------------------------------ | ------------- | ----- | ---------- |
| 1  | Layout desktop, dock, icone e tema         | roadmap v2    | ✅     | 2026-07-11 |
| 2  | Window Manager                             | roadmap v2    | ✅     | 2026-07-11 |
| 3  | Configurazione delle finestre              | roadmap v2    | ✅     | 2026-07-11 |
| 4  | Finestre con contenuto reale, IT/EN, PDF   | roadmap v2    | ✅     | 2026-07-11 |
| 5  | Persistenza                                | roadmap v2    | ✅     | 2026-07-11 |
| 6  | Fix mobile                                 | —             | ✅     | 2026-07-11 |
| 7  | Centraggio, schermo intero, tap singolo    | —             | ✅     | 2026-07-11 |
| 8  | Knowledge Base                             | visione KB+AI | ✅     | 2026-07-11 |
| 9  | Knowledge Document Viewer                  | visione KB+AI | ✅     | 2026-07-11 |
| 10 | Netlify Function per OpenRouter            | visione KB+AI | ✅     | 2026-07-11 |
| 11 | Finestra AI Assistant                      | visione KB+AI | ✅     | 2026-07-11 |
| 12 | Explainability: fonti cliccabili           | visione KB+AI | ✅     | 2026-07-11 |
| 13 | Knowledge Explorer                         | visione KB+AI | ✅     | 2026-07-11 |
| 14 | Layout a tre colonne                       | visione KB+AI | ✅     | 2026-07-11 |
| 15 | Ricerca globale + header metadata          | visione KB+AI | ✅     | 2026-07-11 |
| 16 | Restyle pannello Assistant + colonna icone | —             | ✅     | 2026-07-11 |
| 17 | Developer Notes a tab                      | —             | ✅     | 2026-07-15 |
| 18 | Da «desktop OS» a landing page a tab       | —             | ✅     | 2026-07-19 |
| 19 | Fix «OpenRouter error: 404»                | —             | ✅     | 2026-10-06 |
| 20 | Miglioramenti dell'AI Assistant            | —             | ✅     | 2026-10-06 |
| 21 | Head generato dalla KB, `lang` coerente    | v1            | ✅     | 2026-10-06 |
| 22 | Immagine di anteprima `og.png`             | v1            | ✅     | 2026-10-06 |
| 23 | HTML statico in `#root` + JSON-LD `Person` | v1            | ✅     | 2026-10-06 |
| 24 | Vitest, `npm test` in CI, test della KB    | v2            | ✅     | 2026-10-06 |
| 25 | Test dell'AI Assistant                     | v2            | ✅     | 2026-10-06 |
| 26 | Test di `kb-head` e helper Markdown        | v2            | ✅     | 2026-10-06 |
| 27 | Frontmatter della KB letto in build        | v3            | ✅     | 2026-10-06 |
| 28 | Tetto al JavaScript in CI (`npm run size`) | v3            | ✅     | 2026-10-06 |
| 29 | Domande suggerite dopo ogni risposta       | v4            | ✅     | 2026-10-06 |
| 30 | Risposta dell'Assistant in streaming       | v4            | ✅     | 2026-10-06 |
| 31 | Invito al contatto nella chat              | v4            | ✅     | 2026-10-06 |
| 32 | Avvio dalla KB e competenze coerenti       | v4            | ✅     | 2026-10-06 |
