# Fase 9 — Knowledge Document Viewer — Log di avanzamento

Riferimento: documento di visione "Portfolio Architecture — Knowledge Base +
AI Assistant" (vedi `docs/VISION.md`, stesso citato in `FASE8_LOG.md`). Prosegue
direttamente dalla Fase 8: la Knowledge Base esiste già come dati, questa
fase aggiunge la prima vista che la usa per intero, non solo a teaser.

Obiettivo della fase: introdurre una vista "documentazione tecnica" per un
documento della Knowledge Base — distinta dalla card storytelling già
esistente in `ProjectsWindow` — riusando lo stesso file `.md` per due
letture diverse, come da visione originale.

Decisioni prese con l'utente prima di implementare:
- **Entry point**: solo da `ProjectsWindow` in questa fase (Developer Notes
  e altri tipi restano invariati, estendibile in seguito).
- **Contenuto**: arricchire subito i body dei due progetti esistenti con
  sezioni vere (`## Overview/Problem/Solution/Challenges/Future
  Improvements`), non solo costruire il plumbing su un body ancora a
  paragrafo singolo.

---

## Step 0 — Correzione contenuto progetti

**Stato: ✅ completato**

Durante la raccolta dei dettagli reali per "Antichità Fallavena", emerso
che il campo `stack` in `knowledge-base/projects/antichita-fallavena.*.md`
era sbagliato: dichiarava `["HTML", "CSS", "JavaScript", "GitHub Copilot",
"Claude", "ChatGPT"]`, ma lo stack reale è **Next.js + Firebase +
Netlify** (con una versione precedente in React puro, sostituita per
avere controllo lato server). Corretto in `["Next.js", "React",
"Firebase", "Netlify"]`.

Aggiunte sezioni `## Overview / ## Problem / ## Solution / ## Challenges /
## Future Improvements` (IT + EN) a:
- `projects/antichita-fallavena.{it,en}.md`: problema (vecchio sito
  obsoleto), soluzione (Next.js/Netlify, catalogo su Firebase con pannello
  admin custom per prodotti/eventi, newsletter via cron job), sfide
  (pannello admin sicuro senza accesso diretto al DB, invio automatico
  newsletter), miglioramenti futuri (navigazione, UI più user-friendly).
- `projects/portfolio-v2.{it,en}.md`: problema (contenuto triplicato nei
  vecchi componenti, nessuna base per un AI Assistant grounded), soluzione
  (architettura a finestre + Knowledge Base da Fase 8), sfide
  (sincronizzazione stato finestre, multilingua, bug Buffer/gray-matter),
  miglioramenti futuri (questa fase, poi AI Assistant + Explainability).

## Step 1 — Problema: teaser vs documento intero

**Stato: ✅ completato**

`ProjectsWindow` (`src/windows/Projects/index.tsx`) passava l'intero
`proj.body` a `renderInline()` per il teaser della card. Con il body ora
multi-sezione, la card avrebbe mostrato tutto il testo concatenato senza
heading.

Aggiunto `getOverviewExcerpt(body)` in `src/lib/markdown.ts`: estrae solo
il testo sotto `## Overview` (fino al prossimo `## ` o a fine stringa).
Se il body non ha sezioni (es. developer notes, ancora a paragrafo
singolo), ritorna il body intero — nessuna rottura per i documenti non
ancora arricchiti.

## Step 2 — Payload sul WindowManager

**Stato: ✅ completato**

Il `WindowManager` istanziava ogni finestra come `<Content />`, senza
props: non c'era modo di dire "apri questa finestra per QUESTO
documento". Esteso (non solo per questa fase: sarà lo stesso meccanismo
usato in Fase 12 per aprire un documento da un link di citazione dell'AI
Assistant):

- `WindowState` (`src/desktop/WindowManagerContext.tsx`): nuovo campo
  `payload?: unknown`.
- Action `OPEN` accetta `payload?: unknown`; se la finestra è già aperta,
  il payload viene aggiornato (non ignorato) — così riaprire il Viewer su
  un progetto diverso mentre è già aperto ne sostituisce il contenuto
  invece di lasciare quello vecchio.
- `openWindow(id, payload?)` — firma estesa nel context value.
- `WindowManager.tsx` passa `<Content payload={win.payload} />` a ogni
  finestra; tutti i componenti esistenti (a zero props) restano
  assegnabili al nuovo tipo `ComponentType<{ payload?: unknown }>` senza
  modifiche, dato che il payload è opzionale.
- `WindowConfig` (`src/config/windows.ts`): nuovo campo `hidden?: boolean`
  — finestra apribile solo via `openWindow(id, payload)`, senza icona sul
  desktop (il Dock era già filtrato da `inDock`). `Desktop.tsx` filtra le
  icone con `!w.hidden`.

## Step 3 — Componente `KnowledgeDocumentWindow`

**Stato: ✅ completato**

Nuova finestra `src/windows/KnowledgeDocument/` (id `knowledge-document`,
`hidden: true`, `allowMaximize: true`):

- Legge `path` dal payload, cerca il documento con `getAllDocs()` (già
  esportato da `knowledgeBase.ts` fin dalla Fase 8, mai usato finora).
- Renderizza il body intero con `renderBlock()` (già presente in
  `src/lib/markdown.ts`, scritto in Fase 8 apposta per questa fase, mai
  usato finora) dentro `dangerouslySetInnerHTML`, con CSS a selettori
  discendenti per h2/p/ul/strong (contenuto non scopato da React).
- Footer con la fonte (`📄 projects/antichita-fallavena.en.md`), in linea
  con l'esempio di Explainability del documento di visione — anticipa la
  Fase 12 ma qui è solo testo statico, non ancora un link cliccabile.

`ProjectsWindow`: aggiunto bottone "Read case study" / "Leggi il case
study" (nuova chiave di traduzione `viewCaseStudy`) sotto i tag stack di
ogni card, che chiama `openWindow("knowledge-document", { path: proj.path })`.

## Step 4 — Verifica

**Stato: ✅ completato**

- `npx tsc -b --noEmit` — nessun errore di tipo.
- `npm run lint` (oxlint) — pulito.
- Dev server + Chromium headless (Playwright, stesso approccio del fix
  Buffer): aperta Projects, cliccato "Read case study" su Antichità
  Fallavena → finestra Case Study con `<h2>Overview</h2>`,
  `<h2>Problem</h2>`, `<h2>Solution</h2>` ecc. renderizzati come heading
  HTML veri (non testo `## ` letterale), zero errori console. Chiuso il
  Viewer e cliccato "Read case study" su Portfolio v2 → titolo aggiornato
  correttamente a "Portfolio v2 — Desktop", confermando che riaprire la
  finestra con un payload diverso ne sostituisce il contenuto.

---

## Cosa resta (Fasi successive, non in scope qui)

- **Fase 10** — Netlify Function per la chiamata a OpenRouter (scope
  classification + retrieval su `getAllDocs()` + chiamata con key
  server-side)
- **Fase 11** — Finestra AI Assistant collegata alla function
- **Fase 12** — Explainability: rendere cliccabile il footer sorgente già
  presente in `KnowledgeDocumentWindow` (oggi solo testo), collegato alle
  citazioni delle risposte dell'AI Assistant
- Estendere l'entry point del Viewer oltre `ProjectsWindow` (es. Developer
  Notes) quando quei body verranno arricchiti con sezioni strutturate
