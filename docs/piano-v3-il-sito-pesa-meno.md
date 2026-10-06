# Curriculum — Piano v3: «il sito pesa meno, e non torna a pesare»

> Punto d'ingresso del progetto: [STATO.md](STATO.md). **Da dove viene questo piano:** il punto 1
> di «cosa manca» in `STATO.md`, chiesto da Francesco il 6 ottobre 2026. Scritto il 2026-10-06.
>
> **Occupa le Fasi 27–28**, scritte in [registro.md](registro.md) insieme a questo piano.
> **Chiuso il 2026-10-06**: entrambe le Fasi sono ✅, in un'unica PR.
>
> **Ogni misura e ogni riferimento qui sotto è stato letto nel codice**, non dedotto.

## Contesto

1. **Chi apre il sito dal telefono scarica 569 KB di JavaScript (163 KB gzip) prima di vedere la
   Home.** Misurato con la source map della build: 210 KB servono solo a leggere il frontmatter
   dei `.md` (`esprima` 133 KB, `js-yaml` 41, il polyfill `buffer` 24, `gray-matter` e dipendenze
   una decina), lavoro che si può fare una volta sola in build.
2. **Nessuno se ne accorgerebbe se tornasse a crescere.** Vite avvisa sopra i 500 KB ma non
   fallisce, e l'avviso c'era da mesi.

## La cosa che il codice sapeva già (decisione 0)

**Decisione.** I `.md` arrivano già nel bundle in build (`import.meta.glob` con `eager: true` in
`src/lib/knowledgeBase.ts`): basta spostare in build anche la separazione fra frontmatter e corpo.
Nessun componente cambia, perché i getter restituiscono gli stessi `KnowledgeDoc`.

**Perché.** `src/lib/knowledgeBase.ts` importava i file `?raw` e li passava a `gray-matter` nel
browser; `src/polyfills.ts` esisteva solo per questo (trappola 5 di `conoscenza/trappole.md`, che
questo piano rende obsoleta).

**Tocca la knowledge base?** No. Nessun `.md` cambia o si sposta; `netlify.toml` resta com'è.

## Decisioni

### 1. Il frontmatter si legge in un plugin Vite, file per file

**Decisione.** `vite/kb-frontmatter.ts` risolve gli import `*.md?kb` in un modulo che esporta
`{ data, content }` come JSON. `knowledgeBase.ts` usa `query: "?kb"` al posto di `?raw`.

**Perché.** Ogni `.md` resta un modulo a sé: in `npm run dev` modificare un file della KB aggiorna
la pagina come prima, senza codice di watch scritto a mano.

**Scartato.** Un unico modulo virtuale con tutta la KB: andava invalidato a mano a ogni modifica.

### 2. Il frontmatter deve sopravvivere a JSON

**Decisione.** Un test controlla che ogni frontmatter, passato da `JSON.stringify` e ritorno,
resti identico.

**Perché.** Una data YAML senza virgolette (`date: 2023-11-01`) oggi diventerebbe un `Date` nel
browser; via JSON diventa una stringa ISO, in silenzio. Oggi tutte le date sono tra virgolette.

### 3. Un tetto al JavaScript, controllato in CI

**Decisione.** `npm run size` (`scripts/check-bundle.mjs`) misura i `.js` di `dist/assets` con
gzip e fallisce sopra **120 KB**. Gira in CI dopo la build.

**Perché.** Dopo la Fase 27 il bundle è 103 KB gzip: il tetto lascia spazio a contenuti e piccole
funzioni, e ferma una libreria pesante aggiunta per sbaglio. Si alza solo di proposito, scrivendo
il perché nel devlog.

**Scartato.** Metterlo dentro `npm run build`: farebbe fallire anche il deploy di Netlify per una
modifica di soli contenuti.

## Le Fasi

| Fase | Cosa                                   | Fatto quando…                                                     |
| ---- | -------------------------------------- | ----------------------------------------------------------------- |
| 27   | Frontmatter letto in build             | la Home scarica meno di 110 KB gzip e ogni tab mostra gli stessi contenuti di prima, da telefono |
| 28   | Tetto al JavaScript in CI              | una PR che supera 120 KB gzip ha la CI rossa                     |

## Criterio di «fatto»

- [x] Il JavaScript passa da 569 KB (163 gzip) a 336 KB (107 gzip).
- [x] Home, Resume, Projects e Notes mostrano gli stessi testi, in italiano e in inglese, a 390 px.
- [x] In `npm run dev` una modifica a un `.md` della KB arriva alla pagina senza riavviare.

## Fuori da questo piano

- **Caricare i tab in modo pigro.** Il codice di Resume, Projects e Notes pesa circa 35 KB
  (meno di 10 gzip): il guadagno non vale l'attesa al cambio di tab. Il CV stampabile poi è
  sempre montato. Da riconsiderare se i tab crescono.
- **`marked` e `dompurify`** (68 KB) servono già alla Home, per le risposte dell'Assistant.
- **`react-dom`** (175 KB) è il resto del bundle e non si tocca.
