# Fase 14 — Layout a tre colonne — Log di avanzamento

Riferimento: documento di visione "Portfolio Architecture — Knowledge Base +
AI Assistant" (vedi `docs/VISION.md`). Prosegue dalla Fase 13 (Knowledge
Explorer): trasforma il desktop da window manager libero con finestre
equivalenti a un layout con tre zone fisse, come da visione.

Obiettivo della fase: rendere l'AI Assistant l'elemento centrale, sempre
aperto, del desktop; spostare il Knowledge Explorer a destra; rendere fissa
la griglia icone a sinistra. Il Document Viewer resta una finestra libera.

Decisioni prese con l'utente prima di implementare (hanno corretto il
mockup iniziale della vision):
- **Struttura reale**: icone desktop a sinistra, AI Assistant al centro,
  Knowledge Explorer a destra — non "Explorer a sinistra" come nel mockup
  originale.
- **AI Assistant**: pannelli fissi, non finestra — sostituisce il bottone
  che oggi lo apre, sempre visibile, stile chatbot vero (header + cronologia
  + input ancorato in basso).
- **Document Viewer**: resta una finestra libera aperta sopra il layout,
  non diventa una quarta colonna fissa — scartata l'opzione "un unico
  pannello destro con Explorer e documento insieme".
- **Mobile**: l'Assistant diventa la vista di apertura a schermo intero,
  Explorer resta dietro il toggle di Fase 13, colonna icone nascosta.

---

## Step 1 — Rimozione dell'Assistant da `windowsConfig`

**Stato: ✅ completato**

`src/config/windows.ts`: rimossa del tutto la entry `"assistant"`. Non è
più una `Window` — nessun payload, posizione, zIndex o stato minimizzato
da tracciare. Verificato via grep che l'id `"assistant"` non è referenziato
altrove nel codebase. `Dock` e la griglia icone (entrambi filtrano
`windowsConfig`) escludono automaticamente l'Assistant di conseguenza,
senza bisogno di modifiche a `Dock.tsx`.

## Step 2 — `AssistantWindow` come pannello fisso

**Stato: ✅ completato**

`src/windows/Assistant/index.tsx` + `Assistant.css`:
- Aggiunto un header interno (icona Bot + "Ask about Francesco"), dato che
  il titolo prima veniva dalla titlebar della `Window`, ora assente. Il
  pulsante "Nuova conversazione" si è spostato dal fondo della finestra
  all'header (icona sola, stile pulsante di controllo finestra).
- Layout convertito da `max-height: 42vh` (pensato per una finestra) a
  `height: 100%` con `.assistant-window__messages` a `flex: 1; min-height:
  0`, così i messaggi scrollano e l'input resta ancorato in basso in
  qualunque altezza disponibile.
- Suggested questions ridotte da 7 a 4 (`conversationStarters[language]
  .slice(0, 4)`), spaziatura dei bottoni aumentata.
- Nessuna modifica alla logica: chiamata a `/api/assistant`, storage
  conversazione, fonti cliccabili (`openWindow("knowledge-document",
  { path })`) invariati.

## Step 3 — Layout a tre colonne in `Desktop.tsx`/`Desktop.css`

**Stato: ✅ completato**

- La griglia icone (`DesktopIcon`, dati da `windowsConfig.filter(w =>
  !w.hidden)`) è ora racchiusa in `.desktop__icons-col`, colonna fissa a
  sinistra (264px, stesso stile a blur/bordo del Knowledge Explorer),
  al posto del flusso sotto la topbar. Grid interna passata a 2 colonne
  esplicite per adattarsi alla larghezza fissa.
- `<AssistantWindow />` montato direttamente in `Desktop.tsx` (senza
  wrapper `<Window>`) dentro `.desktop__assistant-col`, pannello fisso
  centrale tra le due colonne laterali (`left: 264px; right: 264px`).
- `KnowledgeExplorer.css`: spostato da `left: 0` a `right: 0` (bordo da
  `border-right` a `border-left`). Nessuna modifica a
  `KnowledgeExplorer.tsx` — stessa logica/dati della Fase 13.
- `.desktop__topbar`: padding simmetrico (`296px` sia a sinistra che a
  destra) per non far finire orologio/switcher lingua sotto le colonne
  fisse.

### Fix stacking (z-index)

Le finestre libere (`Window.tsx`/`WindowManagerContext.tsx`) partono da
`zIndex: BASE_Z = 10`. Il Knowledge Explorer (Fase 13) usava `z-index:
15` — con Assistant e icone diventate colonne fisse a piena altezza,
una finestra libera appena aperta (10) sarebbe finita **dietro** queste
colonne (15), invisibile. Fix: `z-index` delle tre colonne fisse
(icone, Assistant, Explorer) abbassato a `5`, sotto `BASE_Z`. Verificato
in Chromium: aprendo Resume dalla colonna icone, la finestra appare
correttamente sopra le tre colonne, trascinabile e chiudibile.

## Step 4 — Mobile

**Stato: ✅ completato**

Sotto `@media (max-width: 640px)`: `.desktop__icons-col` nascosta
(`display: none`), `.desktop__assistant-col` diventa a piena larghezza
(`left: 0; right: 0`) — l'Assistant è la vista di apertura. Il toggle e il
comportamento overlay del Knowledge Explorer restano quelli della Fase 13,
invariati. Il Dock resta raggiungibile (era già visibile su mobile prima
di questa fase).

## Step 5 — Verifica

**Stato: ✅ completato**

- `npx tsc -b` e `npx oxlint` — puliti.
- Dev server + Chromium headless (Playwright): viewport 1440×900 → icone a
  sinistra, Assistant al centro con header e 4 suggested questions, Dock
  senza il bottone Assistant, Knowledge Explorer a destra; click su un
  documento dell'Explorer apre il Document Viewer come finestra libera
  sopra il layout (pulsante chiudi funzionante); doppio click su "Resume"
  nella colonna icone apre la finestra Resume **visibile sopra** le tre
  colonne (conferma esplicita del fix di stacking — box renderizzato a
  `x:380, y:155`, non nascosto dietro nessuna colonna). Nessun errore in
  console. Viewport mobile 375×812 → colonna icone nascosta, Assistant a
  schermo intero come home, Dock visibile sotto l'input.

---

## Cosa resta (Fasi successive, non in scope qui)

- Ricerca globale sulla Knowledge Base.
- Cross-reference tra documenti (Related Documents).
- Header "Knowledge Document" con metadata (progetto/data/reading
  time/topics).
- "Open in AI" — aprire l'Assistant pre-contestualizzato su un documento.
