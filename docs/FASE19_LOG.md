# Fase 19 — Fix "OpenRouter error: 404" dell'AI Assistant — Log

## Problema

Dal 2026-10 l'assistente "Ask about Francesco" rispondeva sempre
`OpenRouter error: 404`. Riprodotto con una chiamata diretta:

```
{"error":{"message":"This model is unavailable for free. The paid version is
available now - use this slug instead: openai/gpt-oss-20b","code":404}}
```

`openai/gpt-oss-20b:free` (default di `assistant.ts` e di `.env.example`,
scelto in Fase 10) è stato tolto dal free tier di OpenRouter. Endpoint e
chiave erano corretti.

## Modifica

- `netlify/functions/assistant.ts`: invece di un solo `model`, la richiesta
  passa `models` (fallback nativo di OpenRouter, max 3 id). Ordine:
  `OPENROUTER_MODEL` se impostato, poi `nvidia/nemotron-3-super-120b-a12b:free`,
  `google/gemma-4-31b-it:free`, `google/gemma-4-26b-a4b-it:free`. Se un id
  sparisce (404) o è saturo upstream (429), OpenRouter passa al successivo.
- `stats.model` ora riporta il modello che ha davvero risposto
  (`data.model`), non quello richiesto.
- `.env.example`: `OPENROUTER_MODEL` diventa opzionale e commentato.

## Verifica

- Chiamata diretta con `models: [gpt-oss-20b:free, nemotron…, gemma…]`:
  200, risponde `nvidia/nemotron-3-super-120b-a12b:free`.
- Handler eseguito in locale con `tsx` e chiave reale, sia senza
  `OPENROUTER_MODEL` sia con `OPENROUTER_MODEL=openai/gpt-oss-20b:free`
  (caso in cui la env var su Netlify punti ancora al modello rimosso): 200
  in entrambi i casi.
- `openrouter/free` scartato: instradava su un modello di content safety.
- `npm run lint` e `npm run build` passano. Nessuna modifica UI.
