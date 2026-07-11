# Portfolio v2 — Desktop

Migrazione del portfolio a un "desktop" minimale, secondo
`Curriculum_Portfolio_v2_Roadmap.md`. Stack: **React + TypeScript + Vite**.

## Avvio in locale

```bash
npm install
npm run dev
```

Poi apri l'indirizzo mostrato in terminale (di norma `http://localhost:5173`).

## Build di produzione

```bash
npm run build   # genera dist/
npm run preview # per verificare la build in locale
```

## Deploy su Netlify

Il repo include `netlify.toml`, quindi Netlify dovrebbe configurarsi da solo.
Se il sito risulta **bianco** dopo il deploy, controlla comunque queste
impostazioni in Netlify → Site settings → Build & deploy → Build settings
(le impostazioni salvate manualmente nella dashboard hanno la precedenza
su `netlify.toml`):

- **Base directory**: vuoto (il progetto è alla radice del repo)
- **Build command**: `npm run build`
- **Publish directory**: `dist` ⚠️ — è la causa più comune di pagina bianca:
  l'`index.html` alla radice del repo referenzia `/src/main.tsx` (un file
  `.tsx` grezzo, eseguibile solo da Vite in sviluppo). Se Netlify pubblica
  la radice del repo invece di `dist/`, il browser prova a caricare quel
  file grezzo e fallisce silenziosamente. `dist/index.html` (generato da
  `vite build`) referenzia invece il bundle già compilato ed è quello giusto
  da pubblicare.

Se il problema persiste, apri la Console del browser (F12) sulla pagina
bianca: un errore su `/src/main.tsx` o un "Unexpected token" conferma
esattamente questa causa.

## Stato — Fase 1 (completata in questa consegna)

- [x] Layout Desktop (`src/desktop/Desktop.tsx`)
- [x] Wallpaper minimale — griglia a puntini + readout coordinate mouse
      in monospace (`src/desktop/Wallpaper.tsx`)
- [x] Dock inferiore con icone e tooltip (`src/desktop/Dock.tsx`)
- [x] Sistema di icone desktop, selezionabili con click singolo
      (`src/desktop/DesktopIcon.tsx`)
- [x] Tema light/dark via CSS variables, toggle nel dock
      (persistenza rimandata alla Fase 5, come da roadmap)

### Design token

Palette e font sono centralizzati in `src/styles/tokens.css`:

- **Font sistema/chrome**: JetBrains Mono (dock, orologio, coordinate, titoli finestra)
- **Font contenuto**: Inter (per le finestre con testo, dalla Fase 4)
- **Accento**: teal segnale (`--accent`) — dark `#4fd1c5`, light `#0f9c8f`
- Nessuna dipendenza da UI kit: solo CSS puro + `lucide-react` per le icone

## Stato — Fase 2 (completata in questa consegna)

Log dettagliato passo-passo: [`docs/FASE2_LOG.md`](./docs/FASE2_LOG.md).

- [x] `WindowManagerContext` — stato centralizzato di tutte le finestre
      (aperte, a fuoco, minimizzate, posizione)
- [x] Componente `Window` reale: drag dalla titlebar, focus al click,
      minimizza/chiudi, animazione di apertura, niente resize (come da roadmap)
- [x] `WindowManager` — renderizza le finestre aperte con contenuto
      placeholder (il contenuto reale arriva in Fase 4)
- [x] Icone desktop e dock collegati al Window Manager reale (non più stub)
- [x] Dock con indicatore (puntino) per le finestre aperte, comportamento
      "toggle" al click su un'icona già aperta

## Stato — Fase 3 (completata in questa consegna)

Log: [`docs/FASE3_LOG.md`](./docs/FASE3_LOG.md).

- [x] `WindowConfig` include ora `component`: ogni finestra è collegata al
      proprio componente React reale
- [x] 6 placeholder tipizzati in `src/windows/<Nome>/index.tsx`
- [x] `WindowManager` renderizza `config.component` genericamente, non più
      un placeholder hardcoded

## Stato — Fase 4 (completata)

Log dettagliato: [`docs/FASE4_LOG.md`](./docs/FASE4_LOG.md).

- [x] Le 6 finestre (Resume, Projects, Experience, Skills, Contact,
      Developer Notes) hanno contenuto reale, migrato dal vecchio CV
