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

**Venti Fasi chiuse, dalla 1 alla 20**, elencate in [registro.md](registro.md). Le ultime due,
del 6 ottobre, hanno rimesso in piedi l'AI Assistant: fallback su più modelli `:free` di
OpenRouter, risposte non più troncate, quota protetta da un rate limit per visitatore, errori
tradotti.

**Controlli**: `npm run lint` e `npm run build` puliti, in CI su ogni PR. Test automatici: nessuno.

**Piano aperto**: [v1, il link condiviso si presenta da solo](piano-v1-il-link-condiviso-si-presenta.md),
Fasi 21–23: la 21 è chiusa (titolo, description e Open Graph generati dalla KB), restano
l'immagine di anteprima (22) e l'HTML statico (23).

## Cosa manca

In ordine di priorità, dall'analisi del 6 ottobre 2026. Ognuna è candidata a un piano.

1. **Il link condiviso non ha ancora un'immagine di anteprima** (piano v1, Fase 22), e l'HTML
   iniziale è un `<div>` vuoto: chi non esegue JavaScript non vede nessun contenuto (Fase 23).
2. **Il JavaScript è un unico file da 569 KB (163 KB gzip).** Dentro ci sono `gray-matter` e il
   polyfill `Buffer`, che servono solo a leggere il frontmatter e si possono spostare nella
   build; i tab si possono caricare in modo pigro.
3. **Nessun test.** La regola delle coppie `.it.md`/`.en.md` è affidata alla disciplina, e la
   logica della function (fallback dei modelli, limiti della cronologia) non ha test.
4. **Pochi contenuti.** Due progetti, di cui uno è il sito stesso, e due Developer Notes. Serve
   materiale di Francesco.
5. **Accessibilità e prestazioni da telefono mai misurate** (Lighthouse a larghezza mobile).
6. **Nessun dato su chi visita e cosa chiede all'Assistant.** Opzionale.

## Cosa è bloccato

Niente.
