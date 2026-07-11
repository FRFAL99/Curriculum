# Fase 8 — Knowledge Base — Log di avanzamento

Riferimento: documento di visione "Portfolio Architecture — Knowledge Base +
AI Assistant" (condiviso in sessione, non ancora committato nel repo — vedi
nota in fondo). Prosegue la numerazione delle fasi già presente in questo
repo (Fase 1-7 completate secondo `Curriculum_Portfolio_v2_Roadmap.md`).

Obiettivo della fase: introdurre `knowledge-base/` come Single Source of
Truth per tutti i contenuti "di fatto" su Francesco (profilo, esperienze,
formazione, competenze, progetti, developer notes), ed eliminare i dati
hardcoded/duplicati nei componenti React. Questa fase **non** tocca ancora
UI nuova (niente Knowledge Document Viewer, niente AI Assistant): è solo
lo strato dati sotto le finestre esistenti.

---

## Step 0 — Ricognizione dello stato reale del repo

**Stato: ✅ completato**

Prima di scrivere qualunque file, verificato lo stato effettivo del repo
via API GitHub / tarball del branch `main` (un primo tentativo di lettura
aveva mostrato una vista parziale/obsoleta). Trovato:

- Contenuto **duplicato in 3 punti** per gli stessi fatti: `ResumeWindow`
  (testo inline), `ExperienceWindow` (array hardcoded), `PrintableResume.tsx`
  (terza copia per il layout di stampa) — tutti pescavano da
  `translations.ts` con chiavi tipo `resp1`...`resp8`, `soft1`...`soft4`.
- `src/data/resume.json` in realtà **inutilizzato** (nessun import nel
  codice, solo un placeholder `_note`).
- `src/data/skills.json` e `src/data/projects.json` invece attivi, importati
  rispettivamente da `SkillsWindow` e `ProjectsWindow`.

