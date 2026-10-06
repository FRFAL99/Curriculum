# Devlog

Diario cronologico del progetto, **voce più recente in testa**. Dove siamo oggi sta in
[STATO.md](STATO.md); che numero ha una Fase e se è chiusa sta in [registro.md](registro.md).

Ogni voce si intitola `## AAAA-MM-GG — Fase N: <titolo>` e si chiude con `### Verifica`. Il
lavoro fuori piano non prende un numero: è una voce con la sola data, `## AAAA-MM-GG — Fuori
piano: <titolo>`.

Non serve leggerlo per intero: `grep -n '^## ' docs/devlog.md` ne dà l'indice.

> **Da dove viene questo file.** Fino al 6 ottobre 2026 ogni Fase aveva il suo
> `docs/FASEnn_LOG.md` e le Fasi 1, 6 e 7 vivevano solo nel README. Sono stati fusi qui senza
> riscriverli: le voci di quelle Fasi conservano struttura e parole originali, con i titoli
> abbassati di un livello. Le date delle Fasi 1–16 sono quelle dei commit (tutte dell'11 luglio,
> giorno del primo push). Le voci «fuori piano» sono ricostruite dai messaggi di commit e lo
> dicono. Il vecchio sito «desktop» descritto dalle Fasi 1–17 non esiste più dalla Fase 18.

---

## 2026-10-06 — Fase 23: il sito si legge anche senza JavaScript, e il piano v1 è chiuso

Fino a oggi chi apriva il sito senza eseguire JavaScript (molti crawler, i lettori che lo
disattivano) trovava un `<div id="root"></div>` vuoto. Ora `vite/kb-head.ts` sostituisce il
segnaposto `<!-- kb-static -->` con un profilo statico in inglese (nome, ruolo, luogo, il
riassunto di `about.en.md`, email, LinkedIn, GitHub) e aggiunge al `<head>` uno JSON-LD
`Person` con gli stessi dati. Con questa Fase il piano v1 è chiuso.

**Il flash che non c'è.** Il piano contava sul fatto che React sostituisce il contenuto di `#root`
al montaggio, ma fra il parse dell'HTML e il montaggio il profilo si sarebbe visto per un istante.
Uno script inline in testa al documento aggiunge la classe `js` a `<html>`, e `.js .kb-static`
non si mostra: chi ha JavaScript non lo vede mai.

**Scostamenti dal piano.** La prima versione usava i colori del tema chiaro, ma il CSS del bundle
si carica anche senza JavaScript e, senza `data-theme`, mette il fondo scuro: testo scuro su fondo
scuro. Il profilo ora usa le variabili di `tokens.css`, quindi segue il tema di default, lo scuro.
Il telefono è rimasto fuori dallo JSON-LD di proposito: il sito lo mostra, ma non serve darlo in
forma strutturata a chi raccoglie dati.

### Verifica

- `npm run lint` e `npm run build` passano.
- `vite preview` con Playwright, JavaScript disattivato: profilo leggibile a 390 px e a 1280 px,
  con sistema in tema chiaro e scuro, senza scroll orizzontale.
- JavaScript attivo a 390 px: `.kb-static` non c'è più nel DOM e la Home è quella di sempre.
- `dist/index.html` con `URL` di produzione: JSON-LD con `url`, `email`, `homeLocation`, `sameAs`.

---

## 2026-10-06 — Fase 22: il link condiviso ha una faccia

`public/og.png` è l'immagine che LinkedIn, WhatsApp e X mostrano accanto al link: 1200×630, fondo
carta calda del tema chiaro, nome in JetBrains Mono, ruolo in terracotta, luogo, e la curva con il
razzo della Home ridotta a una traiettoria verticale sul bordo destro. La genera `npm run og`
(`scripts/og-image.mjs`) da `about.en.md` con `playwright-core`; il plugin `kb-head` aggiunge
`og:image` (con dimensioni e alt) e porta la Twitter card a `summary_large_image`.

**Scostamenti dal piano.** Due aggiunte. La prima: nelle anteprime di deploy Netlify `og:image`
punta all'anteprima stessa (`DEPLOY_PRIME_URL`) e non alla produzione, dove `og.png` non c'è finché
la PR non è mergiata; `og:url` e `canonical` restano sulla produzione. La seconda: la build si
ferma se `public/og.png` manca, invece di pubblicare un'anteprima con un'immagine rotta. La
prima versione dell'immagine aveva la curva che tagliava il nome: spostata a destra.

### Verifica

- `npm run og` con il Chromium di Playwright: PNG 1200×630, 200 KB, controllato a vista.
- `npm run lint` e `npm run build` passano.
- Build con `CONTEXT=deploy-preview` e con `CONTEXT=production`: `og:image` punta rispettivamente
  all'anteprima e a `URL`, `og:url` sempre a `URL`; `dist/og.png` presente.
- Nessuna modifica alla UI: la Home a 390 px è quella della Fase 21.

---

## 2026-10-06 — Fase 21: il titolo della pagina smette di dire «Desktop»

Il piano v1 comincia dall'`<head>`. Il plugin `vite/kb-head.ts` sostituisce il segnaposto
`<!-- kb-head -->` di `index.html` con titolo, description, Open Graph e Twitter card letti da
`about.en.md`: il titolo è ora «Francesco Fallavena — Software Engineer» invece di «Francesco
Fallavena — Desktop», e cambiando `role` nella KB cambia anche l'anteprima.

**Scostamenti dal piano.** La description prende le prime frasi del corpo di `about` senza superare
160 caratteri: con il testo attuale entra solo la prima («Software engineer with a background in
Mathematics and a strong analytical mindset.»), perché con la seconda si arriverebbe a 250.
`twitter:card` è `summary` finché non c'è l'immagine della Fase 22, che la porterà a
`summary_large_image`. `lang="en"` in `index.html` era già coerente con la scelta dell'inglese e
resta; `LanguageContext` lo cambia al montaggio come prima.

### Verifica

- `npm run lint` e `npm run build` passano; `tsconfig.node.json` ora include `vite/**/*.ts`, quindi
  `tsc -b` controlla anche il plugin.
- `URL=https://curriculumfrfal.netlify.app npx vite build`: `dist/index.html` contiene title,
  description, `og:*`, `twitter:*`, `og:url` e `canonical`; senza `URL` gli ultimi due mancano.
- `vite preview` con Playwright a 390 px: il titolo della scheda è quello nuovo e la Home è
  identica a prima.

---

## 2026-10-06 — Fuori piano: la documentazione si riorganizza come JuTrack

I 17 `docs/FASEnn_LOG.md` e le sezioni «Stato — Fase N» del README diventano un unico
`docs/devlog.md`, questo file. Accanto nascono `STATO.md` (dove siamo e cosa manca),
`registro.md` (le Fasi 1–20 e il prossimo numero libero, 21), `piano-TEMPLATE.md`,
`conoscenza/architettura.md` e `conoscenza/trappole.md`. L'ADR-001 passa in `adr/`, la visione e il
sito v1 in `archivio/`. `CLAUDE.md` ora contiene la numerazione, il rituale di fine Fase e la
tabella «dove si scrive cosa»; i comandi `/nuovo-piano` e `/fine-fase` stanno in `.claude/commands/`.
Il README si riduce ad avvio, build e deploy.

La struttura viene dal repo JuTrack, di cui si è ripresa solo la forma. Si è tenuta la parola
«Fase» perché tutta la storia la usa già.

Le Fasi 1, 6 e 7 non avevano un log: le loro voci sono la vecchia sezione del README. Le Fasi 19 e
20 avevano preso un numero pur essendo lavoro fuori piano; lo tengono.

Il primo «cosa manca» di `STATO.md` viene dall'analisi del sito fatta lo stesso giorno.

### Verifica

- `npm run lint` e `npm run build` passano.
- Nessun riferimento rimasto ai vecchi `FASEnn_LOG.md`, a `docs/VISION.md` o a
  `docs/ADR-001-knowledge-base.md` fuori da `docs/devlog.md` e `docs/archivio/`.
- Link relativi dei nuovi documenti controllati con uno script.

---

## 2026-10-06 — Fuori piano: le competenze si vedono nel visualizzatore documenti (PR #6)

_Voce ricostruita dal messaggio di commit `0cd7206`: il lavoro non aveva un log._

Aprendo `skills.md` dal Knowledge Explorer il visualizzatore mostrava una pagina vuota: il file
è lang-neutral e tiene le competenze nel frontmatter, non nel corpo. Ora il visualizzatore le
mostra per categoria.

---

## 2026-10-06 — Fase 20: Miglioramenti dell'AI Assistant

Nasce da un'analisi dell'assistente in produzione (13 domande reali, tutti i
suggerimenti in it/en) dopo il fix della Fase 19. Punti scelti dall'utente:
tutti e sei.

### 1. Risposte troncate

I modelli :free di ripiego "ragionano" e il ragionamento conta nei token di
output: con `max_tokens: 1000` "Spiegami il progetto Antichità Fallavena"
si fermava a metà, senza blocco fonti. Ora `max_tokens: 2500` e
`reasoning: { effort: "low", exclude: true }` (ignorato dai modelli che non
ragionano); se `finish_reason` è `length` la function lo scrive nei log.
Effetto collaterale: risposte in ~3 s invece di 6-9 s.

### 2. Protezione della quota gratuita

La chiave è sul piano gratuito di OpenRouter (50 richieste/giorno sui :free)
e chiunque poteva esaurirla, anche gonfiando la cronologia inviata dal browser.

- Rate limit Netlify per visitatore (10 richieste/60 s per IP) nel `config`
  esportato da `assistant.ts`. I limiti per le function non si possono
  dichiarare in `netlify.toml`, quindi il percorso `/api/assistant` passa
  dal `[[redirects]]` al `config.path` della function.
- Cronologia: ogni messaggio ≤ 4000 caratteri, totale ≤ 12000, altrimenti 400.

Per salire a 1000 richieste/giorno resta l'opzione già documentata in
`.env.example` (credito una tantum su OpenRouter).

### 3. Errori per i visitatori

La function non espone più dettagli di OpenRouter (`upstream_error`,
`upstream_unreachable`; il dettaglio resta nei log). La UI mostra
`assistantRateLimited` per ogni 429 (anche quello di Netlify, che non ha
corpo JSON) e `assistantUnavailable` per tutto il resto, tradotti. In
sviluppo (`import.meta.env.DEV`) il messaggio aggiunge stato HTTP e il
promemoria `npm run dev:full`.

### 4-5. Voce e suggerimenti

Il prompt chiedeva di parlare "per conto di Francesco" ma i suggerimenti gli
davano del tu, quindi le risposte alternavano "Io ho…" e "Francesco ha…".
Ora l'assistente parla sempre di Francesco in terza persona, e i
suggerimenti sono riscritti di conseguenza. Il prompt vieta di aggiungere
fatti o preferenze non presenti nella KB: "Di quale progetto sei più
orgoglioso?" (in inglese rifiutava, in italiano inventava) è diventato
"Quali progetti ha realizzato Francesco?".

