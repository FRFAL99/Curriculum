# Fase 20 — Miglioramenti dell'AI Assistant — Log

Nasce da un'analisi dell'assistente in produzione (13 domande reali, tutti i
suggerimenti in it/en) dopo il fix della Fase 19. Punti scelti dall'utente:
tutti e sei.

## 1. Risposte troncate

I modelli :free di ripiego "ragionano" e il ragionamento conta nei token di
output: con `max_tokens: 1000` "Spiegami il progetto Antichità Fallavena"
si fermava a metà, senza blocco fonti. Ora `max_tokens: 2500` e
`reasoning: { effort: "low", exclude: true }` (ignorato dai modelli che non
ragionano); se `finish_reason` è `length` la function lo scrive nei log.
Effetto collaterale: risposte in ~3 s invece di 6-9 s.

## 2. Protezione della quota gratuita

La chiave è sul piano gratuito di OpenRouter (50 richieste/giorno sui :free)
e chiunque poteva esaurirla, anche gonfiando la cronologia inviata dal browser.

- Rate limit Netlify per visitatore (10 richieste/60 s per IP) nel `config`
  esportato da `assistant.ts`. I limiti per le function non si possono
  dichiarare in `netlify.toml`, quindi il percorso `/api/assistant` passa
  dal `[[redirects]]` al `config.path` della function.
- Cronologia: ogni messaggio ≤ 4000 caratteri, totale ≤ 12000, altrimenti 400.

Per salire a 1000 richieste/giorno resta l'opzione già documentata in
`.env.example` (credito una tantum su OpenRouter).

## 3. Errori per i visitatori

La function non espone più dettagli di OpenRouter (`upstream_error`,
`upstream_unreachable`; il dettaglio resta nei log). La UI mostra
`assistantRateLimited` per ogni 429 (anche quello di Netlify, che non ha
corpo JSON) e `assistantUnavailable` per tutto il resto, tradotti. In
sviluppo (`import.meta.env.DEV`) il messaggio aggiunge stato HTTP e il
promemoria `npm run dev:full`.

## 4-5. Voce e suggerimenti

Il prompt chiedeva di parlare "per conto di Francesco" ma i suggerimenti gli
davano del tu, quindi le risposte alternavano "Io ho…" e "Francesco ha…".
Ora l'assistente parla sempre di Francesco in terza persona, e i
suggerimenti sono riscritti di conseguenza. Il prompt vieta di aggiungere
fatti o preferenze non presenti nella KB: "Di quale progetto sei più
orgoglioso?" (in inglese rifiutava, in italiano inventava) è diventato
"Quali progetti ha realizzato Francesco?".

## 6. Fonti, intestazione, HTML

- Le fonti mostrano il titolo del documento (`getDocTitle`, spostato da
  `DocumentDetail.tsx` a `src/lib/knowledgeBase.ts`), il percorso resta nel
  tooltip.
- "Ask about Francesco" è ora l'etichetta `assistantTitle` (it: "Chiedi di
  Francesco").
- Il Markdown dell'AI passa da DOMPurify prima di `dangerouslySetInnerHTML`.

## Verifica

- Function in locale con chiave reale: cronologia gonfiata → 400; risposte
  complete con fonti per Antichità Fallavena, progetti (it/en), esperienza
  (en); "progetto preferito" → dice che la KB non lo specifica.
- UI con Playwright a 390 px (risposta mockata): titoli delle fonti, errore
  tradotto, `<img onerror>` neutralizzato.
- `npm run lint` e `npm run build` passano.
