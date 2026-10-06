# Stato del progetto: punto di partenza

> Aggiornato: **2026-10-06**

Dove siamo oggi, cosa manca e cosa è bloccato. Niente cronaca: quella sta in
[devlog.md](devlog.md). Che numero ha una Fase sta in [registro.md](registro.md), come funziona il
sito in [conoscenza/architettura.md](conoscenza/architettura.md).

**La regola che tiene corto questo documento: quando una riga di «cosa manca» diventa fatta, si
cancella.** Non si sposta fra le cose fatte e non si annota «risolto il…»: la cronaca è già nel
devlog e il registro tiene lo stato delle Fasi. STATO resta sotto le 100 righe.

## Dove siamo

**Il sito è online su Netlify** come landing page a quattro tab (Home con AI Assistant, Resume,
Projects, Notes), in italiano e inglese, dalla Fase 18 (19 luglio 2026).

**Trentadue Fasi chiuse, dalla 1 alla 32**, elencate in [registro.md](registro.md). Le Fasi 19 e 20
hanno rimesso in piedi l'AI Assistant (fallback su più modelli `:free` di OpenRouter, risposte non
più troncate, quota protetta, errori tradotti); le 21–23 (piano v1) danno al link un'anteprima e
al sito un profilo leggibile senza JavaScript; le 24–26 (piano v2) portano i primi test; le
27–28 (piano v3) tolgono 210 KB di JavaScript e mettono un tetto al peso; le 29–32 (piano v4)
fanno arrivare le risposte in streaming, con domande suggerite e un invito al contatto.

**Controlli**: `npm run lint`, `npm test` (190 test con Vitest), `npm run build` e `npm run size`
(JavaScript sotto 120 KB gzip, oggi 103) puliti, in CI su ogni PR.

**Nessun piano aperto.** Chiusi il v1 (Fasi 21–23, l'anteprima del link), il
[v2](piano-v2-ogni-modifica-si-controlla-da-sola.md) (Fasi 24–26, i test) e il
[v3](piano-v3-il-sito-pesa-meno.md) (Fasi 27–28, il peso) e il
[v4](piano-v4-la-conversazione-va-avanti.md) (Fasi 29–32, l'Assistant). Il prossimo numero libero
è il **33**.

## Cosa manca

In ordine di priorità, dall'analisi del 6 ottobre 2026. Ognuna è candidata a un piano.

1. **Pochi contenuti.** Due progetti, di cui uno è il sito stesso, e due Developer Notes; manca una
   pagina per chi recluta (ruolo cercato, sede, preavviso) e Xtel non ha casi concreti. Serve
   materiale di Francesco: le bozze sono in `/mnt/project-files/analisi/`.
2. **Accessibilità e prestazioni da telefono mai misurate** (Lighthouse a larghezza mobile).

## Cosa è bloccato

Niente.

## Cosa si è deciso di non fare

Scelto da Francesco il 6 ottobre 2026: niente aumento della quota OpenRouter, niente salvataggio
delle conversazioni dei visitatori (rischi legali), niente «incolla un annuncio di lavoro».