### 6. Fonti, intestazione, HTML

- Le fonti mostrano il titolo del documento (`getDocTitle`, spostato da
  `DocumentDetail.tsx` a `src/lib/knowledgeBase.ts`), il percorso resta nel
  tooltip.
- "Ask about Francesco" è ora l'etichetta `assistantTitle` (it: "Chiedi di
  Francesco").
- Il Markdown dell'AI passa da DOMPurify prima di `dangerouslySetInnerHTML`.

### Verifica

- Function in locale con chiave reale: cronologia gonfiata → 400; risposte
  complete con fonti per Antichità Fallavena, progetti (it/en), esperienza
  (en); "progetto preferito" → dice che la KB non lo specifica.
- UI con Playwright a 390 px (risposta mockata): titoli delle fonti, errore
  tradotto, `<img onerror>` neutralizzato.
- `npm run lint` e `npm run build` passano.

---

## 2026-10-06 — Fase 19: Fix "OpenRouter error: 404" dell'AI Assistant

### Problema

Dal 2026-10 l'assistente "Ask about Francesco" rispondeva sempre
`OpenRouter error: 404`. Riprodotto con una chiamata diretta:

```
{"error":{"message":"This model is unavailable for free. The paid version is
available now - use this slug instead: openai/gpt-oss-20b","code":404}}
```

`openai/gpt-oss-20b:free` (default di `assistant.ts` e di `.env.example`,
scelto in Fase 10) è stato tolto dal free tier di OpenRouter. Endpoint e
chiave erano corretti.

### Modifica

- `netlify/functions/assistant.ts`: invece di un solo `model`, la richiesta
  passa `models` (fallback nativo di OpenRouter, max 3 id). Ordine:
  `OPENROUTER_MODEL` se impostato, poi `nvidia/nemotron-3-super-120b-a12b:free`,
  `google/gemma-4-31b-it:free`, `google/gemma-4-26b-a4b-it:free`. Se un id
  sparisce (404) o è saturo upstream (429), OpenRouter passa al successivo.
- `stats.model` ora riporta il modello che ha davvero risposto
  (`data.model`), non quello richiesto.
- `.env.example`: `OPENROUTER_MODEL` diventa opzionale e commentato.

### Verifica

- Chiamata diretta con `models: [gpt-oss-20b:free, nemotron…, gemma…]`:
  200, risponde `nvidia/nemotron-3-super-120b-a12b:free`.
- Handler eseguito in locale con `tsx` e chiave reale, sia senza
  `OPENROUTER_MODEL` sia con `OPENROUTER_MODEL=openai/gpt-oss-20b:free`
  (caso in cui la env var su Netlify punti ancora al modello rimosso): 200
  in entrambi i casi.
- `openrouter/free` scartato: instradava su un modello di content safety.
- `npm run lint` e `npm run build` passano. Nessuna modifica UI.

---

## 2026-10-06 — Fuori piano: CLAUDE.md, hook di avvio e CI (PR #2, #3)

_Voce ricostruita dai messaggi di commit `c616d18` e `1ba6da4`._

- `CLAUDE.md` con le convenzioni del progetto e `.claude/hooks/session-start.sh`, che esegue
  `npm ci` all'avvio delle sessioni Claude Code sul web.
- `.github/workflows/ci.yml`: `npm run lint` e `npm run build` su ogni PR e su ogni push su `main`.

---

## 2026-07-19 — Fuori piano: Home minimale e rifiniture mobile

_Voce ricostruita dai messaggi di commit, dopo la Fase 18._

- `e89f2b5` Home minimale: solo AI Assistant + footer contatti inline.
- `c031619` Sfondo «interpolazione con razzo», tolti i puntini del tema, hardening dell'AI.
- `e5119dd` Contatti del CV su una riga; Knowledge Explorer nell'hamburger con chiusura al click fuori.
- `fd2ac97` Sfondo mobile con traiettoria verticale; chip dei suggerimenti su una riga.
- `b4620a5` Chip suggerito «Contatti» tra le domande rapide.

---

## 2026-07-19 — Fase 18: Restyle da "desktop OS" a landing page a tab

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

### Decisioni (confermate con l'utente in plan mode)

1. **4 tab**: `Home · Curriculum · Progetti · Developer Notes`. Experience e
   Skills dentro il Resume; Contact come sezione della Home (niente tab
   dedicato).
2. **Home**: hero (nome/ruolo/disponibilità da `about.md`) + AI Assistant +
   sezione Contatti in fondo, con la Knowledge Base come doc laterale.
3. **AI Assistant** solo nella Home.
4. **Case study / doc**: vista **master/detail inline** con "Torna indietro"
   (come i Developer Notes), niente più finestre.
5. **Mobile**: i tab collassano in un **hamburger menu** a tendina.

### Modifica

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

### Rimozioni (ritiro della machinery desktop)

Eliminati perché non più agganciati all'albero vivo:

- `src/desktop/`: `WindowManager.tsx`, `Window.tsx`/`.css`,
  `WindowManagerContext.tsx`, `useWindowManager.ts`, `Dock.tsx`/`.css`,
  `DesktopIcon.tsx`/`.css`.
- `src/config/windows.ts` (registro finestre).
- `src/windows/`: `Experience/` (ora inline nel Resume), `Contact/`
  (sostituito da `HomeContact`), `KnowledgeDocument/` (sostituito da
  `DocumentDetail`).

`Wallpaper` è **mantenuto** come sfondo decorativo.

### Verifica

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

### Note / possibili sviluppi

- **Contenuto da aggiornare**: il progetto `projects/portfolio-v2.*.md` e il
  README si descrivono ancora come "desktop / draggable windows"; testo ormai
  obsoleto dopo il restyle (contenuto KB, fuori dallo scope di questa fase).
- Deep-link al singolo case study/doc (`#projects/<slug>`) non implementato.

---

## 2026-07-15 — Fuori piano: da Gemini di nuovo a OpenRouter, sito che riparte pulito

_Voce ricostruita dai messaggi di commit, intorno alla Fase 17._

- `47255aa` Retry e fallback quando Gemini risponde 503 (overloaded).
- `e205b0e` Tolta l'etichetta di scope dalla risposta, icone nella barra statistiche.
- `4bacbdd` **Ritorno da Gemini a OpenRouter** per il backend dell'AI Assistant.
- `3199e04` Il sito riparte pulito a ogni apertura: nessuna finestra ripristinata, chat vuota.
- `2cab52d` Topbar mobile affollata: il toggle KB si sovrapponeva ai tab.

---

## 2026-07-15 — Fase 17: Sezione Developer Notes a tab con articoli long-form

Riferimento: documento di visione "Portfolio Architecture — Knowledge Base +
AI Assistant" (vedi `docs/archivio/VISION.md`). Nasce da feedback diretto dell'utente:
i Developer Notes erano quasi vuoti e la finestrella su desktop (Fase 4/9)
era troppo stretta per articoli lunghi. Obiettivo: spostarli in una sezione
editoriale a tutta pagina, raggiungibile da un tab in topbar, comoda da
leggere e facile da alimentare con nuovi articoli.

### Decisioni (confermate con l'utente in plan mode)

1. Stile **blog/editoriale** (titolo grande, sommario, tempo di lettura, tag),
   al posto dell'estetica LOG/terminal (logId, badge status).
2. Due tab accanto al nome: **Home** (scrivania attuale) + **Developer Notes**.
3. **Rimozione** dell'icona desktop e della voce nella sidebar Knowledge Base:
   gli articoli si raggiungono solo dal tab.

### Modifica

- **Tab in topbar** (`src/desktop/Desktop.tsx` + `Desktop.css`): nuovo stato
  `activeTab: "home" | "notes"` locale al `Desktop`. La topbar ospita ora un
  wrapper `.desktop__topbar-left` (brand + nav `.desktop__tabs`) a sinistra;
  rendering condizionale del centro pagina (cluster desktop vs sezione notes).
  Tab iniziale letto da `#notes` (`getInitialTab`) e sincronizzato all'hash su
  click (`selectTab`): la sezione è così **deep-linkable/condivisibile**.
  `Wallpaper`, `WindowManager` e `Dock` restano montati in entrambi i tab.
- **Nuova sezione** (`src/desktop/DeveloperNotesSection.tsx` + `.css`):
  componente a tutta pagina con stato interno `selectedSlug`.
  - Indice (`selectedSlug === null`): titolo + intro (`devNotesIntro`) e lista
    di card `.dev-card` con data, tempo di lettura, sommario e tag. Sommario da
    frontmatter `summary` con fallback a `getOverviewExcerpt(body)`.
  - Lettore (`selectedSlug` valorizzato): colonna di lettura ~720px, pulsante
    "← Torna agli articoli" (`devNotesBackToList`), titolo, meta (data · tempo
    di lettura), tag e corpo markdown via `renderBlock` (`dangerouslySetInnerHTML`),
    con stili tipografici editoriali (h2/h3, liste, code, pre, blockquote, link).
- **Modello contenuti** (`src/lib/knowledgeBase.ts`): `DeveloperNoteFrontmatter`
  esteso con `summary?` e `tags?`; `logId?`/`status?` resi opzionali
  (retro-compatibile). Nessuna modifica ai loader: ogni nuovo `.md` sotto
  `knowledge-base/developer-notes/` compare in automatico ed è ingerito dall'AI.
- **Riuso/DRY** (`src/lib/markdown.ts`): `getReadingTime(body)` estratto qui
  (prima locale in `KnowledgeDocument/index.tsx`) e importato da entrambi.
