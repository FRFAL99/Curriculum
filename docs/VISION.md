# Vision — Portfolio Architecture — Knowledge Base + AI Assistant

Documento di visione citato da `docs/FASE8_LOG.md` … `docs/FASE12_LOG.md`
come riferimento guida per le Fasi 8-12 (Knowledge Base + AI Assistant).
Fino ad ora esisteva solo nella cronologia di una chat: questo file lo
formalizza e definisce la direzione per l'evoluzione successiva.

## Stato attuale (riferimento: Fasi 8-12)

Le Fasi 8-12 hanno già costruito i pezzi fondamentali:

- **Knowledge Base come Single Source of Truth**: contenuti in
  `knowledge-base/**/*.md` (Markdown + frontmatter), caricati a build time
  da `src/lib/knowledgeBase.ts` e, lato backend, da
  `netlify/functions/lib/kb.ts`. Motivazioni e alternative scartate sono
  documentate in `docs/ADR-001-knowledge-base.md`.
- **Knowledge Document Viewer**: `src/windows/KnowledgeDocument/index.tsx`,
  finestra generica (nascosta, nessuna icona sul desktop) che renderizza un
  singolo documento della KB dato un `path`, aperta via payload da Projects
  e dalle fonti dell'Assistant.
- **AI Assistant grounded su OpenRouter**: `src/windows/Assistant/index.tsx`
  + `netlify/functions/assistant.ts`. Risponde usando l'intera KB come
  contesto, mostra conversation starter quando la chat è vuota, e dalla
  Fase 12 (Explainability) le fonti citate in risposta sono pulsanti
  cliccabili che aprono il Knowledge Document Viewer.
- **Desktop come window manager libero**: `src/desktop/Desktop.tsx` +
  `WindowManagerContext.tsx` gestiscono finestre trascinabili, ridimensionabili
  e sovrapponibili in stile macOS. Tutte le finestre, Assistant incluso,
  sono equivalenti: si aprono centrate la prima volta e mantengono
  l'ultima posizione salvata — non esiste oggi un layout fisso né un
  elemento "protagonista".

Quello che **non esiste ancora** è una sidebar di navigazione strutturata
per la Knowledge Base: oggi i contenuti sono raggruppati per categoria solo
a livello di frontmatter (`type: about|experience|project|...`) e vengono
consumati da finestre dedicate (Resume, Projects, Experience, Skills), non
da un unico esploratore ad albero.

## La direzione: da portfolio a Personal Knowledge System

Il progetto si sta spostando da concetto di "portfolio con CV" a concetto
di "sistema di conoscenza personale": la stessa Knowledge Base che oggi
alimenta le finestre esistenti e l'AI Assistant diventa esplorabile in tre
modi diversi e complementari — non tre fonti di dati separate, ma tre
interfacce sugli stessi file:

- **Knowledge Explorer** — navigazione ad albero, per categoria.
- **AI Assistant** — interrogazione in linguaggio naturale.
- **Document Viewer** — lettura del documento selezionato.

## Decisioni di visione

1. **Il Desktop diventa il contenitore, non il protagonista.** L'ambiente
   macOS-style resta, ma smette di essere l'elemento su cui si concentra
   l'attenzione del visitatore.
2. **Il Knowledge Explorer diventa il punto di ingresso principale alla
   documentazione.** Sidebar sinistra con categorie espandibili (About,
   Experience, Projects, Skills, Education, ...) che aprono i documenti
   nel Knowledge Document Viewer. *Non ancora implementato* — è la vera
   novità di questa vision, non una feature esistente da ridocumentare.
3. **"Ask about Francesco" (AI Assistant) diventa l'elemento centrale del
   desktop**, non solo una finestra tra le altre.
4. **La Knowledge Base resta la Single Source of Truth.** Knowledge
   Explorer, Document Viewer e AI Assistant sono tre modi diversi di
   esplorarla — nessuno dei tre introduce una fonte di dati propria.

## Layout target: tre colonne

```
┌──────────────┬──────────────────────────────┬────────────────────┐
│ Knowledge    │        AI Assistant          │      Document      │
│ Explorer     │                              │      Viewer        │
│              │ Ask about Francesco          │                    │
│ 📂 Projects  │                              │ Antichità          │
│ 📂 Skills    │ Suggested questions          │                    │
│ 📂 Experience│                              │ Overview           │
│ 📂 Education │                              │ Architecture       │
│ 📂 ...       │                              │ Challenges         │
└──────────────┴──────────────────────────────┴────────────────────┘
```

- Sinistra → esplori la Knowledge Base.
- Centro → interroghi l'AI Assistant.
- Destra → leggi il documento selezionato.

## Cosa NON è in scope in questa vision

- Nessuna nuova finestra oltre a quelle esistenti (Resume, Projects,
  Experience, Contact, Developer Notes, Assistant).
- Nessuna ristrutturazione di `docs/` in sottocartelle (`roadmap/`,
  `adr/`, `vision/`): si resta sulla convenzione piatta già in uso nel
  repo.

## Riferimenti

- `docs/ADR-001-knowledge-base.md` — perché la KB è Markdown/SSOT.
- `docs/FASE8_LOG.md` … `docs/FASE12_LOG.md` — implementazione dei pezzi
  che questa vision ricompone: KB loader, Document Viewer, backend
  OpenRouter, Assistant window, fonti cliccabili.
