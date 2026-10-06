# Curriculum — Piano v4: «la conversazione con l'Assistant va avanti da sola»

> Punto d'ingresso del progetto: [STATO.md](STATO.md). **Da dove viene questo piano:** le idee su
> contenuti e Assistant del 6 ottobre 2026, scelte da Francesco lo stesso giorno. Scritto il
> 2026-10-06.
>
> **Occupa le Fasi 29–32**, scritte in [registro.md](registro.md) insieme a questo piano.
> **Chiuso il 2026-10-06**: tutte e quattro le Fasi sono ✅, in un'unica PR.
>
> **Ogni misura e ogni riferimento qui sotto è stato letto nel codice**, non dedotto.

## Contesto

1. **Dopo la prima risposta il visitatore non sa cosa chiedere.** Le domande di avvio spariscono
   col primo messaggio. La conversazione si ferma lì, e con lei ciò che il visitatore scopre.
2. **La risposta arriva tutta insieme dopo diversi secondi.** I modelli `:free` sono lenti. Lo
   «scrivere» che si vede oggi è un'animazione che parte solo a risposta già arrivata
   (`startReveal` in `src/windows/Assistant/index.tsx`).
3. **Chi è interessato non ha un passo successivo.** Email, LinkedIn e CV in PDF ci sono, ma non
   nella chat, che è dove il visitatore sta leggendo di Francesco.

## La cosa che il codice sapeva già (decisione 0)

**Decisione.** Il formato «risposta + blocco dopo un marcatore» esiste già per le fonti
(`---SOURCES---`): le domande suggerite usano lo stesso meccanismo, con un secondo blocco. I
contatti si leggono già da `config/contacts.md` e `config/socials.md`, e il CV in PDF è già
`window.print()` (`Resume/index.tsx`).

**Perché.** Un formato nuovo, per esempio JSON in uscita dal modello, sarebbe fragile con i
modelli `:free`: il marcatore su una riga a sé regge da Fase 12.

**Tocca la knowledge base?** Sì:

- `skills.md` (lang-neutral) aggiunge TypeScript, Next.js e Firebase, che i progetti già citano;
- `projects/portfolio-v2.it.md` ed `.en.md` aggiornano la frase sul polyfill `Buffer`, rimosso
  dal piano v3.

Nessun file si sposta.

## Decisioni

### 1. Domande suggerite dal modello, nello stesso blocco finale

**Decisione.** Il prompt chiede fino a tre domande dopo `---FOLLOWUPS---`, prima delle fonti. La
function le pulisce (`netlify/functions/lib/answer.ts`) e la UI le mostra come chip sotto l'ultima
risposta.

**Perché.** Le domande dipendono dalla risposta appena data e dalla knowledge base: solo il
modello le sa scegliere. Non costano una richiesta in più.

**Scartato.** Domande fisse per argomento: dopo due giri si ripeterebbero.

### 2. Streaming vero, con righe NDJSON

**Decisione.** La function chiede a OpenRouter `stream: true` e manda al browser una riga JSON
per pezzo di testo (`{ "delta": … }`) e una finale (`{ "done": true, answer, sources, followups,
stats }`). La function aspetta il primo pezzo mostrabile prima di rispondere, così gli errori
iniziali restano codici HTTP come prima.

**Perché.** I marcatori e l'etichetta di scope non devono mai comparire a schermo: lo garantisce
`visibleAnswer`, che trattiene ciò che potrebbe ancora diventarlo e cresce solo per aggiunta. Il
browser resta semplice.

**Scartato.** Inoltrare al browser l'SSE di OpenRouter così com'è: il browser dovrebbe
nascondere da sé i marcatori.

### 3. Invito al contatto dopo due risposte

**Decisione.** Dalla seconda risposta compare sotto la conversazione un riquadro con Email,
LinkedIn e «Scarica PDF». Si chiude con una X e non torna fino alla visita successiva.

**Perché.** Chi ha fatto due domande è interessato, e non deve uscire dalla chat per scrivere.

### 4. La domanda di avvio sul progetto viene dalla knowledge base

**Decisione.** `conversationStarters` in `translations.ts` non nomina più progetti. L'Assistant
aggiunge una domanda sul primo progetto per `order`, con il testo `assistantProjectStarter`.

**Perché.** `CLAUDE.md`: niente contenuto nel codice. Prima un progetto era scritto a mano in
`translations.ts`.

### Escluso da Francesco (6 ottobre 2026)

- Aumentare la quota di OpenRouter.
- Salvare qualsiasi cosa dalle conversazioni dei visitatori, per evitare problemi legali.
- «Incolla un annuncio di lavoro».

## Le Fasi

| Fase | Cosa                                      | Fatto quando…                                                         |
| ---- | ----------------------------------------- | --------------------------------------------------------------------- |
| 29   | Domande suggerite dopo ogni risposta      | sotto l'ultima risposta compaiono fino a tre domande, e un tocco le invia |
| 30   | Risposta in streaming                     | il testo compare mentre arriva, senza marcatori né etichette          |
| 31   | Invito al contatto                        | dopo la seconda risposta compaiono Email, LinkedIn e PDF, chiudibili  |
| 32   | Avvio dalla KB e contenuti coerenti       | la domanda di avvio sul progetto viene dalla KB; le competenze citano TypeScript, Next.js e Firebase |

## Criterio di «fatto»

- [x] A 390 px, in tema chiaro e scuro, la risposta compare a pezzi, seguita dalle domande
  suggerite; dopo la seconda risposta compare l'invito al contatto.
- [x] Nessun `---` né `IN_SCOPE` compare mai nel testo in streaming (test di `answer.ts`, con
  pezzi di ogni grandezza).
- [x] Sull'anteprima Netlify, con la chiave vera, la function risponde in streaming: 49 righe
  NDJSON in 1,3 s dopo circa 4 s di attesa del modello, con tre domande suggerite e due fonti.

## Fuori da questo piano

- **I contenuti che servono a Francesco**: la pagina per chi recluta, i casi concreti di Xtel, un
  terzo progetto. Le bozze stanno fuori dal repo finché lui non le riempie.
- **Fermare una risposta a metà** con un bottone «stop»: oggi la si interrompe solo con il reset.