- **Rimozioni**:
  - `src/config/windows.ts`: eliminata la voce/registrazione `developer-notes`
    (e l'import `DeveloperNotesWindow`), quindi sparisce l'icona desktop.
  - `src/desktop/KnowledgeExplorer.tsx`: rimosso il branch "Developer Notes"
    dalla sidebar (e import `getDeveloperNotes`/`Terminal` non più usati).
  - Cancellata la cartella `src/windows/DeveloperNotes/` (finestra superata).
- **i18n** (`src/context/translations.ts`): nuove chiavi IT+EN `tabHome`,
  `tabDeveloperNotes`, `devNotesBackToList`. Riuso di `developerNotesTitle`,
  `devNotesIntro`, `readingTimeSuffix`.
- **Contenuti**: le 2 note esistenti (`query-optimization`,
  `data-integration-logic-apps`, IT+EN) riscritte come articoli long-form con
  sezioni `##` (Contesto/Diagnosi/Soluzione/Risultato) + `summary`/`tags`.

### Come aggiungere un articolo

Creare `knowledge-base/developer-notes/<slug>.it.md` + `.en.md` con frontmatter:

```yaml
type: developer-note
lang: it            # + gemello .en.md
slug: mio-articolo
title: Titolo
date: "Lug 2026"
order: 1
summary: Una o due frasi per la card indice.
tags: [SQL, Performance]
```

Corpo in markdown con sezioni `##`. Compare in automatico nell'indice, nel
lettore e nel prompt dell'AI Assistant (nessuna modifica al codice).

### Verifica

- `tsc -b` + `vite build` e `oxlint` — puliti (0 warning).
- Chromium headless (one-shot screenshot, il debug port CDP è bloccato
  nell'ambiente) a 1440px:
  - Home: topbar con tab Home (attivo) / Developer Notes, colonne desktop
    invariate, sidebar KB **senza** più il branch Developer Notes.
  - `/#notes`: indice con titolo, intro e 2 card (data, tempo di lettura,
    sommario, tag); tab Developer Notes attivo, colonne desktop nascoste.
  - Lettore articolo: back button, titolo, meta, tag e markdown renderizzato
    (h2, paragrafi, grassetto, liste) nella colonna larga centrata.

### Stato della roadmap

Il piano principale di `docs/archivio/VISION.md` resta completato nelle Fasi 13-14; le
Fasi 15-17 sono iterazioni di rifinitura su feedback diretto. Restano aperte,
non decise: cross-reference tra documenti e "Open in AI". Possibile evoluzione
futura di questa fase: deep-link al singolo articolo (`#notes/<slug>`) e
categorizzazione/ricerca degli articoli.

---

## 2026-07-12 — Fuori piano: passaggio a Gemini e tema Warm Minimal

_Voce ricostruita dai messaggi di commit, dopo la Fase 16._

- `e5f2134` AI Assistant migrato da OpenRouter a Google Gemini flash (tornato su OpenRouter il 15 luglio).
- `b3f548f`, `8b36743` `gemini-flash-latest` al posto di `gemini-2.5-flash`; thinking budget disattivato perché tagliava le risposte.
- `aa35c7f`, `fddbac8` Migliorie UX e affidabilità dell'Assistant, barra statistiche di generazione.
- `e4521e9`, `c640a1a` Nuovo tema Warm Minimal/Editorial con transizioni, intestazione dell'Assistant più grande.

---

## 2026-07-11 — Fase 16: Restyle pannello Assistant + colonna icone

Riferimento: documento di visione "Portfolio Architecture — Knowledge Base +
AI Assistant" (vedi `docs/archivio/VISION.md`). Non introduce nuove decisioni di
visione: è un restyle su feedback visivo diretto dell'utente sul layout a
tre colonne della Fase 14, confrontato con uno screenshot di riferimento
(chat AI con composer centrato e stile arrotondato).

### Modifica

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

### Verifica

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

### Stato della roadmap

Il piano principale di `docs/archivio/VISION.md` resta quello completato nelle
Fasi 13-14; le Fasi 15-16 sono iterazioni di rifinitura (contenuti/UX e
stile) su idee non ancora decise o su feedback diretto. Restano aperte,
non decise: cross-reference tra documenti e "Open in AI".

---

## 2026-07-11 — Fase 15: Ricerca globale + header metadata

Riferimento: documento di visione "Portfolio Architecture — Knowledge Base +
AI Assistant" (vedi `docs/archivio/VISION.md`). Il piano principale (le 4 decisioni
di visione + layout a tre colonne, Fasi 13-14) è completo. Questa fase
riprende due idee elencate come "non ancora decise" in `docs/archivio/VISION.md`:
ricerca globale sulla Knowledge Base e header con metadata sul Knowledge
Document.

Vincolo verificato prima di implementare: i campi disponibili nel
frontmatter variano per tipo di documento (`knowledge-base/**/*.md`) —
`project` ha `stack` ma nessuna data, `experience`/`education` hanno
`dateStart`/`dateEnd` ma solo `experience` ha tag (`skills`),
`developer-note` ha `date` ma nessun tag, `about`/`skills` non hanno né
data né tag. Non esiste un campo "Updated" universale. Decisione: header
**adattivo per tipo**, mostra solo i campi realmente presenti — nessun
placeholder finto.

---

### Step 1 — Ricerca globale nel Knowledge Explorer

**Stato: ✅ completato**

`src/desktop/KnowledgeExplorer.tsx`:
- Ogni voce (leaf o figlio di un ramo) ora porta anche un `searchText`
  precomputato: label + `body` del documento + tag rilevanti quando
  presenti (`stack` per i progetti, `skills` per le esperienze), tutto in
  minuscolo. Prima la Fase 13 portava solo `path`/`label`.
- Nuovo campo di ricerca (`kb-explorer__search`, icona `Search` da
  lucide-react) sotto l'intestazione "Knowledge Base".
- Query vuota → albero per categoria invariato (comportamento Fase 13).
- Query non vuota → lista piatta dei risultati che matchano
  `searchText.includes(query)`, con l'icona della categoria di
  appartenenza; nessun match → messaggio "Nessun risultato" (nuova chiave
  `knowledgeExplorerNoResults`). Click su un risultato apre il documento
  con lo stesso `openWindow("knowledge-document", { path })` di sempre.
- Cercare per contenuto funziona anche quando il termine non è nel titolo:
  es. cercare "Firebase" trova "Antichità Fallavena" perché il termine è
  nello `stack`/nel body, non nel titolo del progetto.

Nuove chiavi in `translations.ts` (IT/EN): `knowledgeExplorerSearchPlaceholder`,
`knowledgeExplorerNoResults`.

### Step 2 — Header metadata sul Knowledge Document

**Stato: ✅ completato**

`src/windows/KnowledgeDocument/index.tsx`:
- **Titolo corretto per tipo**: prima usava solo `frontmatter.title`,
  assente per experience/education/about — il titolo cadeva sullo slug
  (bug osservato in Fase 13: aprire un'esperienza mostrava "xtel" invece
  di "Software Engineer"). Ora mappa il campo giusto per tipo (`role` per
  experience, `degree` per education, `name` per about, `title` per il
  resto).
- **Badge tipo**: riusa le chiavi di traduzione già esistenti per
  categoria (`profileTitle`, `experienceTitle`, `projectsTitle`,
  `skillsTitle`, `educationTitle`, `developerNotesTitle` — Fase 13),
  nessuna nuova chiave.
- **Periodo/data**: solo quando presente nel frontmatter — `date` per
  developer-notes, `dateStart`–`dateEnd` (o "Present"/"Presente", chiave
  `present` già esistente) per experience/education. Assente per
  project/about/skills.
- **Tempo di lettura**: sempre presente, calcolato da
  `doc.body.split(/\s+/).length / 200` minuti (arrotondato, minimo 1).
  Nuova chiave `readingTimeSuffix`.
- **Tag**: da `frontmatter.stack` (project) o `frontmatter.skills`
  (experience), assenti per gli altri tipi.

`KnowledgeDocument.css`: nuovi blocchi `.kb-doc-window__meta` (badge +
periodo + tempo di lettura, riga monospace) e `.kb-doc-window__tags`
(chip con bordo), stile coerente coi token esistenti.

### Step 3 — Verifica

**Stato: ✅ completato**

- `npx tsc -b` e `npx oxlint` — puliti.
- Dev server + Chromium headless: digitato "Firebase" nella ricerca →
  trovato "Antichità Fallavena" (match nel body/stack, non nel titolo);
  query cancellata → torna l'albero per categoria; aperto il progetto
  "Antichità Fallavena" → header con badge "Projects", tempo di lettura,
  tag (Next.js, React, Firebase, Netlify); aperta l'esperienza "Software
  Engineer" (Xtel) → titolo corretto (non più "xtel"), badge
  "Professional Experience", periodo "June 2022 – Present", tag delle
  skill; aperto "About" → solo badge + tempo di lettura, nessun campo
  vuoto o finto. Nessun errore in console.

---

### Cosa resta (non in scope qui)

- Cross-reference tra documenti ("Related Documents").
- "Open in AI" — aprire l'Assistant pre-contestualizzato su un documento.
- Campo "Updated" universale — richiederebbe scrivere contenuto reale in
  ogni documento della KB, non solo lavoro di UI.

---

## 2026-07-11 — Fase 14: Layout a tre colonne

Riferimento: documento di visione "Portfolio Architecture — Knowledge Base +
AI Assistant" (vedi `docs/archivio/VISION.md`). Prosegue dalla Fase 13 (Knowledge
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

### Step 1 — Rimozione dell'Assistant da `windowsConfig`

**Stato: ✅ completato**

`src/config/windows.ts`: rimossa del tutto la entry `"assistant"`. Non è
più una `Window` — nessun payload, posizione, zIndex o stato minimizzato
da tracciare. Verificato via grep che l'id `"assistant"` non è referenziato
altrove nel codebase. `Dock` e la griglia icone (entrambi filtrano
`windowsConfig`) escludono automaticamente l'Assistant di conseguenza,
senza bisogno di modifiche a `Dock.tsx`.

### Step 2 — `AssistantWindow` come pannello fisso

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

### Step 3 — Layout a tre colonne in `Desktop.tsx`/`Desktop.css`

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

#### Fix stacking (z-index)

Le finestre libere (`Window.tsx`/`WindowManagerContext.tsx`) partono da
`zIndex: BASE_Z = 10`. Il Knowledge Explorer (Fase 13) usava `z-index:
15` — con Assistant e icone diventate colonne fisse a piena altezza,
una finestra libera appena aperta (10) sarebbe finita **dietro** queste
colonne (15), invisibile. Fix: `z-index` delle tre colonne fisse
(icone, Assistant, Explorer) abbassato a `5`, sotto `BASE_Z`. Verificato
in Chromium: aprendo Resume dalla colonna icone, la finestra appare
correttamente sopra le tre colonne, trascinabile e chiudibile.

### Step 4 — Mobile

**Stato: ✅ completato**

Sotto `@media (max-width: 640px)`: `.desktop__icons-col` nascosta
(`display: none`), `.desktop__assistant-col` diventa a piena larghezza
(`left: 0; right: 0`) — l'Assistant è la vista di apertura. Il toggle e il
comportamento overlay del Knowledge Explorer restano quelli della Fase 13,
invariati. Il Dock resta raggiungibile (era già visibile su mobile prima
di questa fase).

### Step 5 — Verifica

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

### Cosa resta (Fasi successive, non in scope qui)

- Ricerca globale sulla Knowledge Base.
- Cross-reference tra documenti (Related Documents).
- Header "Knowledge Document" con metadata (progetto/data/reading
  time/topics).
- "Open in AI" — aprire l'Assistant pre-contestualizzato su un documento.

---

## 2026-07-11 — Fase 13: Knowledge Explorer

Riferimento: documento di visione "Portfolio Architecture — Knowledge Base +
AI Assistant" (vedi `docs/archivio/VISION.md`). Prima fase implementativa dopo le
decisioni di visione: costruisce il pezzo più fondamentale mancante — la
sidebar che rende esplorabile la Knowledge Base per categorie, senza
passare né dal Dock né dall'AI Assistant.

Obiettivo della fase: introdurre `KnowledgeExplorer`, una sidebar
persistente sulla sinistra del desktop (non una `Window`, sullo stesso
modello del `Dock`) che elenca i documenti della Knowledge Base raggruppati
per categoria e li apre nel `KnowledgeDocumentWindow` già esistente dalla
Fase 9.

Decisioni prese con l'utente prima di implementare:
- **Categorie mostrate**: solo quelle con contenuto reale in KB — About,
  Experience, Projects, Skills, Education, Developer Notes. Contact/Social
  esclusi (hanno già una finestra dedicata, non sono "documenti" da
  leggere). Niente categorie inventate (es. "Certifications",
  "Architecture") solo perché comparse nei mockup di brainstorming.
- **Layout a tre colonne e AI Assistant centrale**: esplicitamente fuori
  scope in questa fase, restano step successivi.
- **Nessun riposizionamento delle finestre**: `CENTER_ON_OPEN` in
  `WindowManagerContext.tsx` resta invariato; la sidebar è un overlay
  fisso in stile Dock, non ridefinisce il layout delle finestre.

---

### Step 1 — Componente `KnowledgeExplorer`

**Stato: ✅ completato**

Nuovo `src/desktop/KnowledgeExplorer.tsx` + `KnowledgeExplorer.css`,
renderizzato in `Desktop.tsx` come sibling di `<Dock />`/`<WindowManager />`
— fuori da `windowsConfig`, non è una `Window`.

- Dati letti dai getter già esistenti in `src/lib/knowledgeBase.ts`
  (`getAbout`, `getExperience`, `getProjects`, `getSkills`,
  `getEducation`, `getDeveloperNotes`), già filtrati per lingua e
  ordinati per `frontmatter.order` — nessuna modifica al loader.
- Due tipi di riga: **leaf** (About, Skills — un solo documento, click
  diretto) e **ramo espandibile** (Experience, Projects, Education,
  Developer Notes — chevron per aprire/chiudere, un figlio per documento).
  Etichetta figlio dal campo frontmatter più naturale per tipo
  (`role` per Experience, `title` per Projects/Developer Notes, `degree`
  per Education).
- Click su una voce chiama `openWindow("knowledge-document", { path })` —
  stesso meccanismo già usato da `ProjectsWindow` dalla Fase 9, nessuna
  nuova API sul window manager.
- Stato espanso/collassato per categoria persistito in localStorage
  (`readJSON`/`writeJSON`, chiave `"knowledgeExplorerState"`), stesso
  pattern di `theme` e `windowManagerState`.
- Voce attiva evidenziata leggendo `windows["knowledge-document"]` da
  `useWindowManager()`: se la finestra è aperta e non minimizzata, il
  `path` nel suo `payload` viene confrontato con quello di ogni voce.
- Mobile (`useIsMobile()`, breakpoint 640px già esistente): sidebar
  nascosta dietro un pulsante toggle fisso, apribile come overlay a
  schermo intero con backdrop; nessun nuovo breakpoint introdotto.

Due nuove chiavi in `src/context/translations.ts` (IT/EN):
`knowledgeExplorerTitle` (intestazione sidebar) e
`knowledgeExplorerToggle` (aria-label del toggle mobile). Le intestazioni
di categoria riusano chiavi già esistenti (`profileTitle`,
`experienceTitle`, `projectsTitle`, `skillsTitle`, `educationTitle`,
`developerNotesTitle`) — nessuna duplicazione.

### Step 2 — Spazio riservato nel Desktop

**Stato: ✅ completato**

`Desktop.css`: `padding-left` su `.desktop__topbar` e `.desktop__icons`
pari alla larghezza della sidebar (264px + margine), così icone e brand
non finiscono sotto la sidebar fissa. Annullato dentro il blocco
`@media (max-width: 640px)` già esistente, dove la sidebar diventa un
overlay e non deve riservare spazio.

### Step 3 — Verifica

**Stato: ✅ completato**

- `npx tsc -b` — nessun errore di tipo (corretto un mismatch iniziale tra
  i tipi di frontmatter specifici, es. `ExperienceFrontmatter`, e la firma
  generica dell'helper di etichetta).
- `npx oxlint` sui file nuovi/modificati — pulito.
- Dev server + Chromium headless via Playwright: sidebar visibile con le 6
  categorie corrette; toggle expand/collapse su un ramo funzionante; click
  su una voce figlio (esperienza "Software Engineer") apre il Knowledge
  Document Viewer con il documento corretto e la voce si evidenzia;
  cambio lingua IT/ENG aggiorna correttamente tutte le etichette della
  sidebar; ridotto il viewport sotto 640px → sidebar collassa dietro il
  toggle, nessuna sovrapposizione con topbar/icone; aperto il toggle →
  overlay con backdrop, nessun errore in console.

---

### Cosa resta (Fasi successive, non in scope qui)

- **Layout a tre colonne** (Knowledge Explorer | AI Assistant | Document
  Viewer) — richiede ripensare il posizionamento delle finestre rispetto
  allo spazio occupato dalla sidebar (oggi `CENTER_ON_OPEN` ignora la
  sidebar).
- **AI Assistant come elemento centrale del desktop** — oggi resta una
  finestra tra le altre.
- Ricerca globale sulla Knowledge Base, cross-reference tra documenti,
  header "Knowledge Document" con metadata (progetto/data/reading
  time/topics) — idee di `docs/archivio/VISION.md` non ancora decise per
  l'implementazione.

---

## 2026-07-11 — Fase 12: Explainability

Riferimento: documento di visione "Portfolio Architecture — Knowledge Base +
AI Assistant" (vedi `docs/archivio/VISION.md`, stesso citato nei log precedenti). Ultima fase della
roadmap originale: rende cliccabili le fonti già restituite dall'AI
Assistant (Fase 10) e già mostrate come testo semplice in `AssistantWindow`
(Fase 11), così l'utente può aprire direttamente il documento citato.

Fase piccola e ben definita: tutto il meccanismo necessario esisteva già
(payload del `WindowManager` dalla Fase 9, `KnowledgeDocumentWindow`,
`sources` già validate lato server in Fase 10) — qui si collegano i pezzi.

---

### Modifica

**Stato: ✅ completato**

`src/windows/Assistant/index.tsx`: ogni fonte sotto una risposta
dell'assistente era uno `<span>` di solo testo; trasformato in
`<button>` che chiama `openWindow("knowledge-document", { path: source })`
(stesso meccanismo già usato da `ProjectsWindow` per "Leggi il case
study", vedi Fase 9). Serve `useWindowManager()`, non ancora
importato in questa finestra.

Nessuna corrispondenza da verificare tra il `path` restituito
dall'assistant e quello atteso da `KnowledgeDocumentWindow`: sono già lo
stesso formato (`knowledge-base/...`), e la function di Fase 10 già
valida le fonti dichiarate dal modello contro i path reali della
Knowledge Base prima di restituirle (`validPaths` in
`netlify/functions/assistant.ts`) — quindi ogni fonte cliccata in chat
corrisponde sempre a un documento esistente.

`src/windows/Assistant/Assistant.css`: `.assistant-msg__source` da testo
statico a bottone (reset di `background`/`border`/`padding` del browser,
`cursor: pointer`, hover con colore accent + sottolineatura per segnalare
la cliccabilità).

### Verifica

**Stato: ✅ completato**

`npx tsc -b --noEmit` e `npm run lint` puliti. Testato dal vivo con
`npm run dev:full` + Chromium headless: chiesto "Explain Antichità
Fallavena" all'assistente, cliccata la fonte mostrata
(`📄 knowledge-base/projects/antichita-fallavena.en.md`) → si apre la
finestra "Case Study" con il documento corretto ("Antichità Fallavena"),
sopra la finestra Assistant. Zero errori console.

---

### Stato della roadmap

Con questa fase si chiude la roadmap originale "Knowledge Base + AI
Assistant" (Fasi 8-12): Knowledge Base come Single Source of Truth,
Knowledge Document Viewer, backend grounded su OpenRouter, finestra
conversazionale, ed Explainability con fonti cliccabili — l'intero ciclo
"il sito e l'assistente leggono dagli stessi documenti" descritto nella
visione originale è ora implementato end-to-end.

Idee non implementate, emerse durante le fasi precedenti (non richieste
dalla roadmap, possibili sviluppi futuri):
- Evidenziare la sezione specifica del documento citata (oggi si apre
  l'intero documento, non uno scroll-to-section)
- Confidence score sulla risposta
- Streaming della risposta dell'assistente
- Rate limiting reale sulla function (oggi solo limiti di lunghezza input)

---

## 2026-07-11 — Fase 11: Finestra AI Assistant

Riferimento: documento di visione "Portfolio Architecture — Knowledge Base +
AI Assistant" (vedi `docs/archivio/VISION.md`, stesso citato in
Fase 8/Fase 9/Fase 10).
Collega il backend della Fase 10 (`/api/assistant`) a una finestra vera nel
desktop — la prima UI conversazionale del portfolio.

Decisioni prese con l'utente prima di implementare:
- Nome/titolo finestra: **"Ask about Francesco"**.
- Conversazione **persistita** in localStorage (stesso pattern dello stato
  delle altre finestre): chiudendo e riaprendo la finestra resta.
- Le fonti (`sources`, già restituite dalla function di Fase 10) restano
  **testo semplice** in questa fase; il collegamento cliccabile al
  Knowledge Document Viewer è rimandato alla Fase 12 come da roadmap.

---

### Step 1 — Traduzioni e conversation starters

**Stato: ✅ completato**

Nuove chiavi chrome in `src/context/translations.ts` (`assistantIntro`,
`assistantPlaceholder`, `assistantThinking`, `retry`, `send`,
`resetConversation`). I suggerimenti di conversazione del documento di
visione ("Tell me about your experience", "Which project are you most
proud of?", ecc.) sono un array, non una stringa singola: esportati come
`conversationStarters: Record<Language, string[]>` **separato** da
`translations`, per non alterare il tipo di ritorno `string` di `t()` in
`LanguageContext.tsx`.

### Step 2 — `AssistantWindow`

**Stato: ✅ completato**

Nuovo `src/windows/Assistant/index.tsx` + `Assistant.css`. Stato locale:
`messages` (persistito in localStorage con `readJSON`/`writeJSON` da
`src/utils/storage.ts`, stesso pattern di `WindowManagerContext.tsx`),
`input`, `loading`, `error` (questi ultimi tre non persistiti).

Invio separato in due funzioni per non duplicare il turno utente al
"Riprova":
- `handleSend(text)` — aggiunge il messaggio utente allo stato, poi chiama
  `callAssistant`.
- `callAssistant(currentMessages)` — `POST /api/assistant` con
  `{ message, language, history }` (history = conversazione precedente,
  ultimi 10 turni, mappata a `{role, content}` per rispettare il limite
  del backend, vedi `netlify/functions/assistant.ts`); in errore imposta
  `error` **senza** toccare `messages`.
- `handleRetry()` — richiama `callAssistant(messages)` senza aggiungere
  un nuovo turno (i messaggi correnti finiscono già con lo user turn non
  risposto).

Risposta dell'assistente renderizzata con `renderBlock()` (già esistente
in `src/lib/markdown.ts`, stesso helper del Knowledge Document Viewer di
Fase 9) invece di testo semplice: le risposte del modello contengono
markdown (`**grassetto**`), e senza parsing comparivano asterischi
letterali nella UI — scoperto durante il test end-to-end (vedi Step 3),
non visibile da tsc/lint.

Suggerimenti di conversazione mostrati come bottoni verticali quando la
conversazione è vuota; bottone "Nuova conversazione" per svuotare stato
+ localStorage.

### Step 3 — Registrazione finestra e verifica end-to-end

**Stato: ✅ completato**

`src/config/windows.ts`: nuova entry `assistant` (icona `Bot`,
`inDock: true` — a differenza del Knowledge Document Viewer, questa è una
feature in vista, non una finestra "nascosta").

`npx tsc -b --noEmit` e `npm run lint` puliti. Verificato dal vivo con
`npm run dev:full` + Chromium headless (Playwright):

- Apertura finestra, click su uno starter → risposta grounded corretta,
  fonte mostrata (`📄 knowledge-base/projects/antichita-fallavena.en.md`),
  **markdown renderizzato correttamente** dopo il fix di cui sopra (prima
  del fix: asterischi letterali attorno a "Next.js", "Firebase", ecc.).
- Chiusura e riapertura della finestra → conversazione ancora presente
  (persistenza confermata: 2 bolle prima e dopo).
- "Nuova conversazione" → stato svuotato, starter di nuovo visibili.
- Errore di rete simulato (route abortita) → banner "Failed to fetch" +
  bottone "Retry", **senza duplicare** la bolla utente già inviata.
- Zero errori console in tutti gli scenari.

**Nota sulla latenza del modello free-tier**: durante il primo test la
function locale è andata in timeout dopo 30s (limite dell'emulazione
`netlify dev`/lambda-local). Isolato il problema chiamando OpenRouter
direttamente con lo stesso system prompt reale (~8.800 caratteri, 12
documenti): in condizioni normali la risposta arriva in **~4 secondi**,
quindi il prompt non è la causa — è la stessa variabilità del provider
free-tier già osservata in Fase 10 (occasionali rallentamenti/429). Da
tenere presente: in produzione, se Netlify applica un timeout di
esecuzione più basso del previsto per le function, una risposta lenta del
modello free potrebbe restituire un errore al posto della risposta invece
di aspettare — l'utente vede comunque il banner "Riprova" invece di un
crash silenzioso, quindi il degrado è "educato", ma un modello a
pagamento più stabile risolverebbe la causa a monte (cambiare
`OPENROUTER_MODEL` è solo una env var, nessuna modifica al codice).

---

### Cosa resta (Fasi successive, non in scope qui)

- **Fase 12** — Explainability: rendere cliccabili le `sources` mostrate
  in `AssistantWindow` (aprono `KnowledgeDocumentWindow` per quel `path`
  tramite `openWindow("knowledge-document", { path })`, meccanismo già
  pronto dalla Fase 9)
- Persistere anche la bozza non ancora inviata nell'input (oggi si perde
  chiudendo la finestra, solo `messages` è persistito)
- Streaming della risposta (effetto "digitazione"), se in futuro si vuole
  migliorare la UX di attesa oltre l'indicatore "Sto pensando..."

---

## 2026-07-11 — Fase 10: Netlify Function per OpenRouter

Riferimento: documento di visione "Portfolio Architecture — Knowledge Base +
AI Assistant" (vedi `docs/archivio/VISION.md`, stesso citato in
Fase 8/Fase 9). Prima fase
di backend: nessuna UI ancora (quella è Fase 11), solo la function e il
suo contratto request/response.

Decisioni prese con l'utente prima di implementare:
- Modello **free tier** su OpenRouter (`mistralai/mistral-7b-instruct:free`
  di default, override via env var).
- **Una sola chiamata LLM**: lo stesso prompt classifica lo scope della
  domanda (IN_SCOPE/PARTIALLY_IN_SCOPE/OUT_OF_SCOPE, criterio dal
  documento di visione) e genera la risposta grounded. Niente vector
  DB/retrieval semantico: la Knowledge Base è piccola, viene passata per
  intero (filtrata per lingua) come contesto.

---

### Step 0 — Vincolo tecnico: due loader per due runtime

**Stato: ✅ completato**

`src/lib/knowledgeBase.ts` (Fase 8) usa `import.meta.glob`, un'API solo
Vite: non utilizzabile dentro una Netlify Function, che viene impacchettata
da esbuild in un runtime Node separato dal bundle del sito. Creato un
secondo loader minimale, `netlify/functions/lib/kb.ts`: stesso approccio
concettuale (cammina `knowledge-base/`, parse con `gray-matter`), ma con
`fs`/`path` invece di `import.meta.glob`. Qui `gray-matter` gira in Node
puro — nessun bisogno del polyfill `Buffer` della Fase 8, quello serviva
solo per il browser (vedi Fase 8, Step 6).

I dati restano un'unica fonte di verità (i file `.md`); è la *logica di
lettura* ad essere necessariamente duplicata tra i due runtime.

### Step 1 — `netlify/functions/assistant.ts`

**Stato: ✅ completato**

Netlify Function v2 (`export default async (req: Request) => Response`,
coerente con `"type": "module"` già in `package.json`).

**Contratto**:
```
POST /api/assistant
Content-Type: application/json

{
  "message": "string, 1-2000 caratteri",
  "language": "it" | "en",
  "history"?: [{ "role": "user" | "assistant", "content": "string" }]  // max 10 voci
}
```

Risposte:
- `200 { "answer": string, "sources": string[] }`
- `400 { "error": string }` — input invalido
- `405` — metodo diverso da POST
- `500 { "error": string }` — manca `OPENROUTER_API_KEY` lato server
- `502 { "error": string }` — OpenRouter non raggiungibile o risposta
  inattesa

**Come funziona**:
1. Valida `message`/`language`/`history` (limiti difensivi: nessuna vera
   infra di rate-limiting in questa fase, vedi "Cosa resta").
2. Carica la KB con `loadKnowledgeBase()`, tiene solo i documenti
   lang-neutral o nella lingua richiesta (dimezza il contesto).
3. Costruisce un system prompt che include: identità dell'assistente,
   criterio di scope classification con l'esempio di rifiuto dal
   documento di visione, l'intera KB filtrata (ogni doc preceduto dal suo
   `path`), e l'istruzione di chiudere la risposta con un blocco fisso
   `---SOURCES---` seguito da un path per riga (vuoto se OUT_OF_SCOPE).
   Delimitatore a testo semplice invece di JSON strutturato: più robusto
   con un modello free-tier che non garantisce JSON mode.
