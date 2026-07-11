# Fase 10 — Netlify Function per OpenRouter — Log di avanzamento

Riferimento: documento di visione "Portfolio Architecture — Knowledge Base +
AI Assistant" (vedi `docs/VISION.md`, stesso citato in
`FASE8_LOG.md`/`FASE9_LOG.md`). Prima fase
di backend: nessuna UI ancora (quella è Fase 11), solo la function e il
suo contratto request/response.

Decisioni prese con l'utente prima di implementare:
- Modello **free tier** su OpenRouter (`mistralai/mistral-7b-instruct:free`
  di default, override via env var).
- **Una sola chiamata LLM**: lo stesso prompt classifica lo scope della
  domanda (IN_SCOPE/PARTIALLY_IN_SCOPE/OUT_OF_SCOPE, criterio dal
  documento di visione) e genera la risposta grounded. Niente vector
  DB/retrieval semantico: la Knowledge Base è piccola, viene passata per
  intero (filtrata per lingua) come contesto.

---

## Step 0 — Vincolo tecnico: due loader per due runtime

**Stato: ✅ completato**

`src/lib/knowledgeBase.ts` (Fase 8) usa `import.meta.glob`, un'API solo
Vite: non utilizzabile dentro una Netlify Function, che viene impacchettata
da esbuild in un runtime Node separato dal bundle del sito. Creato un
secondo loader minimale, `netlify/functions/lib/kb.ts`: stesso approccio
concettuale (cammina `knowledge-base/`, parse con `gray-matter`), ma con
`fs`/`path` invece di `import.meta.glob`. Qui `gray-matter` gira in Node
puro — nessun bisogno del polyfill `Buffer` della Fase 8, quello serviva
solo per il browser (vedi `FASE8_LOG.md`, Step 6).

I dati restano un'unica fonte di verità (i file `.md`); è la *logica di
lettura* ad essere necessariamente duplicata tra i due runtime.

## Step 1 — `netlify/functions/assistant.ts`

**Stato: ✅ completato**

Netlify Function v2 (`export default async (req: Request) => Response`,
coerente con `"type": "module"` già in `package.json`).

**Contratto**:
```
POST /api/assistant
Content-Type: application/json

{
  "message": "string, 1-2000 caratteri",
  "language": "it" | "en",
  "history"?: [{ "role": "user" | "assistant", "content": "string" }]  // max 10 voci
}
```

Risposte:
- `200 { "answer": string, "sources": string[] }`
- `400 { "error": string }` — input invalido
- `405` — metodo diverso da POST
- `500 { "error": string }` — manca `OPENROUTER_API_KEY` lato server
- `502 { "error": string }` — OpenRouter non raggiungibile o risposta
  inattesa

**Come funziona**:
1. Valida `message`/`language`/`history` (limiti difensivi: nessuna vera
   infra di rate-limiting in questa fase, vedi "Cosa resta").
2. Carica la KB con `loadKnowledgeBase()`, tiene solo i documenti
   lang-neutral o nella lingua richiesta (dimezza il contesto).
3. Costruisce un system prompt che include: identità dell'assistente,
   criterio di scope classification con l'esempio di rifiuto dal
   documento di visione, l'intera KB filtrata (ogni doc preceduto dal suo
   `path`), e l'istruzione di chiudere la risposta con un blocco fisso
   `---SOURCES---` seguito da un path per riga (vuoto se OUT_OF_SCOPE).
   Delimitatore a testo semplice invece di JSON strutturato: più robusto
   con un modello free-tier che non garantisce JSON mode.
4. Chiama `POST https://openrouter.ai/api/v1/chat/completions` (endpoint,
   headers e schema confermati via documentazione ufficiale OpenRouter)
   con `Authorization: Bearer ${OPENROUTER_API_KEY}`, `temperature: 0.3`,
   `max_tokens: 1000`, e il modello da `OPENROUTER_MODEL` (default
   `openai/gpt-oss-20b:free` — vedi Step 4 per come si è arrivati a
   questa scelta invece di `mistralai/mistral-7b-instruct:free`).