Questa ricognizione ha cambiato lo scope pianificato: inizialmente pensavo
di migrare "solo" i 3 json, ma la vera duplicazione da eliminare era nei
componenti (in particolare `PrintableResume.tsx`, non previsto all'inizio).

## Step 1 — Struttura `knowledge-base/` e convenzioni

**Stato: ✅ completato**

```
knowledge-base/
  about.it.md / about.en.md
  config/
    contacts.md   (lang-neutral: email, telefono, località)
    socials.md    (lang-neutral: github, linkedin)
  experience/
    xtel.it.md / xtel.en.md
    tutor-matematica.it.md / tutor-matematica.en.md
  education/
    laurea-matematica.it.md / .en.md
    perito-informatica.it.md / .en.md
  skills.md       (lang-neutral, label di categoria bilingue in frontmatter)
  projects/
    antichita-fallavena.it.md / .en.md
    portfolio-v2.it.md / .en.md
  developer-notes/
    query-optimization.it.md / .en.md
    data-integration-logic-apps.it.md / .en.md
```

Convenzioni adottate (non nel documento di visione originale, decise qui
per adattarlo a contenuto reale con più voci per categoria):

- **Un file per lingua** (suffisso `.it.md` / `.en.md`) invece di un unico
  file bilingue: più semplice da leggere/editare di un frontmatter con
  `{it, en}` annidati ovunque, e scala meglio se in futuro l'IT e l'EN
  divergono in lunghezza (es. Knowledge Document più esteso in una lingua).
- **Cartelle per le collezioni** (`experience/`, `education/`, `projects/`,
  `developer-notes/`) con **un file per voce**, non un unico file con lista:
  ogni esperienza/progetto è un documento a sé, indirizzabile singolarmente
  — prerequisito per l'Explainability della Fase 12 (citare *quel* file).
- **Frontmatter per i dati strutturati e ripetibili** (`responsibilities`,
  `softSkills`, `languages`, `skills` per categoria): array di stringhe con
  markdown inline (`**grassetto**`), non liste dentro il body — evita di
  dover fare parsing del body per riestrarle come array in React.
- **Body Markdown per il testo narrativo** (profilo, descrizione ruolo,
  descrizione progetto, tesi, developer note): qui sì che ha senso il
  Markdown "vero", ed è il punto di estensione naturale per il Knowledge
  Document Viewer (Fase 9), che potrà aggiungere sezioni (Problem, Solution,
  Challenges) senza toccare frontmatter.
- Campo `type` in ogni frontmatter (`about`, `experience`, `education`,
  `project`, `developer-note`, `skills`, `contact`, `social`): permette al
  loader di categorizzare i documenti senza dipendere dal path, e sarà la
  base per la scope classification dell'AI Assistant (Fase 10).
- Date come **stringhe già leggibili** (`"Giugno 2022"`, non `"2022-06"`):
  scelta pragmatica per questa fase, per non dover scrivere un formatter
  di date/mesi multilingua. Possibile miglioramento futuro se servisse
  ordinamento o calcolo automatico della durata.

## Step 2 — Migrazione contenuti

**Stato: ✅ completato**

Migrato 1:1 il contenuto reale (nessun testo nuovo inventato, a parte una
frase aggiuntiva nella descrizione di "Portfolio v2" che segnala che il
progetto stesso ora si autodescrive tramite la Knowledge Base):

- `about.{it,en}.md` ← profilo, disponibilità, lingue, soft skills (prima
  sparsi tra `profile`, `availabilityText`, `italian/english/motherTongue/
  professionalUse`, `soft1`...`soft4` in `translations.ts`)
- `config/contacts.md`, `config/socials.md` ← contatti hardcoded in
  `ResumeWindow` e `PrintableResume.tsx`
- `experience/xtel.*.md`, `experience/tutor-matematica.*.md` ← unificano
  ciò che prima viveva **duplicato** in `ResumeWindow` (testo) ed
  `ExperienceWindow` (array con `jobDesc`, `resp1`...`resp8`, `tutorDesc`)
- `education/*.md` ← `degree1`, `degree2`, `thesis` + date/voti hardcoded
- `skills.md` ← `src/data/skills.json`, con le label di categoria
  (`skillsLang`, `skillsFramework`, ...) portate dentro il frontmatter
  invece che in `translations.ts`
- `projects/*.md` ← `src/data/projects.json`
- `developer-notes/*.md` ← `note1Title/Body`, `note2Title/Body`

**Trovato durante la migrazione**: `project1Title` e `project1Link` in
`translations.ts` erano chiavi morte (mai lette da nessun componente,
`ProjectsWindow` usava già solo `projects.json`). Rimosse.

## Step 3 — Loader (`src/lib/knowledgeBase.ts`)

**Stato: ✅ completato**

- `import.meta.glob("/knowledge-base/**/*.md", { eager: true, query: "?raw", import: "default" })`
  → tutti i file letti **a build-time**, nessuna fetch a runtime (stesso
  comportamento dei vecchi `.json` importati direttamente: finiscono nel
  bundle come stringhe statiche).
- Parsing frontmatter con `gray-matter` (dipendenza aggiunta:
  `gray-matter` dichiara `"browser": { "fs": false }` nel suo
  `package.json`, quindi Vite lo bundla senza `fs`. **Attenzione però**:
  questo non copre anche `Buffer`, usato internamente da `gray-matter`
  (`lib/to-file.js`) — vedi Step 6, bug trovato solo a runtime nel
  browser reale, non dal typecheck/build).
- Un solo tipo `KnowledgeDoc<T>` con `{ path, slug, lang?, type, frontmatter, body }`
  — il campo `path` è già pensato per l'Explainability (Fase 12): sarà la
  stringa mostrata come fonte (`📄 projects/antichita-fallavena.md`).
- Getter tipizzati per componente (`getAbout`, `getExperience`,
  `getEducation`, `getProjects`, `getDeveloperNotes`, `getSkills`,
  `getContacts`, `getSocials`) + `getAllDocs()` non ancora usato da
  nessun componente, riservato al retrieval dell'AI Assistant (Fase 10).
- `src/lib/markdown.ts`: helper `renderInline`/`renderBlock` su `marked`,
  usati con `dangerouslySetInnerHTML` esattamente come prima (cambia solo
  la fonte del testo, Markdown invece di HTML scritto a mano nei
  `translations.ts`).

**Nota tecnica**: la build segnala un warning non bloccante
(`Use of direct eval`) proveniente da un motore custom opzionale interno a
`gray-matter` (`engines.js`), mai invocato dal nostro codice. Non blocca la
build né la minificazione del resto del bundle. Da tenere d'occhio se in
futuro si vuole essere più stringenti sul bundle (alternativa: un parser
YAML più minimale al posto di `gray-matter`).

## Step 4 — Rewiring dei componenti

**Stato: ✅ completato**

Aggiornati tutti i punti che contenevano dati hardcoded o leggevano dai
vecchi `.json`:

- `ResumeWindow`, `ExperienceWindow`, `SkillsWindow`, `ProjectsWindow`,
  `DeveloperNotesWindow`, **`PrintableResume`** (quest'ultima non era
  nel piano iniziale — vedi Step 0)
- Rimossi `src/data/resume.json`, `src/data/skills.json`,
  `src/data/projects.json` (sostituiti dalla Knowledge Base)
- `translations.ts` ridotto alle sole chiavi di UI/chrome (etichette di
  pulsanti e titoli di sezione); tutto il contenuto "di fatto" ora vive
  in `knowledge-base/`. Vedi `docs/ADR-001-knowledge-base.md` per il
  criterio usato per decidere cosa resta chrome e cosa diventa KB.

**Fix minore trovato durante il rewiring**: la label "Voto:" nella sezione
Formazione era hardcoded in italiano anche nella versione inglese del CV
(mostrava "Voto: 96/110" pure con `language === "en"`). Aggiunta chiave
`gradeLabel` ("Voto" / "Grade") in `translations.ts`.

## Step 5 — Verifica

**Stato: ✅ completato**

- `npm run build` → build pulita (`tsc -b && vite build`), nessun errore
  di tipo
- `npm run lint` → 0 warning, 0 errori (oxlint, 27 file)
- Bundle finale: `482.33 kB` (`134.57 kB` gzip) — in linea con la Fase 4
  (già ottimizzata per evitare l'import a wildcard di `lucide-react`)

## Step 6 — Fix: `Buffer is not defined` a runtime

**Stato: ✅ completato**

Schermo bianco al primo avvio con la Knowledge Base collegata, con in
console:

```
Uncaught ReferenceError: Buffer is not defined
    at e.toBuffer ...
```

`npm run build` e `tsc -b` non lo intercettano (è un errore runtime, non
di tipo): `gray-matter` chiama `Buffer.from(...)` in `lib/to-file.js` per
normalizzare l'input, e il browser non ha `Buffer` — è un'API Node,
diversa da `fs` (che `gray-matter` esclude già via `browser: { fs: false }`
in `package.json`, vedi Step 3).

Fix:

- Aggiunta dipendenza `buffer` (polyfill browser di `Buffer`).
- Nuovo modulo `src/polyfills.ts` che imposta `globalThis.Buffer`,
  importato come **primo import** in `src/main.tsx`.

**Perché un modulo a parte e non l'assegnazione diretta in `main.tsx`**:
gli `import` ES vengono valutati tutti prima di qualunque statement nel
corpo del modulo che li dichiara. Mettere `globalThis.Buffer = Buffer`
come statement dopo `import App from './App.tsx'` in `main.tsx` esegue
comunque **dopo** che `App.tsx` (e quindi `knowledgeBase.ts` e
`gray-matter`) sono già stati valutati — troppo tardi. Isolare
l'assegnazione nel proprio modulo (`polyfills.ts`) e importarlo per primo
garantisce che venga eseguita prima di ogni altro import a cascata.

Verificato con dev server + Chromium headless (Playwright): nessun errore
in console, contenuti della Knowledge Base renderizzati correttamente.

---

## Nota sul documento di visione originale

Il documento "Portfolio Architecture — Knowledge Base + AI Assistant" da
cui parte questa fase non è ancora stato committato nel repo: per ora
esiste solo nella cronologia della sessione. Consiglio di aggiungerlo come
`docs/VISION.md` (o simile) alla prossima occasione, così anche questo log
può linkarlo come gli altri fanno con `Curriculum_Portfolio_v2_Roadmap.md`.

## Cosa resta (Fasi successive, non in scope qui)

- **Fase 9** — Knowledge Document Viewer: nuova finestra che renderizza il
  body Markdown di un progetto come documentazione (Overview/Problem/
  Solution/Challenges), distinta dalla card di `ProjectsWindow`
- **Fase 10** — Netlify Function per la chiamata a OpenRouter (scope
  classification + retrieval su `getAllDocs()` + chiamata con key server-side)
- **Fase 11** — Finestra AI Assistant collegata alla function
- **Fase 12** — Explainability (fonti cliccabili, usa già `path` di
  `KnowledgeDoc`)