4. Chiama `POST https://openrouter.ai/api/v1/chat/completions` (endpoint,
   headers e schema confermati via documentazione ufficiale OpenRouter)
   con `Authorization: Bearer ${OPENROUTER_API_KEY}`, `temperature: 0.3`,
   `max_tokens: 1000`, e il modello da `OPENROUTER_MODEL` (default
   `openai/gpt-oss-20b:free` — vedi Step 4 per come si è arrivati a
   questa scelta invece di `mistralai/mistral-7b-instruct:free`).
5. Separa risposta e fonti sul marker `---SOURCES---`; **valida ogni
   fonte dichiarata dal modello contro i path realmente esistenti nella
   KB filtrata** (`validPaths`), scartando eventuali path inventati —
   piccola rete di sicurezza per l'Explainability della Fase 12.

**Nota sui rate limit**: i modelli con suffisso `:free` su OpenRouter
hanno **50 richieste/giorno senza credito caricato** sull'account
(1000/giorno con almeno $10 di credito). Accettabile per un portfolio
personale a basso traffico; da tenere presente se il traffico crescesse
— cambiare modello è solo una env var (`OPENROUTER_MODEL`), nessuna
modifica al codice.

### Step 2 — Config Netlify

**Stato: ✅ completato**

`netlify.toml`:
```toml
[functions]
  directory = "netlify/functions"
  included_files = ["knowledge-base/**"]

[[redirects]]
  from = "/api/assistant"
  to = "/.netlify/functions/assistant"
  status = 200
```
`included_files` è necessario: i `.md` sono letti a runtime via `fs`, non
importati da codice, quindi l'esbuild bundler della function non li
includerebbe di default — 500 in produzione pur funzionando in locale
(gotcha comune con Netlify Functions + asset non-JS).

