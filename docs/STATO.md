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

**Ventisei Fasi chiuse, dalla 1 alla 26**, elencate in [registro.md](registro.md). Le Fasi 19 e 20
hanno rimesso in piedi l'AI Assistant (fallback su più modelli `:free` di OpenRouter, risposte non
più troncate, quota protetta, errori tradotti); le 21–23 (piano v1) danno al link un'anteprima e
al sito un profilo leggibile senza JavaScript; le 24–26 (piano v2) portano i primi test.

**Controlli**: `npm run lint`, `npm test` (156 test con Vitest) e `npm run build` puliti, in CI su
ogni PR.

**Nessun piano aperto.** Chiusi il v1 (Fasi 21–23, l'anteprima del link) e il
[v2](piano-v2-ogni-modifica-si-controlla-da-sola.md) (Fasi 24–26, i test). Il prossimo numero
libero è il **27**.

## Cosa manca

In ordine di priorità, dall'analisi del 6 ottobre 2026. Ognuna è candidata a un piano.

1. **Il JavaScript è un unico file da 569 KB (163 KB gzip).** Dentro ci sono `gray-matter` e il
   polyfill `Buffer`, che servono solo a leggere il frontmatter e si possono spostare nella
   build; i tab si possono caricare in modo pigro.
2. **Pochi contenuti.** Due progetti, di cui uno è il sito stesso, e due Developer Notes. Serve
   materiale di Francesco.
3. **Accessibilità e prestazioni da telefono mai misurate** (Lighthouse a larghezza mobile).
4. **Nessun dato su chi visita e cosa chiede all'Assistant.** Opzionale.

## Cosa è bloccato

Niente.
