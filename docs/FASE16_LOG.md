# Fase 16 — Restyle pannello Assistant + colonna icone — Log di avanzamento

Riferimento: documento di visione "Portfolio Architecture — Knowledge Base +
AI Assistant" (vedi `docs/VISION.md`). Non introduce nuove decisioni di
visione: è un restyle su feedback visivo diretto dell'utente sul layout a
tre colonne della Fase 14, confrontato con uno screenshot di riferimento
(chat AI con composer centrato e stile arrotondato).

## Modifica

- **Colonna icone desktop** (`src/desktop/Desktop.css`): rimossi
  `background`, `backdrop-filter` e `border-right` da `.desktop__icons-col`
  (introdotti in Fase 14 per simmetria visiva con l'Explorer). Le icone
  restano nella stessa posizione fissa a sinistra, ma senza più un
  riquadro proprio — sembrano appoggiate sul wallpaper.
- **Pannello Assistant** (`src/windows/Assistant/index.tsx` +
  `Assistant.css`): la resa si divide ora in due rami in base a
  `messages.length === 0`, invece di nascondere/mostrare solo i
  suggerimenti dentro l'area messaggi come in Fase 14:
  - Stato vuoto: nuovo contenitore `.assistant-window__empty` (flex,
    centrato) con dentro intro, input e chip dei suggerimenti, tutto
    centrato verticalmente nel pannello (non più ancorato in fondo).
  - Stato con messaggi: layout invariato (messaggi che scrollano dall'alto,
    input ancorato in fondo).
  - L'input (`renderInputRow()`, estratto per evitare duplicazione JSX tra
    i due rami) è identico nei due stati.
  - `.assistant-window__starter`: da bottone a piena larghezza impilato a
    chip (`border-radius: 999px`, larghezza sul contenuto) in un
    contenitore `flex-wrap` che va a capo quando raggiunge la larghezza
    massima del blocco centrato (~520px, stessa larghezza dell'input).
  - `.assistant-window__input-row`: ridisegnato come pillola unica (bordo
    e sfondo sul contenitore, non sui singoli figli), bottone di invio
    circolare pieno (`background: var(--accent)`), stesso stile in
    entrambi gli stati.
- Nessuna modifica alla logica (chiamata API, storage, fonti cliccabili,
  reset) né al Knowledge Explorer (colonna destra, invariata).

## Verifica

- `npx tsc -b` e `npx oxlint` — puliti.
- Dev server + Chromium headless: stato vuoto → blocco intro/input/chip
  centrato verticalmente nel pannello (differenza dal centro verticale
  reale: 5px su un pannello di 900px di altezza), chip su due righe con
  bordi arrotondati; click su un chip suggerito → layout passa a quello
  classico (messaggio utente in alto, input in fondo, chip spariti);
  colonna icone con `background-color: rgba(0, 0, 0, 0)` (trasparente),
  stessa posizione di prima. Nessun errore di rendering (l'unico errore
  osservato — un 404 sulla chiamata `/api/assistant` — è dovuto al testare
  con `vite` puro invece di `netlify dev`, non è una regressione).

## Stato della roadmap

Il piano principale di `docs/VISION.md` resta quello completato nelle
Fasi 13-14; le Fasi 15-16 sono iterazioni di rifinitura (contenuti/UX e
stile) su idee non ancora decise o su feedback diretto. Restano aperte,
non decise: cross-reference tra documenti e "Open in AI".