Il redirect dà un path pulito (`/api/assistant`) da usare in Fase 11
invece dell'URL interno `/.netlify/functions/assistant`.

### Step 3 — Tooling locale

**Stato: ✅ completato**

- `netlify-cli` aggiunto come devDependency; nuovo script `npm run
  dev:full` (= `netlify dev`) che fa da proxy a Vite **e** serve le
  function in locale, leggendo automaticamente un `.env` alla radice.
  `npm run dev` resta invariato (solo Vite, per iterare sul frontend
  senza serverless).
- `.env.example` (committato, nessun segreto) con `OPENROUTER_API_KEY=` e
  `OPENROUTER_MODEL=openai/gpt-oss-20b:free`. Per sviluppare:
  `cp .env.example .env` e incollare la propria chiave — `.env` è in
  `.gitignore` (aggiunto esplicitamente: prima c'era solo `*.local`, che
  non copre un file `.env` semplice). Aggiunta anche `.netlify` al
  `.gitignore` (stato locale creato da `netlify link`/`netlify dev`).
- `tsconfig.functions.json` (nuovo, stesso pattern di `tsconfig.node.json`
  ma con `moduleResolution: "bundler"` dato che le function vengono
  impacchettate da esbuild come il bundle Vite, non eseguite come ESM
  Node grezzo) referenziato da `tsconfig.json` radice: `npx tsc -b
  --noEmit` valida anche `netlify/functions/`.

### Step 4 — Verifica end-to-end (con la key reale dell'utente)

**Stato: ✅ completato**

`npx tsc -b --noEmit` e `npm run lint` puliti. Testato dal vivo con
`netlify dev` + `curl` contro `http://localhost:8888/api/assistant`,
usando la vera `OPENROUTER_API_KEY` dell'utente (mai vista né gestita da
Claude, solo verificata la presenza della variabile). Durante questo test
sono emersi e risolti tre problemi reali, non visibili da tsc/lint:

1. **Header HTTP con carattere non-ASCII**: `X-Title` conteneva una
   em-dash (`—`, U+2014). I valori degli header HTTP devono essere
   ByteString (0-255): il `fetch` nativo di Node lanciava
   `TypeError: Cannot convert argument to a ByteString...` **prima
   ancora di uscire in rete**, intercettato dal blocco `catch` generico e
   mascherato come "Failed to reach OpenRouter". Sostituito con un
   trattino ASCII semplice. Lezione: loggare l'errore reale nel `catch`
   (`console.error`, lato server, mai esposto al client) invece di un
   messaggio generico silenzioso — senza quel log il problema sarebbe
   stato molto più lento da isolare.