5. Separa risposta e fonti sul marker `---SOURCES---`; **valida ogni
   fonte dichiarata dal modello contro i path realmente esistenti nella
   KB filtrata** (`validPaths`), scartando eventuali path inventati —
   piccola rete di sicurezza per l'Explainability della Fase 12.

**Nota sui rate limit**: i modelli con suffisso `:free` su OpenRouter
hanno **50 richieste/giorno senza credito caricato** sull'account
(1000/giorno con almeno $10 di credito). Accettabile per un portfolio
personale a basso traffico; da tenere presente se il traffico crescesse
— cambiare modello è solo una env var (`OPENROUTER_MODEL`), nessuna
modifica al codice.

## Step 2 — Config Netlify

**Stato: ✅ completato**

`netlify.toml`:
```toml
[functions]
  directory = "netlify/functions"
  included_files = ["knowledge-base/**"]

[[redirects]]
  from = "/api/assistant"
  to = "/.netlify/functions/assistant"
  status = 200
```
`included_files` è necessario: i `.md` sono letti a runtime via `fs`, non
importati da codice, quindi l'esbuild bundler della function non li
includerebbe di default — 500 in produzione pur funzionando in locale
(gotcha comune con Netlify Functions + asset non-JS).

Il redirect dà un path pulito (`/api/assistant`) da usare in Fase 11
invece dell'URL interno `/.netlify/functions/assistant`.

## Step 3 — Tooling locale

**Stato: ✅ completato**

- `netlify-cli` aggiunto come devDependency; nuovo script `npm run
  dev:full` (= `netlify dev`) che fa da proxy a Vite **e** serve le
  function in locale, leggendo automaticamente un `.env` alla radice.
  `npm run dev` resta invariato (solo Vite, per iterare sul frontend
  senza serverless).
- `.env.example` (committato, nessun segreto) con `OPENROUTER_API_KEY=` e
  `OPENROUTER_MODEL=openai/gpt-oss-20b:free`. Per sviluppare:
  `cp .env.example .env` e incollare la propria chiave — `.env` è in
  `.gitignore` (aggiunto esplicitamente: prima c'era solo `*.local`, che
  non copre un file `.env` semplice). Aggiunta anche `.netlify` al
  `.gitignore` (stato locale creato da `netlify link`/`netlify dev`).
- `tsconfig.functions.json` (nuovo, stesso pattern di `tsconfig.node.json`
  ma con `moduleResolution: "bundler"` dato che le function vengono
  impacchettate da esbuild come il bundle Vite, non eseguite come ESM
  Node grezzo) referenziato da `tsconfig.json` radice: `npx tsc -b
  --noEmit` valida anche `netlify/functions/`.

## Step 4 — Verifica end-to-end (con la key reale dell'utente)

**Stato: ✅ completato**

`npx tsc -b --noEmit` e `npm run lint` puliti. Testato dal vivo con
`netlify dev` + `curl` contro `http://localhost:8888/api/assistant`,
usando la vera `OPENROUTER_API_KEY` dell'utente (mai vista né gestita da
Claude, solo verificata la presenza della variabile). Durante questo test
sono emersi e risolti tre problemi reali, non visibili da tsc/lint:

1. **Header HTTP con carattere non-ASCII**: `X-Title` conteneva una
   em-dash (`—`, U+2014). I valori degli header HTTP devono essere
   ByteString (0-255): il `fetch` nativo di Node lanciava
   `TypeError: Cannot convert argument to a ByteString...` **prima
   ancora di uscire in rete**, intercettato dal blocco `catch` generico e
   mascherato come "Failed to reach OpenRouter". Sostituito con un
   trattino ASCII semplice. Lezione: loggare l'errore reale nel `catch`
   (`console.error`, lato server, mai esposto al client) invece di un
   messaggio generico silenzioso — senza quel log il problema sarebbe
   stato molto più lento da isolare.
