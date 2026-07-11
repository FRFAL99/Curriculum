# Fase 13 — Knowledge Explorer — Log di avanzamento

Riferimento: documento di visione "Portfolio Architecture — Knowledge Base +
AI Assistant" (vedi `docs/VISION.md`). Prima fase implementativa dopo le
decisioni di visione: costruisce il pezzo più fondamentale mancante — la
sidebar che rende esplorabile la Knowledge Base per categorie, senza
passare né dal Dock né dall'AI Assistant.

Obiettivo della fase: introdurre `KnowledgeExplorer`, una sidebar
persistente sulla sinistra del desktop (non una `Window`, sullo stesso
modello del `Dock`) che elenca i documenti della Knowledge Base raggruppati
per categoria e li apre nel `KnowledgeDocumentWindow` già esistente dalla
Fase 9.

Decisioni prese con l'utente prima di implementare:
- **Categorie mostrate**: solo quelle con contenuto reale in KB — About,
  Experience, Projects, Skills, Education, Developer Notes. Contact/Social
  esclusi (hanno già una finestra dedicata, non sono "documenti" da
  leggere). Niente categorie inventate (es. "Certifications",
  "Architecture") solo perché comparse nei mockup di brainstorming.
- **Layout a tre colonne e AI Assistant centrale**: esplicitamente fuori
  scope in questa fase, restano step successivi.
- **Nessun riposizionamento delle finestre**: `CENTER_ON_OPEN` in
  `WindowManagerContext.tsx` resta invariato; la sidebar è un overlay
  fisso in stile Dock, non ridefinisce il layout delle finestre.

---

## Step 1 — Componente `KnowledgeExplorer`

**Stato: ✅ completato**

Nuovo `src/desktop/KnowledgeExplorer.tsx` + `KnowledgeExplorer.css`,
renderizzato in `Desktop.tsx` come sibling di `<Dock />`/`<WindowManager />`
— fuori da `windowsConfig`, non è una `Window`.

- Dati letti dai getter già esistenti in `src/lib/knowledgeBase.ts`
  (`getAbout`, `getExperience`, `getProjects`, `getSkills`,
  `getEducation`, `getDeveloperNotes`), già filtrati per lingua e
  ordinati per `frontmatter.order` — nessuna modifica al loader.
- Due tipi di riga: **leaf** (About, Skills — un solo documento, click
  diretto) e **ramo espandibile** (Experience, Projects, Education,
  Developer Notes — chevron per aprire/chiudere, un figlio per documento).
  Etichetta figlio dal campo frontmatter più naturale per tipo
  (`role` per Experience, `title` per Projects/Developer Notes, `degree`
  per Education).
- Click su una voce chiama `openWindow("knowledge-document", { path })` —
  stesso meccanismo già usato da `ProjectsWindow` dalla Fase 9, nessuna
  nuova API sul window manager.
- Stato espanso/collassato per categoria persistito in localStorage
  (`readJSON`/`writeJSON`, chiave `"knowledgeExplorerState"`), stesso
  pattern di `theme` e `windowManagerState`.
- Voce attiva evidenziata leggendo `windows["knowledge-document"]` da
  `useWindowManager()`: se la finestra è aperta e non minimizzata, il
  `path` nel suo `payload` viene confrontato con quello di ogni voce.
- Mobile (`useIsMobile()`, breakpoint 640px già esistente): sidebar
  nascosta dietro un pulsante toggle fisso, apribile come overlay a
  schermo intero con backdrop; nessun nuovo breakpoint introdotto.

Due nuove chiavi in `src/context/translations.ts` (IT/EN):
`knowledgeExplorerTitle` (intestazione sidebar) e
`knowledgeExplorerToggle` (aria-label del toggle mobile). Le intestazioni
di categoria riusano chiavi già esistenti (`profileTitle`,
`experienceTitle`, `projectsTitle`, `skillsTitle`, `educationTitle`,
`developerNotesTitle`) — nessuna duplicazione.

## Step 2 — Spazio riservato nel Desktop

**Stato: ✅ completato**

`Desktop.css`: `padding-left` su `.desktop__topbar` e `.desktop__icons`
pari alla larghezza della sidebar (264px + margine), così icone e brand
non finiscono sotto la sidebar fissa. Annullato dentro il blocco
`@media (max-width: 640px)` già esistente, dove la sidebar diventa un
overlay e non deve riservare spazio.

## Step 3 — Verifica

**Stato: ✅ completato**

- `npx tsc -b` — nessun errore di tipo (corretto un mismatch iniziale tra
  i tipi di frontmatter specifici, es. `ExperienceFrontmatter`, e la firma
  generica dell'helper di etichetta).
- `npx oxlint` sui file nuovi/modificati — pulito.
- Dev server + Chromium headless via Playwright: sidebar visibile con le 6
  categorie corrette; toggle expand/collapse su un ramo funzionante; click
  su una voce figlio (esperienza "Software Engineer") apre il Knowledge
  Document Viewer con il documento corretto e la voce si evidenzia;
  cambio lingua IT/ENG aggiorna correttamente tutte le etichette della
  sidebar; ridotto il viewport sotto 640px → sidebar collassa dietro il
  toggle, nessuna sovrapposizione con topbar/icone; aperto il toggle →
  overlay con backdrop, nessun errore in console.

---

## Cosa resta (Fasi successive, non in scope qui)

- **Layout a tre colonne** (Knowledge Explorer | AI Assistant | Document
  Viewer) — richiede ripensare il posizionamento delle finestre rispetto
  allo spazio occupato dalla sidebar (oggi `CENTER_ON_OPEN` ignora la
  sidebar).
- **AI Assistant come elemento centrale del desktop** — oggi resta una
  finestra tra le altre.
- Ricerca globale sulla Knowledge Base, cross-reference tra documenti,
  header "Knowledge Document" con metadata (progetto/data/reading
  time/topics) — idee di `docs/VISION.md` non ancora decise per
  l'implementazione.