2. **Modello di default non più disponibile**: `mistralai/mistral-7b-instruct:free`
   rispondeva `404 No endpoints found` — modello ritirato/non più servito
   su OpenRouter (i modelli free cambiano nel tempo). Interrogato
   `GET /api/v1/models` per trovare modelli `:free` attualmente attivi;
   diversi (Llama 3.3 70B, Llama 3.2 3B, Qwen3, Hermes) rispondevano
   `429` per congestione temporanea del provider upstream (community
   free tier, non quota dell'account). `openai/gpt-oss-20b:free` è
   risultato stabile: aggiornato come nuovo default nel codice e in
   `.env.example`.
3. **Blocco `---SOURCES---` assente nella risposta**: la prima risposta
   corretta (grounded, in italiano, nessun errore) non includeva mai il
   marker delle fonti — e verso la fine degenerava in testo incoerente
   ("...CSSAscesi…"), sintomo di risposta troncata da un `max_tokens` di
   default troppo basso lato provider. Aggiunti `temperature: 0.3` e
   `max_tokens: 1000` espliciti nella chiamata, e spostata l'istruzione
   sul marker **dopo** il dump della Knowledge Base nel system prompt
   (i modelli seguono meglio le istruzioni vicine alla fine di un prompt
   lungo), rendendola esplicitamente "regola rigida, non opzionale" con
   un esempio concreto. Dopo la modifica, `sources` è risultato popolato
   correttamente con i path reali per entrambe le lingue.

Risultati finali dei quattro test manuali (dev server via `npm run
dev:full`, porta 8888):

| Test | Input | Risultato |
|---|---|---|
| IN_SCOPE (IT) | "Quali progetti hai realizzato?" | Risposta grounded corretta su entrambi i progetti, `sources: ["knowledge-base/projects/antichita-fallavena.it.md", "knowledge-base/projects/portfolio-v2.it.md"]` |
| OUT_OF_SCOPE (IT) | "Che tempo fa oggi a Bologna?" | Rifiuto quasi verbatim all'esempio del documento di visione, `sources: []` |
| Input invalido | `{}` | `400` con messaggio d'errore chiaro |
| IN_SCOPE (EN) | "What is your tech stack for the antichita fallavena project?" | Risposta corretta in inglese, `sources: ["knowledge-base/projects/antichita-fallavena.en.md"]` |

Comandi usati:
```bash
npm run dev:full   # in background, porta di default 8888

curl -X POST http://localhost:8888/api/assistant \
  -H "Content-Type: application/json" \
  -d '{"message": "Quali progetti hai realizzato?", "language": "it"}'

curl -X POST http://localhost:8888/api/assistant \
  -H "Content-Type: application/json" \
  -d '{"message": "Che tempo fa oggi a Bologna?", "language": "it"}'

curl -X POST http://localhost:8888/api/assistant \
  -H "Content-Type: application/json" -d '{}'
```

---

### Cosa resta (Fasi successive, non in scope qui)

- **Fase 11** — Finestra AI Assistant nel desktop, collegata a
  `/api/assistant` (fetch dal frontend, storia conversazione lato client)
- **Fase 12** — Explainability: rendere cliccabili le `sources` già
  restituite dalla function (aprono `KnowledgeDocumentWindow` per quel
  `path`, meccanismo payload già pronto dalla Fase 9)
- Rate limiting reale (oggi solo limiti di lunghezza input, nessuna
  protezione anti-abuso persistente: richiederebbe uno store esterno,
  es. Netlify Blobs, non necessario per il traffico atteso di un
  portfolio personale)
- Risposta in streaming (SSE) per un effetto "digitazione" in UI — oggi
  la function risponde in un unico blocco JSON

---

## 2026-07-11 — Fase 9: Knowledge Document Viewer

Riferimento: documento di visione "Portfolio Architecture — Knowledge Base +
AI Assistant" (vedi `docs/archivio/VISION.md`, stesso citato in Fase 8). Prosegue
direttamente dalla Fase 8: la Knowledge Base esiste già come dati, questa
fase aggiunge la prima vista che la usa per intero, non solo a teaser.

Obiettivo della fase: introdurre una vista "documentazione tecnica" per un
documento della Knowledge Base — distinta dalla card storytelling già
esistente in `ProjectsWindow` — riusando lo stesso file `.md` per due
letture diverse, come da visione originale.

Decisioni prese con l'utente prima di implementare:
- **Entry point**: solo da `ProjectsWindow` in questa fase (Developer Notes
  e altri tipi restano invariati, estendibile in seguito).
- **Contenuto**: arricchire subito i body dei due progetti esistenti con
  sezioni vere (`## Overview/Problem/Solution/Challenges/Future
  Improvements`), non solo costruire il plumbing su un body ancora a
  paragrafo singolo.

---

### Step 0 — Correzione contenuto progetti

**Stato: ✅ completato**

Durante la raccolta dei dettagli reali per "Antichità Fallavena", emerso
che il campo `stack` in `knowledge-base/projects/antichita-fallavena.*.md`
era sbagliato: dichiarava `["HTML", "CSS", "JavaScript", "GitHub Copilot",
"Claude", "ChatGPT"]`, ma lo stack reale è **Next.js + Firebase +
Netlify** (con una versione precedente in React puro, sostituita per
avere controllo lato server). Corretto in `["Next.js", "React",
"Firebase", "Netlify"]`.

Aggiunte sezioni `## Overview / ## Problem / ## Solution / ## Challenges /
### Future Improvements` (IT + EN) a:
- `projects/antichita-fallavena.{it,en}.md`: problema (vecchio sito
  obsoleto), soluzione (Next.js/Netlify, catalogo su Firebase con pannello
  admin custom per prodotti/eventi, newsletter via cron job), sfide
  (pannello admin sicuro senza accesso diretto al DB, invio automatico
  newsletter), miglioramenti futuri (navigazione, UI più user-friendly).
- `projects/portfolio-v2.{it,en}.md`: problema (contenuto triplicato nei
  vecchi componenti, nessuna base per un AI Assistant grounded), soluzione
  (architettura a finestre + Knowledge Base da Fase 8), sfide
  (sincronizzazione stato finestre, multilingua, bug Buffer/gray-matter),
  miglioramenti futuri (questa fase, poi AI Assistant + Explainability).

### Step 1 — Problema: teaser vs documento intero

**Stato: ✅ completato**

`ProjectsWindow` (`src/windows/Projects/index.tsx`) passava l'intero
`proj.body` a `renderInline()` per il teaser della card. Con il body ora
multi-sezione, la card avrebbe mostrato tutto il testo concatenato senza
heading.

Aggiunto `getOverviewExcerpt(body)` in `src/lib/markdown.ts`: estrae solo
il testo sotto `## Overview` (fino al prossimo `## ` o a fine stringa).
Se il body non ha sezioni (es. developer notes, ancora a paragrafo
singolo), ritorna il body intero — nessuna rottura per i documenti non
ancora arricchiti.

### Step 2 — Payload sul WindowManager

**Stato: ✅ completato**

Il `WindowManager` istanziava ogni finestra come `<Content />`, senza
props: non c'era modo di dire "apri questa finestra per QUESTO
documento". Esteso (non solo per questa fase: sarà lo stesso meccanismo
usato in Fase 12 per aprire un documento da un link di citazione dell'AI
Assistant):

- `WindowState` (`src/desktop/WindowManagerContext.tsx`): nuovo campo
  `payload?: unknown`.
- Action `OPEN` accetta `payload?: unknown`; se la finestra è già aperta,
  il payload viene aggiornato (non ignorato) — così riaprire il Viewer su
  un progetto diverso mentre è già aperto ne sostituisce il contenuto
  invece di lasciare quello vecchio.
- `openWindow(id, payload?)` — firma estesa nel context value.
- `WindowManager.tsx` passa `<Content payload={win.payload} />` a ogni
  finestra; tutti i componenti esistenti (a zero props) restano
  assegnabili al nuovo tipo `ComponentType<{ payload?: unknown }>` senza
  modifiche, dato che il payload è opzionale.
- `WindowConfig` (`src/config/windows.ts`): nuovo campo `hidden?: boolean`
  — finestra apribile solo via `openWindow(id, payload)`, senza icona sul
  desktop (il Dock era già filtrato da `inDock`). `Desktop.tsx` filtra le
  icone con `!w.hidden`.

### Step 3 — Componente `KnowledgeDocumentWindow`

**Stato: ✅ completato**

Nuova finestra `src/windows/KnowledgeDocument/` (id `knowledge-document`,
`hidden: true`, `allowMaximize: true`):

- Legge `path` dal payload, cerca il documento con `getAllDocs()` (già
  esportato da `knowledgeBase.ts` fin dalla Fase 8, mai usato finora).
- Renderizza il body intero con `renderBlock()` (già presente in
  `src/lib/markdown.ts`, scritto in Fase 8 apposta per questa fase, mai
  usato finora) dentro `dangerouslySetInnerHTML`, con CSS a selettori
  discendenti per h2/p/ul/strong (contenuto non scopato da React).
- Footer con la fonte (`📄 projects/antichita-fallavena.en.md`), in linea
  con l'esempio di Explainability del documento di visione — anticipa la
  Fase 12 ma qui è solo testo statico, non ancora un link cliccabile.

`ProjectsWindow`: aggiunto bottone "Read case study" / "Leggi il case
study" (nuova chiave di traduzione `viewCaseStudy`) sotto i tag stack di
ogni card, che chiama `openWindow("knowledge-document", { path: proj.path })`.

### Step 4 — Verifica

**Stato: ✅ completato**

- `npx tsc -b --noEmit` — nessun errore di tipo.
- `npm run lint` (oxlint) — pulito.
- Dev server + Chromium headless (Playwright, stesso approccio del fix
  Buffer): aperta Projects, cliccato "Read case study" su Antichità
  Fallavena → finestra Case Study con `<h2>Overview</h2>`,
  `<h2>Problem</h2>`, `<h2>Solution</h2>` ecc. renderizzati come heading
  HTML veri (non testo `## ` letterale), zero errori console. Chiuso il
  Viewer e cliccato "Read case study" su Portfolio v2 → titolo aggiornato
  correttamente a "Portfolio v2 — Desktop", confermando che riaprire la
  finestra con un payload diverso ne sostituisce il contenuto.

---

### Cosa resta (Fasi successive, non in scope qui)

- **Fase 10** — Netlify Function per la chiamata a OpenRouter (scope
  classification + retrieval su `getAllDocs()` + chiamata con key
  server-side)
