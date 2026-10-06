# Curriculum — Piano v2: «ogni modifica si controlla da sola»

> Punto d'ingresso del progetto: [STATO.md](STATO.md). **Da dove viene questo piano:** il punto 2
> di «cosa manca» in `STATO.md`, chiesto da Francesco il 6 ottobre 2026. Scritto il 2026-10-06.
>
> **Occupa le Fasi 24–26**, scritte in [registro.md](registro.md) insieme a questo piano.
> **Chiuso il 2026-10-06**: tutte e tre le Fasi sono ✅, in un'unica PR su richiesta di Francesco.
>
> **Ogni misura e ogni riferimento qui sotto è stato letto nel codice**, non dedotto.

## Contesto

1. **Le regole della knowledge base le controlla solo la disciplina.** Ogni `.it.md` deve avere il
   suo `.en.md`, con lo stesso `type` e i campi che i componenti si aspettano. Se una coppia si
   rompe, lint e build passano lo stesso e il sito mostra una sezione vuota in una lingua sola.
   È già successo con le competenze (PR #6).
2. **L'AI Assistant ha regole che nessuno verifica.** I tetti della cronologia, il fallback fra tre
   modelli, gli errori che non devono far trapelare i dettagli di OpenRouter: tutto scritto nelle
   Fasi 19–20, tutto provato una volta a mano. Una modifica futura può romperli in silenzio, e la
   quota gratuita è proprio ciò che quei tetti proteggono.

## La cosa che il codice sapeva già (decisione 0)

**Decisione.** Non serve toccare il codice dell'applicazione per testarlo.

**Perché.**

- `netlify/functions/assistant.ts` esporta un handler `(req: Request) => Promise<Response>`: si
  prova dalla porta d'ingresso, con una `Request` vera e `fetch` sostituita, senza esportare le
  funzioni interne (`isValidHistory`, `parseAnswer`).
- `netlify/functions/lib/kb.ts` legge la KB con `fs` da `process.cwd()`: un test lanciato dalla
  radice del repo legge i file veri, senza mock.
- `vite/kb-head.ts` esporta già `describe`, `renderHead` e `renderStatic` (piano v1).
- Vitest 5 dichiara compatibilità con Vite `^8.0.0`, quello del repo: riusa la stessa
  configurazione e non porta un secondo bundler.

**Tocca la knowledge base?** Solo in lettura. Se un test trova una coppia rotta, si sistema il
contenuto in entrambe le lingue, non il test.

## Decisioni

### 1. Vitest, e `npm test` in CI dopo il lint

**Decisione.** `vitest` come devDependency, `npm test` = `vitest run`, un passo nuovo in
`.github/workflows/ci.yml` fra lint e build. Test in `tests/`, ambiente Node: nessun test di
componenti React in questo piano.

**Scartato.** Test dei componenti con jsdom: costano molto più setup, e i difetti visti finora
stavano nei dati e nella function, non nei componenti.

### 2. Test della KB sui file veri

**Decisione.** Un test percorre `knowledge-base/**` e verifica: ogni `.it.md` ha il suo `.en.md` e
viceversa; `lang` nel frontmatter coincide con il suffisso del nome; `type` è lo stesso nelle due
lingue; i campi obbligatori per tipo ci sono (quelli che i getter di `src/lib/knowledgeBase.ts`
usano senza controllare); i file lang-neutral (`skills.md`, `config/*.md`) non hanno `lang`.

### 3. Test della function con OpenRouter finto

**Decisione.** `fetch` sostituita da una finta che registra la richiesta e restituisce la risposta
scelta dal test. Si verifica: 405, 400 su JSON e cronologia non validi, 500 senza chiave, l'ordine
dei modelli (`OPENROUTER_MODEL` primo, niente doppioni, al massimo tre), la KB filtrata per
lingua, i 429 e gli errori di OpenRouter tradotti senza dettagli, le fonti filtrate sui percorsi
veri.

## Le Fasi

| Fase | Cosa                                               | Fatto quando…                                                    |
| ---- | -------------------------------------------------- | ---------------------------------------------------------------- |
| 24   | Vitest, `npm test` in CI, test della knowledge base | Togliere un `.en.md` fa fallire la CI della PR                  |
| 25   | Test dell'AI Assistant con OpenRouter finto        | Alzare un tetto della cronologia fa fallire un test              |
| 26   | Test di `kb-head` e degli helper Markdown          | Rompere l'escape dell'HTML in `kb-head` fa fallire un test       |

## Criterio di «fatto»

- [ ] Una PR che rompe una coppia it/en diventa rossa in CI, con un messaggio che dice quale file
      manca.
- [ ] `npm test` gira in pochi secondi in locale, senza chiave OpenRouter e senza rete.
- [ ] Il sito, a 390 px e su desktop, è identico a prima: questo piano non cambia la UI.

## Fuori da questo piano

- Test dei componenti React e test end-to-end con il browser.
- La copertura come numero da raggiungere.
- Il peso del bundle: resta il punto 1 di «cosa manca».
