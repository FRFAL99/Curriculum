# Trappole

Cose che hanno già fatto perdere tempo e che si possono riscoprire. Una trappola nuova va qui,
non solo nel devlog. La più frequente in alto.

1. **Pagina bianca dopo il deploy.** Netlify deve pubblicare `dist/`, non la radice del repo:
   l'`index.html` alla radice punta a `/src/main.tsx`, che solo Vite in sviluppo sa eseguire. Le
   impostazioni salvate a mano nella dashboard Netlify battono `netlify.toml`, quindi va
   controllato anche lì (Site settings → Build & deploy → Publish directory = `dist`). Nella
   console del browser l'errore è su `/src/main.tsx` o un «Unexpected token».
2. **L'Assistant funziona in locale e dà 500 in produzione.** I `.md` della KB sono letti con
   `fs` dalla function: senza `included_files = ["knowledge-base/**"]` in `netlify.toml` non
   entrano nel bundle. Spostare la cartella vuol dire aggiornare quella riga.
3. **I modelli `:free` di OpenRouter spariscono senza preavviso.** È successo con
   `gpt-oss-20b:free` (Fase 19, errore 404). Per questo `DEFAULT_MODELS` in
   `netlify/functions/assistant.ts` ne elenca più d'uno e `OPENROUTER_MODEL` può scavalcarli.
4. **I modelli che ragionano consumano i token di output.** Con `max_tokens` basso la risposta
   si tronca a metà e senza fonti (Fase 20). Oggi `max_tokens` è 2500 e il ragionamento è
   chiesto `low` ed escluso dalla risposta; un `finish_reason` = `length` finisce nei log.
5. **`Buffer is not defined` e schermo bianco.** `gray-matter` usa `Buffer`, che il browser non
   ha: il polyfill in `src/polyfills.ts` deve restare importato per primo in `src/main.tsx`
   (Fase 8).
6. **Il rate limit di una function non si dichiara in `netlify.toml`.** Va nel `config`
   esportato dalla function, insieme al `path`; per questo `/api/assistant` non è più un
   `[[redirects]]` (Fase 20).
7. **Cambiare nome, ruolo o luogo in `about.en.md` non aggiorna l'immagine di anteprima.**
   `public/og.png` è un file committato: va rigenerato con `npm run og` e committato insieme alla
   modifica della KB (piano v1, Fase 22). Titolo e description invece si aggiornano da soli.
8. **Un 429 di Netlify non ha corpo JSON.** La UI deve trattare ogni 429 come «troppe
   richieste» guardando lo stato HTTP, non il corpo (Fase 20).
