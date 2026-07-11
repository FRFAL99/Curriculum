# Fase 2 — Window Manager — Log di avanzamento

Riferimento: `Curriculum_Portfolio_v2_Roadmap.md`, sezione "Fase 2 - Window Manager".

Obiettivo dichiarato dalla roadmap: componente `Window` generico con
apertura/chiusura, minimizzazione, focus, animazioni leggere.
**Niente ridimensionamento in questa versione.**

Task spezzato in step indipendenti, ognuno buildato e verificato
(`tsc --noEmit`, `npm run build`, `oxlint`) prima di passare al successivo.

---

## Step 1 — Stato del Window Manager (context + reducer)

**Stato: ✅ completato**

File: `src/desktop/WindowManagerContext.tsx`.

- Reducer con azioni `OPEN, CLOSE, FOCUS, MINIMIZE, RESTORE, MOVE`
- `toggleFromDock(id)`: se la finestra non esiste la apre; se è minimizzata
  la ripristina; se è già quella a fuoco la minimizza; altrimenti la porta
  a fuoco. Replica il comportamento tipico di un dock reale (click
  sull'icona di un'app già aperta e attiva → minimizza).
- `tsc --noEmit`: OK

- Nuovo `src/desktop/WindowManagerContext.tsx`
- Reducer con azioni: `OPEN`, `CLOSE`, `FOCUS`, `MINIMIZE`, `RESTORE`
- Stato per finestra: `{ id, zIndex, minimized, position }`
- `position` iniziale presa da `defaultPosition` in `config/windows.ts`
- Un contatore globale di z-index per portare in primo piano la finestra attiva

## Step 2 — Componente `Window` (Fase 2 pilastro principale)

**Stato: ✅ completato**

File: `src/desktop/Window.tsx` (sostituisce lo stub della Fase 1), `Window.css`.

- Drag tramite `onPointerDown/Move/Up` sulla titlebar (Pointer Events invece
  di mouse events: funzionano anche su touch, utile per mobile/tablet)
- La finestra viene "clampata" per restare sempre almeno parzialmente visibile
  (non si può trascinare completamente fuori schermo)
- Click in qualsiasi punto della finestra → focus (porta in primo piano)
- Escape chiude la finestra a fuoco più recente (comportamento semplice,
  da rifinire se in futuro serve gestione focus più sofisticata)
- Animazione apertura: scale 0.96→1 + fade, 160ms, coerente con
  `prefers-reduced-motion` già gestito globalmente
- Niente resize handle, come richiesto dalla roadmap per la v1
- `tsc --noEmit`: OK

- Titlebar con titolo, pulsanti chiudi/minimizza (niente resize)
- Drag della finestra tramite titlebar (mouse down/move/up)
- Click ovunque nella finestra → porta a fuoco (chiama `FOCUS`)
- Animazione di apertura/chiusura leggera (scale + opacity, ~150ms)
- Rispetta `prefers-reduced-motion` (già gestito a livello globale in `index.css`)

## Step 3 — `WindowManager` (renderer delle finestre aperte)

**Stato: ✅ completato**

File: `src/desktop/WindowManager.tsx`.

- Filtra `windows` per escludere quelle minimizzate, mappa il resto su `<Window>`
- Contenuto placeholder testuale per confermare visivamente il collegamento
  config → istanza finestra, in attesa dei componenti reali di Fase 4
- `tsc --noEmit`: OK

- Legge lo stato dal context, mappa le finestre aperte (non minimizzate) su `<Window>`
- Contenuto placeholder per ciascuna finestra (il contenuto reale arriva in Fase 4)

## Step 4 — Collegamento Desktop / Icone / Dock

**Stato: ✅ completato**

File: `Desktop.tsx`, `Dock.tsx`, `Dock.css`, `App.tsx`.

- `App.tsx` avvolge `<Desktop />` in `<WindowManagerProvider>`
- Doppio click su un'icona desktop → `openWindow(id)` reale
- Click nel dock → `toggleFromDock(id)`: apre / porta a fuoco / minimizza
  a seconda dello stato corrente (comportamento dock reale)
- Puntino indicatore (`--accent`) sotto le icone del dock per le finestre
  aperte (minimizzate incluse, per dare sempre visibilità di cosa è "in esecuzione")

- `DesktopIcon` doppio click → `openWindow(id)` reale (non più solo `console.info`)
- Dock: click su un'icona → apri, oppure se già aperta e minimizzata → ripristina,
  oppure se già aperta e a fuoco → minimizza (comportamento "toggle" tipo dock reale)
- Indicatore visivo nel dock per le finestre aperte (puntino sotto l'icona)

## Step 5 — Verifica finale

**Stato: ✅ completato**

- `tsc --noEmit`: OK
- `npm run build`: OK (bundle ~202 KB / 64 KB gzip)
- `npm run lint` (oxlint): 0 warning, 0 errori
- `useWindowManager` spostato in file dedicato `useWindowManager.ts` per
  eliminare il warning `react(only-export-components)` di oxlint — file che
  esportano solo componenti fanno funzionare meglio il fast refresh di Vite
- `README.md` e zip aggiornati

---

## Decisioni prese durante l'implementazione

- **Pointer Events invece di Mouse Events per il drag**: garantiscono lo
  stesso codice funzioni anche su touch (tablet), utile visto che la
  roadmap richiede "Mobile friendly" come principio guida fin dalla Fase 1.
- **Clamping della posizione** invece di un vero drag-boundary: scelta
  volutamente semplice per restare "no over-engineering" (altro principio
  della roadmap); rifinibile in futuro se serve un comportamento da vero OS.
- **`toggleFromDock` con logica "stessa icona già a fuoco → minimizza"**:
  comportamento preso in prestito dai dock reali (macOS-like), non esplicitamente
  richiesto dalla roadmap ma coerente con "Window Manager" e a costo quasi nullo.
- **Nessuna persistenza ancora**: tema e finestre aperte si resettano al
  reload. È esplicitamente compito della Fase 5 ("Gestione con
  Context/Zustand. Persistenza: tema, finestre aperte, finestra attiva"),
  quindi non anticipata qui per restare dentro lo scope della Fase 2.
- **`Window.tsx`**: la Fase 1 lo aveva creato come stub vuoto; qui è stato
  sostituito integralmente con l'implementazione reale (stesso file, non
  un file parallelo), come previsto dalla struttura della roadmap.

## Prossimi passi (fuori da questa Fase)

- Fase 3: la config esiste già (`config/windows.ts`), da valutare se serve
  altro oltre a quanto fatto qui prima di passare alla Fase 4
- Fase 4: sostituire `PlaceholderContent` in `WindowManager.tsx` con i
  componenti reali per Resume, Projects, Experience, Skills, Contact,
  Developer Notes, popolando `src/data/*.json` con i contenuti del vecchio CV
- Fase 5: persistenza (tema, finestre aperte, finestra attiva) via
  localStorage o simile, gestione stato eventualmente con Zustand se il
  Context inizia a diventare scomodo