- [x] Sistema di traduzione IT/EN (`context/LanguageContext.tsx`), con
      auto-detect lingua browser e persistenza in `localStorage`
- [x] Download PDF del CV via `window.print()` + layout stampabile dedicato
      (`windows/Resume/PrintableResume.tsx`) — niente più html2canvas/jsPDF
- [x] Copia rapida email/telefono negli appunti nella finestra Contact

Questa fase è arrivata in parte da un push esterno che non passava ancora
la build: nel log trovi l'elenco dei problemi risolti (bug di stampa PDF
che produceva un foglio bianco, bundle gonfiato da un import a wildcard
di `lucide-react`, icone brand non più esportate dalla libreria, alcuni
errori TypeScript).

## Stato — Fase 5 (completata) — 🎉 roadmap completa

Log: [`docs/FASE5_LOG.md`](./docs/FASE5_LOG.md).

- [x] Tema persistito in `localStorage`, con fallback a `prefers-color-scheme`
      di sistema se non c'è nulla di salvato
- [x] Finestre aperte, posizione e stato minimizzato persistiti in
      `localStorage` (si ripristinano esattamente come le hai lasciate)
- [x] Finestra attiva ripristinata automaticamente (derivata dal suo `zIndex`,
      nessun dato extra da gestire)
- [x] Lingua già persistita dalla Fase 4

Tutti i punti della roadmap `Curriculum_Portfolio_v2_Roadmap.md` sono ora
implementati.

## Stato — Fase 6 (completata) — fix mobile

- [x] **Finestre non più tagliate/irraggiungibili su schermi piccoli**: sotto i
      640px le finestre (larghezza fissa 420–680px in `config/windows.ts`,
      pensata per desktop) venivano posizionate/trascinate fuori dai bordi
      dello schermo, rendendo la titlebar — e quindi il pulsante di chiusura —
      irraggiungibile. Ora sotto il breakpoint mobile ogni `Window` viene
      ancorata a un riquadro fisso sempre interamente visibile (vedi
      `.window--mobile` in `src/desktop/Window.css`), il corpo scrolla
      internamente con un'altezza calcolata via `100dvh`, e il drag dalla
      titlebar è disabilitato (inutile: la posizione è fissa) tramite l'hook
      `useIsMobile` (`src/utils/useIsMobile.ts`). I pulsanti minimizza/chiudi
      sono anche più grandi (32×32) per un tocco più preciso.
- [x] **Apertura icone su touch**: le icone desktop si aprivano solo con
      `onDoubleClick`, gesto poco affidabile su mobile. Ora il primo tap
      seleziona l'icona e un secondo tap (icona già selezionata) la apre —
      comportamento che funziona sia su touch sia su desktop, dove resta
      anche il doppio click diretto (`src/desktop/DesktopIcon.tsx`).

## Stato — Fase 7 (completata) — centraggio, schermo intero, tap singolo

- [x] **Apertura sempre centrata**: le finestre non usano più una posizione
      iniziale fissa per config (`defaultPosition` è ora opzionale e non
      valorizzata da nessuna voce). Ogni apertura "fresca" (non un
      restore da minimizzata) parte da una posizione sentinella; al primo
      render `Window.tsx` misura l'altezza reale della finestra e la centra
      di conseguenza (orizzontalmente in base alla `width` di config,
      verticalmente in base al contenuto effettivo), poi scrive la
      posizione calcolata nello stato — da lì in poi è draggabile e
      persistita come prima.
- [x] **Schermo intero (desktop)**: nuovo pulsante nella titlebar (icona
      Maximize2/Minimize2) per portare una finestra a occupare tutto lo
      spazio disponibile (topbar e dock esclusi), o doppio click sulla
      titlebar. Abilitato per ora solo sulla finestra **Resume**
      (`allowMaximize: true` in `config/windows.ts` — basta aggiungerlo
      alle altre finestre per estenderlo). Non è un resize libero
      dell'utente (resta fuori scope, come da roadmap originale): è un
      toggle preimpostato tra la dimensione di config e "tutto lo
      schermo". Non disponibile su mobile, dove le finestre sono già
      pressoché a schermo intero di default. Il drag è disabilitato
      mentre una finestra è massimizzata.
