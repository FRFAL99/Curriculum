# Fase 4 — Finestre — Log di avanzamento

Riferimento: `Curriculum_Portfolio_v2_Roadmap.md`, sezione "Fase 4 - Finestre".
Questa è la fase più corposa: si procede per step indipendenti, alcuni in
questa consegna, altri lasciati pianificati per la prossima.

Contenuto sorgente: vecchio `Index.html` del repo `Curriculum` (CV attuale).

---

# Fase 4 — Finestre — Log di avanzamento

Riferimento: `Curriculum_Portfolio_v2_Roadmap.md`, sezione "Fase 4 - Finestre".

Contenuto sorgente: vecchio `Index.html` del repo `Curriculum` (CV attuale).

**Nota sulla cronologia**: gli Step 1-3 sono stati implementati in sessione
con Claude. Gli Step 4-7 sono arrivati con un push esterno al repo
("refactor creazione desktop app") — commit valido nella sostanza, ma con
alcuni problemi di build/runtime non ancora sistemati. Questa sessione ha
verificato quel push, corretto i problemi trovati e aggiornato il log.

---

## Step 1 — Data layer: popolare `src/data/*.json`

**Stato: ✅ completato**

- `resume.json`, `skills.json`, `projects.json` popolati con i dati reali
  dal vecchio CV. `projects.json` ha poi acquisito una shape più ricca
  (`image`, `demoUrl`, `githubUrl`, `description: {it, en}`) per supportare
  i18n e le card con immagine — buona evoluzione rispetto all'impostazione
  iniziale, mantenuta.

## Step 2 — Finestra Skills

**Stato: ✅ completato**

- Competenze per categoria, senza barre percentuali. Icona per categoria
  con lookup dinamico da `skills.json` (`icon: "Terminal"` ecc.)

## Step 3 — Finestra Contact

**Stato: ✅ completato**

- Link rapidi + funzione "copia negli appunti" per email/telefono (aggiunta
  non pianificata ma naturale, mantenuta)

## Step 4 — Finestra Experience (timeline verticale)

**Stato: ✅ completato** (arrivato col push esterno)

- Timeline verticale con nodo "corrente" evidenziato per il ruolo in corso

## Step 5 — Finestra Projects (card)

**Stato: ✅ completato** (arrivato col push esterno)

- Card con immagine, stack, link GitHub/demo. Le immagini
  (`antichita_fallavena.jpg`, `portfolio_v2.jpg`) sono in `public/images/`

## Step 6 — Finestra Resume (CV completo + Download PDF)

**Stato: ✅ completato** (arrivato col push esterno)

- CV completo dentro la finestra, con tutte le sezioni del vecchio sito
- Download PDF implementato con `window.print()` + un layout `PrintableResume`
  dedicato e CSS `@media print` — **niente più html2canvas/jsPDF**: approccio
  più semplice e leggero del vecchio sito (nessuna libreria pesante da caricare)

## Step 7 — Finestra Developer Notes (extra)

**Stato: ✅ completato** (arrivato col push esterno)

- 2 casi di problem solving in stile "log di sistema" (LOG-041, LOG-028)

## Step 8 — Rifinitura stile / i18n

**Stato: ✅ completato** (arrivato col push esterno, non pianificato inizialmente)

- Sistema di traduzione IT/EN completo (`context/LanguageContext.tsx`),
  con auto-detect della lingua del browser e persistenza in `localStorage`
  — di fatto anticipa un pezzo della Fase 5 (persistenza), qui solo per la lingua

---

## Problemi trovati e corretti in questa sessione (revisione del push esterno)

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

## Cose notate ma NON corrette (non bloccanti, da valutare)

- I titoli delle finestre/icone (`config/windows.ts`: "Resume", "Projects", ...)
  e l'etichetta del toggle tema nel Dock ("Tema chiaro/scuro") restano in
  italiano/inglese fissi, non passano da `t()`. Scelta difendibile (nomi
  "di sistema" tipo "Finder" restano spesso non tradotti) ma se si vuole
  coerenza totale con l'i18n andrebbero collegati a `translations.ts`.
- `projects.json` include ora un secondo progetto auto-referenziale
  ("Portfolio v2 — Desktop", questo stesso sito). Scelta legittima
  dell'utente, lasciata invariata.

## Prossimo passo

Con la Fase 4 completa, resta la **Fase 5**: persistenza (tema, lingua già
fatta, finestre aperte, finestra attiva/focus) — probabilmente da unificare
in un unico meccanismo di salvataggio su `localStorage`.