2. **Modello di default non più disponibile**: `mistralai/mistral-7b-instruct:free`
   rispondeva `404 No endpoints found` — modello ritirato/non più servito
   su OpenRouter (i modelli free cambiano nel tempo). Interrogato
   `GET /api/v1/models` per trovare modelli `:free` attualmente attivi;
   diversi (Llama 3.3 70B, Llama 3.2 3B, Qwen3, Hermes) rispondevano
   `429` per congestione temporanea del provider upstream (community
   free tier, non quota dell'account). `openai/gpt-oss-20b:free` è
   risultato stabile: aggiornato come nuovo default nel codice e in
   `.env.example`.
3. **Blocco `---SOURCES---` assente nella risposta**: la prima risposta
   corretta (grounded, in italiano, nessun errore) non includeva mai il
   marker delle fonti — e verso la fine degenerava in testo incoerente
   ("...CSSAscesi…"), sintomo di risposta troncata da un `max_tokens` di
   default troppo basso lato provider. Aggiunti `temperature: 0.3` e
   `max_tokens: 1000` espliciti nella chiamata, e spostata l'istruzione
   sul marker **dopo** il dump della Knowledge Base nel system prompt
   (i modelli seguono meglio le istruzioni vicine alla fine di un prompt
   lungo), rendendola esplicitamente "regola rigida, non opzionale" con
   un esempio concreto. Dopo la modifica, `sources` è risultato popolato
   correttamente con i path reali per entrambe le lingue.

Risultati finali dei quattro test manuali (dev server via `npm run
dev:full`, porta 8888):

| Test | Input | Risultato |
|---|---|---|
| IN_SCOPE (IT) | "Quali progetti hai realizzato?" | Risposta grounded corretta su entrambi i progetti, `sources: ["knowledge-base/projects/antichita-fallavena.it.md", "knowledge-base/projects/portfolio-v2.it.md"]` |
| OUT_OF_SCOPE (IT) | "Che tempo fa oggi a Bologna?" | Rifiuto quasi verbatim all'esempio del documento di visione, `sources: []` |
| Input invalido | `{}` | `400` con messaggio d'errore chiaro |
| IN_SCOPE (EN) | "What is your tech stack for the antichita fallavena project?" | Risposta corretta in inglese, `sources: ["knowledge-base/projects/antichita-fallavena.en.md"]` |

Comandi usati:
```bash
npm run dev:full   # in background, porta di default 8888

curl -X POST http://localhost:8888/api/assistant \
  -H "Content-Type: application/json" \
  -d '{"message": "Quali progetti hai realizzato?", "language": "it"}'

curl -X POST http://localhost:8888/api/assistant \
  -H "Content-Type: application/json" \
  -d '{"message": "Che tempo fa oggi a Bologna?", "language": "it"}'

curl -X POST http://localhost:8888/api/assistant \
  -H "Content-Type: application/json" -d '{}'
```

---

## Cosa resta (Fasi successive, non in scope qui)

- **Fase 11** — Finestra AI Assistant nel desktop, collegata a
  `/api/assistant` (fetch dal frontend, storia conversazione lato client)
- **Fase 12** — Explainability: rendere cliccabili le `sources` già
  restituite dalla function (aprono `KnowledgeDocumentWindow` per quel
  `path`, meccanismo payload già pronto dalla Fase 9)
- Rate limiting reale (oggi solo limiti di lunghezza input, nessuna
  protezione anti-abuso persistente: richiederebbe uno store esterno,
  es. Netlify Blobs, non necessario per il traffico atteso di un
  portfolio personale)
- Risposta in streaming (SSE) per un effetto "digitazione" in UI — oggi
  la function risponde in un unico blocco JSON