- [x] **Icone: un solo tap su mobile**: il pattern "seleziona poi apri"
      introdotto in Fase 6 restava comunque un doppio gesto, poco
      intuitivo. Ora su mobile un singolo tap apre direttamente la
      finestra; su desktop resta invariato il comportamento
      seleziona/apri (con anche il doppio click come scorciatoia).

## Stato — Fase 8 (completata) — Knowledge Base

Log dettagliato: [`docs/FASE8_LOG.md`](./docs/FASE8_LOG.md).
Decisioni architetturali: [`docs/ADR-001-knowledge-base.md`](./docs/ADR-001-knowledge-base.md).

Prima fase della roadmap "Knowledge Base + AI Assistant" (documento di
visione condiviso in sessione, da committare — vedi nota nel log).

- [x] Nuova cartella `knowledge-base/` (root del repo): documenti Markdown
      con frontmatter, Single Source of Truth per profilo, esperienze,
      formazione, competenze, progetti, developer notes — in italiano e
      inglese
- [x] Loader tipizzato `src/lib/knowledgeBase.ts` (letto a build-time via
      `import.meta.glob`, nessuna fetch a runtime)
- [x] `ResumeWindow`, `ExperienceWindow`, `SkillsWindow`, `ProjectsWindow`,
      `DeveloperNotesWindow` e `PrintableResume` non contengono più testo
      hardcoded: leggono tutti dalla Knowledge Base
- [x] `src/data/{resume,skills,projects}.json` rimossi (sostituiti)
- [x] `translations.ts` ridotto alle sole etichette di interfaccia (vedi
      ADR-001 per il criterio contenuto-vs-chrome)
- [x] Fix `Buffer is not defined` a runtime (schermo bianco): `gray-matter`
      usa `Buffer` internamente, assente nel browser — polyfill in
      `src/polyfills.ts` (vedi `FASE8_LOG.md`, Step 6)

## Stato — Fase 9 (completata) — Knowledge Document Viewer

Log dettagliato: [`docs/FASE9_LOG.md`](./docs/FASE9_LOG.md).

- [x] Contenuto dei progetti arricchito con sezioni Overview/Problem/
      Solution/Challenges/Future Improvements (IT + EN); corretto lo
      `stack` di Antichità Fallavena (era HTML/CSS/JS, in realtà
      Next.js + Firebase + Netlify)
- [x] `WindowManager` esteso con un payload opzionale per finestra
      (`openWindow(id, payload)`), meccanismo generico riusabile in
      Fase 12 per aprire un documento da una citazione dell'AI Assistant
- [x] Nuova finestra `KnowledgeDocumentWindow` (nascosta dal desktop,
      apribile solo via payload): renderizza il body Markdown intero di
      un documento con `renderBlock()`, distinta dalla card teaser di
      `ProjectsWindow`
- [x] `ProjectsWindow`: teaser ridotto alla sola sezione Overview
      (`getOverviewExcerpt()`), nuovo bottone "Leggi il case study" per
      aprire il Viewer

## Stato — Fase 10 (completata) — Netlify Function per OpenRouter

Log dettagliato: [`docs/FASE10_LOG.md`](./docs/FASE10_LOG.md).

Solo backend in questa fase, nessuna UI (arriva in Fase 11).

- [x] `netlify/functions/assistant.ts`: riceve `{ message, language,
      history? }`, classifica lo scope della domanda e risponde grounded
      sulla Knowledge Base in un'unica chiamata a OpenRouter (modello
      free tier di default, configurabile via `OPENROUTER_MODEL`)
- [x] Loader KB dedicato lato server (`netlify/functions/lib/kb.ts`):
      `src/lib/knowledgeBase.ts` usa `import.meta.glob`, solo Vite, non
      disponibile dentro una Netlify Function
- [x] `netlify.toml`: `[functions]` con `included_files` per i `.md`
      letti a runtime, redirect `/api/assistant`
- [x] Tooling locale: `netlify-cli`, script `npm run dev:full`,
      `.env.example`, `.gitignore` aggiornato per `.env`/`.netlify`
- [x] `tsconfig.functions.json` referenziato dal `tsconfig.json` radice:
      `npx tsc -b` valida anche le function

