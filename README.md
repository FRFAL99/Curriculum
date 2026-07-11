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

## Cosa resta (rifiniture opzionali, non richieste dalla roadmap)

- Titoli di finestre/icone e l'etichetta del toggle tema nel Dock non sono
  ancora collegati al sistema di traduzioni (vedi log Fase 4)
- Nessun resize delle finestre (scelta esplicita della roadmap per la v1)

## Struttura

```
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
  data/
    resume.json, projects.json, skills.json
  utils/
    storage.ts        Wrapper sicuro su localStorage (get/set JSON)
  styles/
    tokens.css        Palette, font, ombre, radius
```
