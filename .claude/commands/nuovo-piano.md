---
description: Apre un nuovo piano di lavoro, allocando le Fasi nel registro
---

Apri un piano nuovo per il sito. L'argomento, se c'è, è il tema: $ARGUMENTS

Segui quest'ordine, senza saltare passaggi.

## 1. Leggi prima di proporre

- `docs/registro.md`: il prossimo numero libero
- `docs/STATO.md`: dove siamo, e soprattutto **cosa manca**
- `CLAUDE.md`: le regole di numerazione

Se l'utente non ha detto di cosa tratta il piano, proponi due o tre candidati presi da «cosa manca»
di `STATO.md`, e chiedi. Non inventare un tema.

## 2. Compila la decisione 0 leggendo il codice

Prima di scrivere una sola decisione, leggi il codice e i file della knowledge base che il piano
toccherebbe e scrivi:

- cosa **esiste già** e non va riscritto, con file e righe;
- quale **commento o documento dice il falso** e va corretto dal piano;
- se il piano tocca `knowledge-base/**`, quali coppie `.it.md`/`.en.md`.

Se non hai letto il codice, non scrivere il piano.

## 3. Scrivi il piano

```bash
cp docs/piano-TEMPLATE.md docs/piano-v<N>-<slug>.md
```

`<N>` è il numero del piano: uno in più dell'ultimo `docs/piano-v*.md` (il primo è `v1`). Il
titolo dice **cosa cambia per chi visita il sito**. Da uno a tre problemi nel contesto: se sono di
più, sono due piani. Ogni criterio di «fatto» è qualcosa che si vede sul sito, anche da telefono.

## 4. Alloca i numeri nel registro, adesso

Aggiungi le righe in `docs/registro.md` con stato ⬜ e la colonna `Piano` compilata, e **aggiorna
il «prossimo numero libero»**. Si fa ora, non a piano finito: è l'atto che assegna i numeri.

## 5. Chiudi

Mostra all'utente il piano e le righe del registro. Commit
`docs(piano): scrive il piano v<N>, <frase in minuscolo>` su un branch, **chiedendo prima di
committare**, e PR verso `main`.
