# Fase 18 — Restyle da "desktop OS" a landing page a tab — Log di avanzamento

Nasce da feedback diretto dell'utente: abbandonare la metafora desktop
(wallpaper + icone + dock + finestre draggabili) e passare a una **landing
page classica con Home + tab**, riusando il pattern già introdotto in Fase 17
per i Developer Notes. Resume, Projects e Developer Notes diventano tab
full-page; Experience e Skills vengono **inglobati nel Resume**; Contact
diventa una sezione della Home. La Home mantiene AI Assistant e la Knowledge
Base come **documentazione laterale**.

**Vincolo rispettato:** nessuna modifica a `knowledge-base/**` né a
`netlify/functions/**`. I contenuti restano la Single Source of Truth letta
sia dalla UI (`src/lib/knowledgeBase.ts`) sia dall'AI
(`netlify/functions/lib/kb.ts`, citazioni per `path`): il restyle tocca solo
React/CSS.

## Decisioni (confermate con l'utente in plan mode)

1. **4 tab**: `Home · Curriculum · Progetti · Developer Notes`. Experience e
   Skills dentro il Resume; Contact come sezione della Home (niente tab
   dedicato).
2. **Home**: hero (nome/ruolo/disponibilità da `about.md`) + AI Assistant +
   sezione Contatti in fondo, con la Knowledge Base come doc laterale.
3. **AI Assistant** solo nella Home.
4. **Case study / doc**: vista **master/detail inline** con "Torna indietro"
   (come i Developer Notes), niente più finestre.
5. **Mobile**: i tab collassano in un **hamburger menu** a tendina.

## Modifica

- **Shell e tab** (`src/desktop/Desktop.tsx` + `Desktop.css`): `Tab` esteso a
  `"home" | "resume" | "projects" | "notes"`. Topbar `position: fixed` con
  blur, 4 tab + toggle tema (spostato qui dal Dock) accanto a lingua/orologio.
  Hash per ogni tab (`TAB_HASH`) e nuovo listener `hashchange`: i link
  `#resume`/`#projects`/`#notes` e i tasti back/forward del browser cambiano
  tab anche **dopo** il primo caricamento (prima l'hash era letto solo al
  mount). Sezioni full-page tramite wrapper condiviso `.tab-section`
  (pannello fisso scrollabile) + `.tab-section__inner` centrato.
- **Home** (`HomeSection` in `Desktop.tsx`): colonna principale
  (`.home__main`, con spazio a destra per la KB) che impila hero + assistant +
  contatti; stato locale `docPath` per aprire un documento inline al posto del
  main content.
  - `src/desktop/HomeHero.tsx` (+ `.css`): nuovo hero da `getAbout` con badge
    disponibilità e CTA che cambiano tab (`onNavigate`).
  - `src/desktop/HomeContact.tsx` (+ `.css`): sezione contatti KB-driven
    (`getContacts`/`getSocials`) con copia-negli-appunti, che sostituisce la
    ex finestra Contact (prima con contenuti hardcoded).
- **Doc viewer inline condiviso** (`src/desktop/DocumentDetail.tsx` + `.css`):
  estratto dalla ex `KnowledgeDocumentWindow` (stessa logica frontmatter →
  titolo/tag/periodo + `renderBlock`), ora con pulsante "Torna indietro"
  (`docDetailBack`). Usato da Projects e dalla Knowledge Base della Home.
- **Projects** (`src/windows/Projects/index.tsx` + `.css`): stato locale
  `selectedPath`; "Leggi il case study" apre `<DocumentDetail>` inline invece
  di `openWindow(...)`. Griglia responsive full-page `.projects-grid--page`.
- **Resume** (`src/windows/Resume/index.tsx`): full-page in `.tab-section`;
  nuova sezione "Competenze Tecniche" che riusa `<SkillsWindow />` (la ex
  finestra Skills resta come componente riusabile, non più come tab/icona).
- **AI Assistant** (`src/windows/Assistant/index.tsx`) e **Knowledge Explorer**
  (`src/desktop/KnowledgeExplorer.tsx`): rimossa la dipendenza da
  `useWindowManager`; ora ricevono `onOpenDoc(path)` (+ `activePath` per la KB)
  e delegano l'apertura del documento inline al chiamante.
- **Hamburger mobile** (`Desktop.tsx` + `Desktop.css`): stato `menuOpen`; su
  `@media (max-width: 640px)` la nav `.desktop__tabs` diventa un menu a tendina
  (`position: absolute; top: 100%`) sotto la topbar, aperto dal bottone
  `.desktop__menu-toggle` che mostra icona + tab attivo; su desktop l'hamburger
  è nascosto e i tab restano inline.
- **i18n** (`src/context/translations.ts`): nuove chiavi IT+EN `tabResume`,
  `tabProjects`, `heroCtaResume`, `heroCtaProjects`, `heroContactTitle`,
  `copy`, `copied`, `docDetailBack`. Riuso di `skillsTitle`, `contactTitle`,
  `present`, `readingTimeSuffix`, ecc.
- **App/boot** (`src/App.tsx`, `src/main.tsx`): rimosso `WindowManagerProvider`
  (albero ora `LanguageProvider > Desktop + PrintableResume`); il boot-clear
  pulisce solo `assistantConversation` (`windowManagerState` non esiste più).

## Rimozioni (ritiro della machinery desktop)

Eliminati perché non più agganciati all'albero vivo:

- `src/desktop/`: `WindowManager.tsx`, `Window.tsx`/`.css`,
  `WindowManagerContext.tsx`, `useWindowManager.ts`, `Dock.tsx`/`.css`,
  `DesktopIcon.tsx`/`.css`.
- `src/config/windows.ts` (registro finestre).
- `src/windows/`: `Experience/` (ora inline nel Resume), `Contact/`
  (sostituito da `HomeContact`), `KnowledgeDocument/` (sostituito da
  `DocumentDetail`).

`Wallpaper` è **mantenuto** come sfondo decorativo.

## Verifica

- `tsc -b` + `vite build` e `oxlint` — puliti (0 warning).
- Chromium headless (Playwright), desktop 1280px e mobile 390px:
  - Home: hero da `about.md`, chat AI, KB laterale, contatti in fondo.
  - Curriculum: profilo + esperienza + formazione + Competenze Tecniche
    (6 categorie) + download PDF; su mobile la sidebar CV va a colonna singola.
  - Progetti: griglia 2 colonne; "Leggi il case study" apre il detail inline
    con "Torna indietro" (badge/tag/sorgente `.md`).
  - Knowledge Base (Home): click su un doc → detail inline, "Torna indietro"
    riporta alla Home; voce attiva evidenziata.
  - Deep-link `#resume` a caricamento fresco → apre il tab giusto; toggle tema
    e switch lingua persistono al reload; nessun errore in console.
  - Mobile: hamburger che apre il menu a tendina con i 4 tab (attivo
    evidenziato); selezione chiude il menu.

## Note / possibili sviluppi

- **Contenuto da aggiornare**: il progetto `projects/portfolio-v2.*.md` e il
  README si descrivono ancora come "desktop / draggable windows"; testo ormai
  obsoleto dopo il restyle (contenuto KB, fuori dallo scope di questa fase).
- Deep-link al singolo case study/doc (`#projects/<slug>`) non implementato.