- **Fase 11** — Finestra AI Assistant collegata alla function
- **Fase 12** — Explainability: rendere cliccabile il footer sorgente già
  presente in `KnowledgeDocumentWindow` (oggi solo testo), collegato alle
  citazioni delle risposte dell'AI Assistant
- Estendere l'entry point del Viewer oltre `ProjectsWindow` (es. Developer
  Notes) quando quei body verranno arricchiti con sezioni strutturate

---

## 2026-07-11 — Fase 8: Knowledge Base

Riferimento: documento di visione "Portfolio Architecture — Knowledge Base +
AI Assistant" (vedi `docs/archivio/VISION.md`). Prosegue la numerazione delle fasi
già presente in questo repo (Fase 1-7 completate secondo
`Curriculum_Portfolio_v2_Roadmap.md`).

Obiettivo della fase: introdurre `knowledge-base/` come Single Source of
Truth per tutti i contenuti "di fatto" su Francesco (profilo, esperienze,
formazione, competenze, progetti, developer notes), ed eliminare i dati
hardcoded/duplicati nei componenti React. Questa fase **non** tocca ancora
UI nuova (niente Knowledge Document Viewer, niente AI Assistant): è solo
lo strato dati sotto le finestre esistenti.

---

### Step 0 — Ricognizione dello stato reale del repo

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

### Step 1 — Struttura `knowledge-base/` e convenzioni

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

### Step 2 — Migrazione contenuti

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

### Step 3 — Loader (`src/lib/knowledgeBase.ts`)

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

### Step 4 — Rewiring dei componenti

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
  in `knowledge-base/`. Vedi `docs/adr/0001-knowledge-base.md` per il
  criterio usato per decidere cosa resta chrome e cosa diventa KB.

**Fix minore trovato durante il rewiring**: la label "Voto:" nella sezione
Formazione era hardcoded in italiano anche nella versione inglese del CV
(mostrava "Voto: 96/110" pure con `language === "en"`). Aggiunta chiave
`gradeLabel` ("Voto" / "Grade") in `translations.ts`.

### Step 5 — Verifica

**Stato: ✅ completato**

- `npm run build` → build pulita (`tsc -b && vite build`), nessun errore
  di tipo
- `npm run lint` → 0 warning, 0 errori (oxlint, 27 file)
- Bundle finale: `482.33 kB` (`134.57 kB` gzip) — in linea con la Fase 4
  (già ottimizzata per evitare l'import a wildcard di `lucide-react`)

### Step 6 — Fix: `Buffer is not defined` a runtime

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

### Nota sul documento di visione originale

Il documento "Portfolio Architecture — Knowledge Base + AI Assistant" da
cui parte questa fase è ora committato come `docs/archivio/VISION.md`, che ne
formalizza anche l'evoluzione successiva (Knowledge Explorer, layout a tre
colonne).

### Cosa resta (Fasi successive, non in scope qui)

- **Fase 9** — Knowledge Document Viewer: nuova finestra che renderizza il
  body Markdown di un progetto come documentazione (Overview/Problem/
  Solution/Challenges), distinta dalla card di `ProjectsWindow`
- **Fase 10** — Netlify Function per la chiamata a OpenRouter (scope
  classification + retrieval su `getAllDocs()` + chiamata con key server-side)
- **Fase 11** — Finestra AI Assistant collegata alla function
- **Fase 12** — Explainability (fonti cliccabili, usa già `path` di
  `KnowledgeDoc`)

---

## 2026-07-11 — Fase 7: centraggio, schermo intero, tap singolo

_Voce ricostruita dalla sezione «Stato — Fase 7» del vecchio README: questa Fase non aveva un log a sé._

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

---

## 2026-07-11 — Fase 6: fix mobile

_Voce ricostruita dalla sezione «Stato — Fase 6» del vecchio README: questa Fase non aveva un log a sé._

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

---

## 2026-07-11 — Fase 5: Persistenza

Riferimento: `Curriculum_Portfolio_v2_Roadmap.md`, sezione "Fase 5 - Gestione
con Context/Zustand. Persistenza: tema, finestre aperte, finestra attiva."

Nota: la persistenza della **lingua** è già stata implementata insieme al
sistema i18n arrivato in Fase 4 (`localStorage.getItem("language")` in
`LanguageContext.tsx`). Questa fase copre quello che manca: tema, finestre
aperte (posizione, minimizzate) e finestra attiva (a fuoco).

Si resta su **Context + reducer** (non Zustand): lo stato è già centralizzato
e la roadmap lascia "Context/Zustand" come alternativa equivalente — passare
a Zustand qui sarebbe un cambio di libreria senza un problema reale da
risolvere (over-engineering, contro uno dei principi guida della roadmap).

---

### Step 1 — Utility di storage condivisa

**Stato: ✅ completato**

- `src/utils/storage.ts`: `readJSON`/`writeJSON`, entrambe con try/catch —
  se lo storage non è disponibile l'app continua a funzionare, solo senza persistenza

### Step 2 — Persistenza tema

**Stato: ✅ completato**

- `Desktop.tsx`: stato iniziale del tema calcolato in un lazy initializer
  (`getInitialTheme`) — `localStorage` → se assente, `prefers-color-scheme`
  di sistema → default `dark`
- Salvataggio in `localStorage` nello stesso `useEffect` che già applicava
  `data-theme` al `documentElement`, nessun effect aggiuntivo necessario

### Step 3 — Persistenza Window Manager (finestre aperte + finestra attiva)

**Stato: ✅ completato**

- `useReducer(reducer, undefined, getInitialState)`: stato iniziale letto da
  `localStorage` tramite la forma a 3 argomenti di `useReducer` (init function)
- `getInitialState` scarta le finestre con id non più presente in
  `windowsConfig`, per sicurezza in caso la config cambi in futuro
- Un solo `useEffect` su `state` salva l'intero stato (`windows` + `nextZIndex`)
  ad ogni variazione — apertura, chiusura, drag, minimizza, focus
- "Finestra attiva" non è stata trattata come dato a parte: è già derivabile
  come quella con `zIndex` più alto, e viene ripristinata automaticamente
  perché ogni finestra porta con sé il proprio `zIndex` salvato

### Step 4 — Verifica finale

**Stato: ✅ completato**

- `npm run build`: OK (bundle ~238 KB / 73 KB gzip, invariato)
- `npm run lint` (oxlint): 0 warning, 0 errori
- `README.md` aggiornato

---

### Decisioni prese durante l'implementazione

- **Niente Zustand.** Lo stato del Window Manager era già centralizzato in
  un reducer; introdurre Zustand qui avrebbe significato cambiare libreria
  senza risolvere un problema reale (la roadmap stessa elenca "Context/Zustand"
  come alternative equivalenti, non come step obbligati entrambi).
- **`useReducer` a 3 argomenti invece di un `useEffect` di hydration**: evita
  un render "vuoto" seguito da un secondo render con lo stato ripristinato —
  lo stato iniziale è già quello corretto al primo render.
- **Un solo `useEffect` di salvataggio per l'intero stato** (non uno per
  ogni singola azione): più semplice da mantenere, e scrivere su
  localStorage ad ogni variazione di stato (anche durante il drag) ha un
  costo trascurabile per un oggetto di queste dimensioni.
- **Nessuna gestione esplicita di "finestra attiva" come campo separato**:
  sarebbe stato un dato ridondante, dato che è già ricavabile dal `zIndex`
  massimo tra le finestre aperte.

### Fase 5 completata — riepilogo persistenza

| Dato | Persistito | Dove |
|---|---|---|
| Tema (light/dark) | ✅ | `localStorage["theme"]` |
| Lingua (it/en) | ✅ (da Fase 4) | `localStorage["language"]` |
| Finestre aperte/minimizzate/posizione | ✅ | `localStorage["windowManagerState"]` |
| Finestra attiva (a fuoco) | ✅ (derivata da `zIndex`) | incluso nel punto sopra |

Con questo, tutti i punti della roadmap risultano implementati. Prossimi
passi possibili (non richiesti dalla roadmap originale, solo idee):
rifiniture i18n minori già segnalate nel log Fase 4 (titoli finestre/dock),
eventuale resize delle finestre se in futuro servisse.

---

## 2026-07-11 — Fase 4: Finestre

Riferimento: `Curriculum_Portfolio_v2_Roadmap.md`, sezione "Fase 4 - Finestre".
Questa è la fase più corposa: si procede per step indipendenti, alcuni in
questa consegna, altri lasciati pianificati per la prossima.

Contenuto sorgente: vecchio `Index.html` del repo `Curriculum` (CV attuale).

---


Riferimento: `Curriculum_Portfolio_v2_Roadmap.md`, sezione "Fase 4 - Finestre".

Contenuto sorgente: vecchio `Index.html` del repo `Curriculum` (CV attuale).

**Nota sulla cronologia**: gli Step 1-3 sono stati implementati in sessione
con Claude. Gli Step 4-7 sono arrivati con un push esterno al repo
("refactor creazione desktop app") — commit valido nella sostanza, ma con
alcuni problemi di build/runtime non ancora sistemati. Questa sessione ha
verificato quel push, corretto i problemi trovati e aggiornato il log.

---

### Step 1 — Data layer: popolare `src/data/*.json`

**Stato: ✅ completato**

- `resume.json`, `skills.json`, `projects.json` popolati con i dati reali
  dal vecchio CV. `projects.json` ha poi acquisito una shape più ricca
  (`image`, `demoUrl`, `githubUrl`, `description: {it, en}`) per supportare
  i18n e le card con immagine — buona evoluzione rispetto all'impostazione
  iniziale, mantenuta.

### Step 2 — Finestra Skills

**Stato: ✅ completato**

- Competenze per categoria, senza barre percentuali. Icona per categoria
  con lookup dinamico da `skills.json` (`icon: "Terminal"` ecc.)

### Step 3 — Finestra Contact

**Stato: ✅ completato**

- Link rapidi + funzione "copia negli appunti" per email/telefono (aggiunta
  non pianificata ma naturale, mantenuta)

### Step 4 — Finestra Experience (timeline verticale)

**Stato: ✅ completato** (arrivato col push esterno)

- Timeline verticale con nodo "corrente" evidenziato per il ruolo in corso

### Step 5 — Finestra Projects (card)

**Stato: ✅ completato** (arrivato col push esterno)

- Card con immagine, stack, link GitHub/demo. Le immagini
  (`antichita_fallavena.jpg`, `portfolio_v2.jpg`) sono in `public/images/`

### Step 6 — Finestra Resume (CV completo + Download PDF)

**Stato: ✅ completato** (arrivato col push esterno)

- CV completo dentro la finestra, con tutte le sezioni del vecchio sito
- Download PDF implementato con `window.print()` + un layout `PrintableResume`
  dedicato e CSS `@media print` — **niente più html2canvas/jsPDF**: approccio
  più semplice e leggero del vecchio sito (nessuna libreria pesante da caricare)

### Step 7 — Finestra Developer Notes (extra)

