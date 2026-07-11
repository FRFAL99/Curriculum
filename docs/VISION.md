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

Le Fasi 13-14 hanno poi implementato il layout descritto in questo
documento (vedi `docs/FASE13_LOG.md` e `docs/FASE14_LOG.md`): Knowledge
Explorer come sidebar ad albero, AI Assistant come pannello centrale
sempre aperto, layout a tre colonne. La sezione "Layout target" più sotto
descrive la struttura effettivamente implementata, non più solo un
obiettivo.

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
   documentazione.** Sidebar con categorie espandibili (About, Experience,
   Projects, Skills, Education, Developer Notes) che aprono i documenti
   nel Knowledge Document Viewer. Implementata in Fase 13 (sidebar
   sinistra), poi spostata a destra in Fase 14 per fare spazio alle icone
   desktop a sinistra.
3. **"Ask about Francesco" (AI Assistant) diventa l'elemento centrale del
   desktop**, non solo una finestra tra le altre. Implementato in Fase 14:
   non è più una finestra apribile/chiudibile, ma un pannello centrale
   sempre visibile, stile chatbot (header fisso, cronologia scrollabile,
   input ancorato in basso).
4. **La Knowledge Base resta la Single Source of Truth.** Knowledge
   Explorer, Document Viewer e AI Assistant sono tre modi diversi di
   esplorarla — nessuno dei tre introduce una fonte di dati propria.

## Layout a tre colonne (implementato in Fase 14)

Il mockup iniziale (Knowledge Explorer | AI Assistant | Document Viewer)
è stato corretto in fase di implementazione: le icone desktop esistenti
restano a sinistra invece di essere sostituite dall'Explorer, che si
sposta a destra. Il Document Viewer **non** è una quarta colonna fissa:
resta una finestra libera (comportamento Fase 9/13 invariato), che si apre
sopra le tre colonne quando si clicca un documento nell'Explorer o una
fonte citata dall'Assistant.

```
┌──────────────┬──────────────────────────────┬────────────────────┐
│ Icone        │        AI Assistant          │      Knowledge     │
│ desktop      │                              │      Explorer      │
│              │ Ask about Francesco          │                    │
│ 📄 Resume    │                              │ ▼ Experience       │
│ 📂 Projects  │ Suggested questions          │ ▼ Projects         │
│ 🕐 Experience│                              │ ▼ Education        │
│ ✨ Skills    │                              │ ▼ Developer Notes  │
│ ✉ Contact    │                              │                    │
└──────────────┴──────────────────────────────┴────────────────────┘
              Dock (Resume, Projects, Experience, Skills, Contact)

Click su un documento (da Explorer o da una fonte dell'Assistant) →
si apre come finestra libera sopra il layout, trascinabile e chiudibile.
```

- Sinistra → le finestre esistenti (Resume, Projects, Experience, Skills,
  Contact, Developer Notes), raggiungibili anche dal Dock sotto.
- Centro → l'AI Assistant, sempre aperto.
- Destra → esplori la Knowledge Base per categoria.

Su mobile (sotto 640px, dove tre colonne fisse non ci stanno): l'AI
Assistant è la vista di apertura a schermo intero, il Knowledge Explorer
resta dietro il toggle di Fase 13, la colonna icone si nasconde (le stesse
finestre restano raggiungibili dal Dock, sempre visibile).

## Cosa NON è in scope in questa vision

- Nessuna nuova finestra oltre a quelle esistenti (Resume, Projects,
  Experience, Skills, Contact, Developer Notes) più il Knowledge Document
  Viewer.
- Fondere Knowledge Explorer e Document Viewer in un unico pannello: il
  Viewer resta una finestra libera (deciso in Fase 14).
- Nessuna ristrutturazione di `docs/` in sottocartelle (`roadmap/`,
  `adr/`, `vision/`): si resta sulla convenzione piatta già in uso nel
  repo.
- Cross-reference tra documenti ("Related Documents") e "Open in AI" —
  idee ancora da decidere per l'implementazione.
- Un campo "Updated"/data ultima modifica universale: non esiste nel
  frontmatter di tutti i tipi di documento: aggiungerlo richiederebbe
  scrivere contenuto reale, non solo UI (vedi `docs/FASE15_LOG.md`).

Implementate in Fase 15 (vedi `docs/FASE15_LOG.md`): ricerca globale sulla
Knowledge Base (campo di ricerca sopra l'Explorer, filtra su
titolo/tag/corpo del documento) e header con metadata sul Knowledge
Document (badge tipo, periodo/data quando disponibile, tempo di lettura,
tag) — adattivo per tipo di documento, nessun dato inventato.

## Riferimenti

- `docs/ADR-001-knowledge-base.md` — perché la KB è Markdown/SSOT.
- `docs/FASE8_LOG.md` … `docs/FASE15_LOG.md` — implementazione dei pezzi
  che questa vision ricompone: KB loader, Document Viewer, backend
  OpenRouter, Assistant window, fonti cliccabili, Knowledge Explorer,
  layout a tre colonne, ricerca globale, header metadata.
