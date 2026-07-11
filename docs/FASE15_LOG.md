# Fase 15 — Ricerca globale + header metadata — Log di avanzamento

Riferimento: documento di visione "Portfolio Architecture — Knowledge Base +
AI Assistant" (vedi `docs/VISION.md`). Il piano principale (le 4 decisioni
di visione + layout a tre colonne, Fasi 13-14) è completo. Questa fase
riprende due idee elencate come "non ancora decise" in `docs/VISION.md`:
ricerca globale sulla Knowledge Base e header con metadata sul Knowledge
Document.

Vincolo verificato prima di implementare: i campi disponibili nel
frontmatter variano per tipo di documento (`knowledge-base/**/*.md`) —
`project` ha `stack` ma nessuna data, `experience`/`education` hanno
`dateStart`/`dateEnd` ma solo `experience` ha tag (`skills`),
`developer-note` ha `date` ma nessun tag, `about`/`skills` non hanno né
data né tag. Non esiste un campo "Updated" universale. Decisione: header
**adattivo per tipo**, mostra solo i campi realmente presenti — nessun
placeholder finto.

---

## Step 1 — Ricerca globale nel Knowledge Explorer

**Stato: ✅ completato**

`src/desktop/KnowledgeExplorer.tsx`:
- Ogni voce (leaf o figlio di un ramo) ora porta anche un `searchText`
  precomputato: label + `body` del documento + tag rilevanti quando
  presenti (`stack` per i progetti, `skills` per le esperienze), tutto in
  minuscolo. Prima la Fase 13 portava solo `path`/`label`.
- Nuovo campo di ricerca (`kb-explorer__search`, icona `Search` da
  lucide-react) sotto l'intestazione "Knowledge Base".
- Query vuota → albero per categoria invariato (comportamento Fase 13).
- Query non vuota → lista piatta dei risultati che matchano
  `searchText.includes(query)`, con l'icona della categoria di
  appartenenza; nessun match → messaggio "Nessun risultato" (nuova chiave
  `knowledgeExplorerNoResults`). Click su un risultato apre il documento
  con lo stesso `openWindow("knowledge-document", { path })` di sempre.
- Cercare per contenuto funziona anche quando il termine non è nel titolo:
  es. cercare "Firebase" trova "Antichità Fallavena" perché il termine è
  nello `stack`/nel body, non nel titolo del progetto.

Nuove chiavi in `translations.ts` (IT/EN): `knowledgeExplorerSearchPlaceholder`,
`knowledgeExplorerNoResults`.

## Step 2 — Header metadata sul Knowledge Document

**Stato: ✅ completato**

`src/windows/KnowledgeDocument/index.tsx`:
- **Titolo corretto per tipo**: prima usava solo `frontmatter.title`,
  assente per experience/education/about — il titolo cadeva sullo slug
  (bug osservato in Fase 13: aprire un'esperienza mostrava "xtel" invece
  di "Software Engineer"). Ora mappa il campo giusto per tipo (`role` per
  experience, `degree` per education, `name` per about, `title` per il
  resto).
- **Badge tipo**: riusa le chiavi di traduzione già esistenti per
  categoria (`profileTitle`, `experienceTitle`, `projectsTitle`,
  `skillsTitle`, `educationTitle`, `developerNotesTitle` — Fase 13),
  nessuna nuova chiave.
- **Periodo/data**: solo quando presente nel frontmatter — `date` per
  developer-notes, `dateStart`–`dateEnd` (o "Present"/"Presente", chiave
  `present` già esistente) per experience/education. Assente per
  project/about/skills.
- **Tempo di lettura**: sempre presente, calcolato da
  `doc.body.split(/\s+/).length / 200` minuti (arrotondato, minimo 1).
  Nuova chiave `readingTimeSuffix`.
- **Tag**: da `frontmatter.stack` (project) o `frontmatter.skills`
  (experience), assenti per gli altri tipi.

`KnowledgeDocument.css`: nuovi blocchi `.kb-doc-window__meta` (badge +
periodo + tempo di lettura, riga monospace) e `.kb-doc-window__tags`
(chip con bordo), stile coerente coi token esistenti.

## Step 3 — Verifica

**Stato: ✅ completato**

- `npx tsc -b` e `npx oxlint` — puliti.
- Dev server + Chromium headless: digitato "Firebase" nella ricerca →
  trovato "Antichità Fallavena" (match nel body/stack, non nel titolo);
  query cancellata → torna l'albero per categoria; aperto il progetto
  "Antichità Fallavena" → header con badge "Projects", tempo di lettura,
  tag (Next.js, React, Firebase, Netlify); aperta l'esperienza "Software
  Engineer" (Xtel) → titolo corretto (non più "xtel"), badge
  "Professional Experience", periodo "June 2022 – Present", tag delle
  skill; aperto "About" → solo badge + tempo di lettura, nessun campo
  vuoto o finto. Nessun errore in console.

---

## Cosa resta (non in scope qui)

- Cross-reference tra documenti ("Related Documents").
- "Open in AI" — aprire l'Assistant pre-contestualizzato su un documento.
- Campo "Updated" universale — richiederebbe scrivere contenuto reale in
  ogni documento della KB, non solo lavoro di UI.
