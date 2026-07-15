# Fase 17 — Sezione Developer Notes a tab con articoli long-form — Log di avanzamento

Riferimento: documento di visione "Portfolio Architecture — Knowledge Base +
AI Assistant" (vedi `docs/VISION.md`). Nasce da feedback diretto dell'utente:
i Developer Notes erano quasi vuoti e la finestrella su desktop (Fase 4/9)
era troppo stretta per articoli lunghi. Obiettivo: spostarli in una sezione
editoriale a tutta pagina, raggiungibile da un tab in topbar, comoda da
leggere e facile da alimentare con nuovi articoli.

## Decisioni (confermate con l'utente in plan mode)

1. Stile **blog/editoriale** (titolo grande, sommario, tempo di lettura, tag),
   al posto dell'estetica LOG/terminal (logId, badge status).
2. Due tab accanto al nome: **Home** (scrivania attuale) + **Developer Notes**.
3. **Rimozione** dell'icona desktop e della voce nella sidebar Knowledge Base:
   gli articoli si raggiungono solo dal tab.

## Modifica

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

## Come aggiungere un articolo

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

## Verifica

- `tsc -b` + `vite build` e `oxlint` — puliti (0 warning).
- Chromium headless (one-shot screenshot, il debug port CDP è bloccato
  nell'ambiente) a 1440px:
  - Home: topbar con tab Home (attivo) / Developer Notes, colonne desktop
    invariate, sidebar KB **senza** più il branch Developer Notes.
  - `/#notes`: indice con titolo, intro e 2 card (data, tempo di lettura,
    sommario, tag); tab Developer Notes attivo, colonne desktop nascoste.
  - Lettore articolo: back button, titolo, meta, tag e markdown renderizzato
    (h2, paragrafi, grassetto, liste) nella colonna larga centrata.

## Stato della roadmap

Il piano principale di `docs/VISION.md` resta completato nelle Fasi 13-14; le
Fasi 15-17 sono iterazioni di rifinitura su feedback diretto. Restano aperte,
non decise: cross-reference tra documenti e "Open in AI". Possibile evoluzione
futura di questa fase: deep-link al singolo articolo (`#notes/<slug>`) e
categorizzazione/ricerca degli articoli.
