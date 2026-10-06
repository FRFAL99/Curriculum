---
description: Esegue il rituale di fine Fase, fermandosi al primo rosso
---

Chiudi la Fase in corso seguendo il rituale di `CLAUDE.md`. Note dell'utente, se ce ne sono:
$ARGUMENTS

**Fermati al primo rosso e dillo.** Non proseguire «tanto poi si sistema», e non riportare come
fatto ciò che non è passato.

## 1. Lint e build, nell'ordine della CI

```bash
npm run lint && npm run build
```

## 2. Il sito a larghezza telefono

Ogni modifica UI si guarda anche a ~390 px (Playwright con Chromium, oppure `npm run preview` e
gli strumenti del browser). Se la Fase tocca l'AI Assistant serve `npm run dev:full` con la chiave
in `.env`; senza chiave, dillo invece di saltare la prova in silenzio.

## 3. `docs/registro.md`

La riga della Fase passa a ✅ con la data. Se la Fase non era in tabella è un errore a monte: il
numero doveva essere allocato scrivendo il piano. Aggiungila e dillo all'utente.

## 4. `docs/devlog.md`

Voce nuova **in testa** (il file è in ordine cronologico inverso), sotto l'introduzione e
separata dalla successiva da `---`: `## AAAA-MM-GG — Fase N: <titolo>`, chiusa da `### Verifica`
con ciò che si è davvero provato (comandi, larghezze, domande all'Assistant).

Racconta anche **cosa si è scostato dal piano**: è la parte che serve rileggere.

## 5. `docs/STATO.md`, solo se serve

Si tocca **solo se cambia dove siamo**. Quando una riga di «cosa manca» è diventata fatta, **si
cancella**. STATO resta sotto le 100 righe.

## 6. Conoscenza e trappole

- Se la Fase ha cambiato come funziona il sito: `docs/conoscenza/architettura.md`.
- Se ha fatto perdere tempo per una ragione che si può riscoprire: una riga in
  `docs/conoscenza/trappole.md`.

## 7. Commit e PR

Commit in italiano, conventional (`feat(scope): …`, `fix(scope): …`), su un branch, e PR verso
`main`: **chiedendo prima all'utente**. Mai push diretto su `main`.
