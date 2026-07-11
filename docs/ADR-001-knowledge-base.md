# ADR-001 — Knowledge Base in Markdown come Single Source of Truth

**Stato**: Accettata — implementata in Fase 8
**Data**: Fase 8 (vedi `docs/FASE8_LOG.md` per il log passo-passo)

## Contesto

Fino alla Fase 7 il contenuto "di fatto" su Francesco (profilo, esperienze,
formazione, competenze, progetti, developer notes) viveva sparso in tre
posti diversi:

1. `src/data/{resume,skills,projects}.json`
2. `src/context/translations.ts` (chiavi come `jobDesc`, `resp1`...`resp8`,
   `soft1`...`soft4`, `note1Title`, ecc.)
3. Direttamente hardcoded dentro i componenti (`ResumeWindow`,
   `ExperienceWindow`, `PrintableResume`), spesso **triplicato**: la stessa
   esperienza lavorativa esisteva come testo in `ResumeWindow`, come array
   in `ExperienceWindow` e di nuovo come testo in `PrintableResume`.

Il documento di visione "Portfolio Architecture — Knowledge Base + AI
Assistant" propone di introdurre un layer di Knowledge Base in Markdown
con frontmatter come Single Source of Truth, condiviso da sito e futuro
assistente AI.

## Decisione

Introdurre `knowledge-base/` alla radice del repo: documenti `.md` con
frontmatter YAML, letti a build-time da un loader (`src/lib/knowledgeBase.ts`)
tramite `import.meta.glob`. I componenti React leggono solo da questo
loader, mai testo hardcoded.

### Cosa va in Knowledge Base vs cosa resta in `translations.ts`

Criterio adottato: **è un fatto su Francesco, o è testo di interfaccia?**

| Nella Knowledge Base | Resta in `translations.ts` (chrome) |
|---|---|
| Profilo, esperienze, formazione | Etichette di sezione ("Formazione", "Progetti") |
| Responsabilità, soft skill | Testo di pulsanti ("Scarica PDF") |
| Competenze tecniche, progetti | Testo di sistema ("Minimizza", "Chiudi") |
| Developer notes | Introduzione descrittiva di una finestra |

Il test pratico: se un domani un assistente AI dovesse rispondere "quali
responsabilità ha Francesco in Xtel?", la risposta deve venire dalla
Knowledge Base. Se dovesse rispondere "come si chiama il pulsante per
scaricare il CV?", quella non è conoscenza su Francesco — è UI, e resta
dov'era.

### Perché Markdown + frontmatter e non solo JSON più ricco

Si sarebbe potuto arricchire semplicemente `projects.json` invece di
introdurre Markdown. Scartato perché:

- Il body Markdown è pensato per crescere (Fase 9, Knowledge Document
  Viewer): un progetto oggi ha una riga di descrizione, domani potrà avere
  sezioni Overview/Problem/Solution/Challenges — naturale in Markdown,
  scomodo in una stringa JSON.
- Un futuro assistente AI grounded (Fase 10) retrieva meglio testo
  Markdown strutturato con heading che un blob JSON.
- Resta comunque leggibile/editabile a mano senza toccare codice — motivo
  originale per cui il documento di visione lo proponeva.

### Perché un file per lingua invece di un file bilingue `{it, en}`

Deciso in Fase 8, non specificato nel documento di visione originale
(che aveva contenuti di esempio senza multi-voce/multi-lingua reale).
Un frontmatter con oggetti `{it, en}` annidati ovunque (come nei vecchi
JSON) diventa illeggibile appena i campi crescono. File separati
(`xtel.it.md` / `xtel.en.md`) sono editabili uno alla volta e permettono
in futuro contenuti che divergono in lunghezza tra le due lingue.

### Perché dati ripetibili in frontmatter e non in liste dentro il body

Campi come `responsibilities` o `softSkills` sono array di stringhe nel
frontmatter (con markdown inline tipo `**grassetto**`), non liste `- ...`
nel body. Estrarre un array da un body Markdown già renderizzato
richiederebbe fare parsing della lista a ritroso in React — più fragile
che leggere un array YAML già pronto.

## Alternative scartate

- **Restare sui tre `.json`**: scartata, non risolve la duplicazione tra
  `ResumeWindow`/`ExperienceWindow`/`PrintableResume`, e non regge bene
  contenuto narrativo esteso (Fase 9).
- **CMS headless esterno** (Contentful, Sanity, ecc.): scartata per un
  portfolio personale — complessità/costo non giustificati, e va contro
  il principio "editabile a mano, nessuna dipendenza esterna" del progetto.
- **Un unico file Markdown per tutta la Knowledge Base**: scartata, rompe
  l'Explainability (Fase 12) che deve poter citare *un* documento specifico
  come fonte.

## Conseguenze

- Nuova dipendenza: `gray-matter` (parsing frontmatter) e `marked`
  (rendering Markdown → HTML per i campi con `**grassetto**`/liste).
  Compatibili browser via Vite, ma non "gratis": `gray-matter` usa
  `Buffer` internamente, non fornito dal browser — richiede il polyfill
  `buffer` + `src/polyfills.ts` (vedi `docs/FASE8_LOG.md`, Step 6, e il
  warning `eval` non bloccante allo Step 3).
- `src/data/*.json` rimossi (sostituiti).
- Aggiungere un nuovo fatto (nuova esperienza, nuovo progetto) oggi
  significa: creare due file `.md` (it/en) nella cartella giusta — nessuna
  modifica al codice dei componenti.