## Stato — Fase 11 (completata) — Finestra AI Assistant

Log dettagliato: [`docs/FASE11_LOG.md`](./docs/FASE11_LOG.md).

- [x] Nuova finestra "Ask about Francesco" (`src/windows/Assistant/`),
      dock-visibile: collega `/api/assistant` (Fase 10) a una vera UI
      conversazionale, con suggerimenti di conversazione dal documento di
      visione quando la chat è vuota
- [x] Conversazione persistita in localStorage (come lo stato delle altre
      finestre); bottone "Nuova conversazione" per svuotarla
- [x] Risposte renderizzate con `renderBlock()` (markdown → HTML, stesso
      helper del Knowledge Document Viewer); fonti mostrate come testo
      semplice (collegamento cliccabile rimandato a Fase 12)
- [x] Gestione errori con banner + "Riprova" (non duplica il turno utente)

## Stato — Fase 12 (completata) — Explainability

Log dettagliato: [`docs/FASE12_LOG.md`](./docs/FASE12_LOG.md).

Ultima fase della roadmap "Knowledge Base + AI Assistant" (Fasi 8-12).

- [x] Le fonti mostrate sotto le risposte dell'assistente in
      `AssistantWindow` sono ora cliccabili: aprono
      `KnowledgeDocumentWindow` per quel documento (stesso meccanismo
      payload già usato da "Leggi il case study" in `ProjectsWindow`)

### Idee non implementate (possibili sviluppi futuri, non richieste dalla roadmap)

- Evidenziare la sezione specifica del documento citata (oggi si apre
  l'intero documento)
- Confidence score sulla risposta, streaming, rate limiting reale sulla
  function (vedi "Cosa resta" in `FASE12_LOG.md`)

## Cosa resta (rifiniture opzionali, non richieste dalla roadmap)

- Titoli di finestre/icone e l'etichetta del toggle tema nel Dock non sono
  ancora collegati al sistema di traduzioni (vedi log Fase 4)
- Nessun resize libero delle finestre (scelta esplicita della roadmap per
  la v1); lo schermo intero introdotto in Fase 7 è un toggle preimpostato,
  non un vero resize

## Struttura

```
knowledge-base/   Single Source of Truth dei contenuti (Fase 8)
  about.it.md, about.en.md
  config/         contacts.md, socials.md
  experience/     un file .it.md + .en.md per ruolo
  education/      un file .it.md + .en.md per titolo di studio
  skills.md       lang-neutral, label di categoria bilingue in frontmatter
  projects/       un file .it.md + .en.md per progetto
  developer-notes/ un file .it.md + .en.md per nota

src/
  desktop/
    Desktop.tsx              Layout principale, stato tema/selezione
    Wallpaper.tsx             Sfondo a griglia + coordinate
    Dock.tsx                  Barra inferiore, indicatore finestre aperte
    DesktopIcon.tsx           Icona singola selezionabile
    Window.tsx                Finestra reale: drag, focus, minimizza, chiudi
    WindowManager.tsx         Renderizza le finestre aperte dal context
    WindowManagerContext.tsx  Stato centralizzato (reducer) di tutte le finestre
    useWindowManager.ts       Hook di accesso al context
  windows/
    Resume/       CV completo + PrintableResume.tsx (layout per il PDF)
    Projects/      Card progetti con immagine/stack/link
    Experience/    Timeline verticale
    Skills/        Competenze per categoria (no barre percentuali)
    Contact/       Link rapidi + copia negli appunti
    DeveloperNotes/ Casi di problem solving
  components/
    SocialIcons.tsx GitHub/LinkedIn (non più in lucide-react)
  context/
    LanguageContext.tsx  Provider IT/EN
    translations.ts       Dati di traduzione
    useLanguage.ts        Hook di accesso al context lingua
  config/
    windows.ts        Config centrale delle finestre
  lib/
    knowledgeBase.ts  Loader tipizzato della Knowledge Base (Fase 8)
    markdown.ts       Helper di rendering Markdown → HTML (renderInline/renderBlock)
  utils/
    storage.ts        Wrapper sicuro su localStorage (get/set JSON)
    useIsMobile.ts     Hook breakpoint mobile (640px), sincronizzato col CSS
  styles/
    tokens.css        Palette, font, ombre, radius
```