**Stato: ✅ completato** (arrivato col push esterno)

- 2 casi di problem solving in stile "log di sistema" (LOG-041, LOG-028)

### Step 8 — Rifinitura stile / i18n

**Stato: ✅ completato** (arrivato col push esterno, non pianificato inizialmente)

- Sistema di traduzione IT/EN completo (`context/LanguageContext.tsx`),
  con auto-detect della lingua del browser e persistenza in `localStorage`
  — di fatto anticipa un pezzo della Fase 5 (persistenza), qui solo per la lingua

---

### Problemi trovati e corretti in questa sessione (revisione del push esterno)

Il push era funzionalmente quasi completo ma **non passava la build**. Elenco
dei problemi, dal più al meno grave:

1. **Bug funzionale: il PDF risultava bianco.** `PrintableResume` (il layout
   stampabile) veniva renderizzato *dentro* `.desktop`, ma la regola
   `@media print` nascondeva `#root` e `.desktop` con `display: none`.
   Un discendente non può "riapparire" se un antenato ha `display:none`,
   quindi l'intero layout di stampa spariva insieme al resto.
   **Fix**: `PrintableResume` ora è renderizzato come fratello di `<Desktop />`
   in `App.tsx`, non più al suo interno; il CSS di stampa nasconde solo
   `.desktop`, lasciando intatto `#root`.
2. **Bundle gonfiato (+~650 KB).** `Skills/index.tsx` faceva
   `import * as Icons from "lucide-react"` per un lookup dinamico delle
   icone: questo impedisce il tree-shaking e porta l'intera libreria di
   icone nel bundle finale (862 KB totali invece di ~240 KB).
   **Fix**: sostituito con una mappa esplicita delle sole 6 icone usate.
3. **Build rotta: icone brand mancanti.** `Github` e `Linkedin` non sono
   più esportate da `lucide-react` (rimosse per motivi di licenza nelle
   versioni recenti). Erano usate in `Contact`, `Projects` e `Resume`.
   **Fix**: introdotto/riutilizzato `components/SocialIcons.tsx` con SVG
   inline (stessi path del vecchio sito) per queste due icone specifiche.
4. **Build rotta: import type-only mancanti.** Con `verbatimModuleSyntax`
   attivo (impostazione di questo template Vite), i tipi vanno importati
   con `import type`. Toccava `SVGProps` in `SocialIcons.tsx` e
   `TranslationKey` in `Skills/index.tsx`.
5. **Build rotta: variabile inutilizzata.** `language` non usata in
   `Resume/index.tsx` (con `noUnusedLocals` attivo, è un errore, non un warning).
6. **Lint: 4 warning oxlint.**
   - `docs/old_files/*.js` (l'archivio del vecchio sito vanilla) veniva
     lintato insieme al codice nuovo → aggiunto a `ignorePatterns` in
     `.oxlintrc.json`, non ha senso applicare regole React/TS a file
     JS storici tenuti solo per riferimento.
   - `LanguageContext.tsx` esportava sia il Provider (componente) sia
     `translations` (dati) sia `useLanguage` (hook) dallo stesso file,
     rompendo il fast refresh di Vite → stessa soluzione già adottata per
     `WindowManagerContext` in Fase 2: dati in `translations.ts`, hook in
     `useLanguage.ts`, il file `LanguageContext.tsx` esporta solo il
     Provider (+ il context, ri-esportato con `export { LanguageContext }`
     invece di `export const`, unico modo che oxlint non segnala).

Dopo i fix: `tsc -b` pulito, `npm run build` pulito (bundle ~238 KB / 73 KB
gzip), `npm run lint` (oxlint) 0 warning e 0 errori.

### Cose notate ma NON corrette (non bloccanti, da valutare)

- I titoli delle finestre/icone (`config/windows.ts`: "Resume", "Projects", ...)
  e l'etichetta del toggle tema nel Dock ("Tema chiaro/scuro") restano in
  italiano/inglese fissi, non passano da `t()`. Scelta difendibile (nomi
  "di sistema" tipo "Finder" restano spesso non tradotti) ma se si vuole
  coerenza totale con l'i18n andrebbero collegati a `translations.ts`.
- `projects.json` include ora un secondo progetto auto-referenziale
  ("Portfolio v2 — Desktop", questo stesso sito). Scelta legittima
  dell'utente, lasciata invariata.

### Prossimo passo

Con la Fase 4 completa, resta la **Fase 5**: persistenza (tema, lingua già
fatta, finestre aperte, finestra attiva/focus) — probabilmente da unificare
in un unico meccanismo di salvataggio su `localStorage`.

---

## 2026-07-11 — Fase 3: Configurazione

Riferimento: `Curriculum_Portfolio_v2_Roadmap.md`, sezione "Fase 3 - Configurazione".

> Tutte le finestre vengono registrate in una configurazione:
> `{ id, title, icon, component, defaultPosition }`

`config/windows.ts` esisteva già dalla Fase 1 (creato in anticipo per
alimentare le icone) con `id, title, icon, defaultPosition`. Manca solo
`component`: il collegamento tra ogni voce di config e il componente React
reale da renderizzare dentro la finestra. Questo è l'unico pezzo mancante
della Fase 3, quindi il task è più piccolo delle Fasi 1/2 — un solo step.

---

### Step 1 — Campo `component` + placeholder per finestra

**Stato: ✅ completato**

- `WindowConfig` ora include `component: ComponentType`
- Creati 6 placeholder tipizzati in `src/windows/<Nome>/index.tsx`
  (`ResumeWindow`, `ProjectsWindow`, `ExperienceWindow`, `SkillsWindow`,
  `ContactWindow`, `DeveloperNotesWindow`) — ognuno mostra solo il proprio
  nome, in attesa del contenuto reale della Fase 4
- `windowsConfig` in `config/windows.ts` collega ogni voce al proprio componente
- `WindowManager.tsx` ora fa `const Content = config.component` e
  renderizza `<Content />` genericamente, al posto del `PlaceholderContent`
  hardcoded della Fase 2 — questo era l'obiettivo esplicito della Fase 3
- `tsc --noEmit`: OK · `npm run build`: OK · `oxlint`: 0 warning, 0 errori

---

### Decisioni prese durante l'implementazione

- **Un file `index.tsx` per cartella finestra** (`src/windows/Resume/index.tsx`)
  invece di componenti annidati altrove: rispetta esattamente la "Struttura
  suggerita" della roadmap (`windows/ Resume/ Projects/ ...`) e rende
  l'import pulito (`from "../windows/Resume"`).
- **Placeholder ancora minimi**: la Fase 3 riguarda solo il collegamento
  struttura/config, non il contenuto. I placeholder sono stati mantenuti
  semplici apposta, per non anticipare lavoro della Fase 4 e restare
  facilmente distinguibili in fase di test manuale.
- **Nessun cambiamento alla shape dello stato del Window Manager** (Fase 2):
  la Fase 3 tocca solo la config e il punto di rendering del contenuto,
  non il reducer né il comportamento di drag/focus/minimizza.

### Prossimo passo

Fase 4: sostituire il contenuto dei 6 placeholder con i componenti reali,
popolando `src/data/resume.json`, `projects.json`, `skills.json` con i dati
migrati dal vecchio `Index.html`.

---

## 2026-07-11 — Fase 2: Window Manager

Riferimento: `Curriculum_Portfolio_v2_Roadmap.md`, sezione "Fase 2 - Window Manager".

Obiettivo dichiarato dalla roadmap: componente `Window` generico con
apertura/chiusura, minimizzazione, focus, animazioni leggere.
**Niente ridimensionamento in questa versione.**

Task spezzato in step indipendenti, ognuno buildato e verificato
(`tsc --noEmit`, `npm run build`, `oxlint`) prima di passare al successivo.

---

### Step 1 — Stato del Window Manager (context + reducer)

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

### Step 2 — Componente `Window` (Fase 2 pilastro principale)

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

### Step 3 — `WindowManager` (renderer delle finestre aperte)

**Stato: ✅ completato**

File: `src/desktop/WindowManager.tsx`.

- Filtra `windows` per escludere quelle minimizzate, mappa il resto su `<Window>`
- Contenuto placeholder testuale per confermare visivamente il collegamento
  config → istanza finestra, in attesa dei componenti reali di Fase 4
- `tsc --noEmit`: OK

- Legge lo stato dal context, mappa le finestre aperte (non minimizzate) su `<Window>`
- Contenuto placeholder per ciascuna finestra (il contenuto reale arriva in Fase 4)

### Step 4 — Collegamento Desktop / Icone / Dock

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

### Step 5 — Verifica finale

**Stato: ✅ completato**

- `tsc --noEmit`: OK
- `npm run build`: OK (bundle ~202 KB / 64 KB gzip)
- `npm run lint` (oxlint): 0 warning, 0 errori
- `useWindowManager` spostato in file dedicato `useWindowManager.ts` per
  eliminare il warning `react(only-export-components)` di oxlint — file che
  esportano solo componenti fanno funzionare meglio il fast refresh di Vite
- `README.md` e zip aggiornati

---

### Decisioni prese durante l'implementazione

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

### Prossimi passi (fuori da questa Fase)

- Fase 3: la config esiste già (`config/windows.ts`), da valutare se serve
  altro oltre a quanto fatto qui prima di passare alla Fase 4
- Fase 4: sostituire `PlaceholderContent` in `WindowManager.tsx` con i
  componenti reali per Resume, Projects, Experience, Skills, Contact,
  Developer Notes, popolando `src/data/*.json` con i contenuti del vecchio CV
- Fase 5: persistenza (tema, finestre aperte, finestra attiva) via
  localStorage o simile, gestione stato eventualmente con Zustand se il
  Context inizia a diventare scomodo

---

## 2026-07-11 — Fase 1: layout Desktop, dock, icone e tema

_Voce ricostruita dalla sezione «Stato — Fase 1» del vecchio README: questa Fase non aveva un log a sé._

- [x] Layout Desktop (`src/desktop/Desktop.tsx`)
- [x] Wallpaper minimale — griglia a puntini + readout coordinate mouse
      in monospace (`src/desktop/Wallpaper.tsx`)
- [x] Dock inferiore con icone e tooltip (`src/desktop/Dock.tsx`)
- [x] Sistema di icone desktop, selezionabili con click singolo
      (`src/desktop/DesktopIcon.tsx`)
- [x] Tema light/dark via CSS variables, toggle nel dock
      (persistenza rimandata alla Fase 5, come da roadmap)

#### Design token

Palette e font sono centralizzati in `src/styles/tokens.css`:

- **Font sistema/chrome**: JetBrains Mono (dock, orologio, coordinate, titoli finestra)
- **Font contenuto**: Inter (per le finestre con testo, dalla Fase 4)
- **Accento**: teal segnale (`--accent`) — dark `#4fd1c5`, light `#0f9c8f`
- Nessuna dipendenza da UI kit: solo CSS puro + `lucide-react` per le icone
