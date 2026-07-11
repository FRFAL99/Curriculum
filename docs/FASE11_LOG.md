# Fase 11 — Finestra AI Assistant — Log di avanzamento

Riferimento: documento di visione "Portfolio Architecture — Knowledge Base +
AI Assistant" (vedi `docs/VISION.md`, stesso citato in
`FASE8_LOG.md`/`FASE9_LOG.md`/`FASE10_LOG.md`).
Collega il backend della Fase 10 (`/api/assistant`) a una finestra vera nel
desktop — la prima UI conversazionale del portfolio.

Decisioni prese con l'utente prima di implementare:
- Nome/titolo finestra: **"Ask about Francesco"**.
- Conversazione **persistita** in localStorage (stesso pattern dello stato
  delle altre finestre): chiudendo e riaprendo la finestra resta.
- Le fonti (`sources`, già restituite dalla function di Fase 10) restano
  **testo semplice** in questa fase; il collegamento cliccabile al
  Knowledge Document Viewer è rimandato alla Fase 12 come da roadmap.

---

## Step 1 — Traduzioni e conversation starters

**Stato: ✅ completato**

Nuove chiavi chrome in `src/context/translations.ts` (`assistantIntro`,
`assistantPlaceholder`, `assistantThinking`, `retry`, `send`,
`resetConversation`). I suggerimenti di conversazione del documento di
visione ("Tell me about your experience", "Which project are you most
proud of?", ecc.) sono un array, non una stringa singola: esportati come
`conversationStarters: Record<Language, string[]>` **separato** da
`translations`, per non alterare il tipo di ritorno `string` di `t()` in
`LanguageContext.tsx`.

## Step 2 — `AssistantWindow`

**Stato: ✅ completato**

Nuovo `src/windows/Assistant/index.tsx` + `Assistant.css`. Stato locale:
`messages` (persistito in localStorage con `readJSON`/`writeJSON` da
`src/utils/storage.ts`, stesso pattern di `WindowManagerContext.tsx`),
`input`, `loading`, `error` (questi ultimi tre non persistiti).

Invio separato in due funzioni per non duplicare il turno utente al
"Riprova":
- `handleSend(text)` — aggiunge il messaggio utente allo stato, poi chiama
  `callAssistant`.
- `callAssistant(currentMessages)` — `POST /api/assistant` con
  `{ message, language, history }` (history = conversazione precedente,
  ultimi 10 turni, mappata a `{role, content}` per rispettare il limite
  del backend, vedi `netlify/functions/assistant.ts`); in errore imposta
  `error` **senza** toccare `messages`.
- `handleRetry()` — richiama `callAssistant(messages)` senza aggiungere
  un nuovo turno (i messaggi correnti finiscono già con lo user turn non
  risposto).

Risposta dell'assistente renderizzata con `renderBlock()` (già esistente
in `src/lib/markdown.ts`, stesso helper del Knowledge Document Viewer di
Fase 9) invece di testo semplice: le risposte del modello contengono
markdown (`**grassetto**`), e senza parsing comparivano asterischi
letterali nella UI — scoperto durante il test end-to-end (vedi Step 3),
non visibile da tsc/lint.

Suggerimenti di conversazione mostrati come bottoni verticali quando la
conversazione è vuota; bottone "Nuova conversazione" per svuotare stato
+ localStorage.

## Step 3 — Registrazione finestra e verifica end-to-end

**Stato: ✅ completato**

`src/config/windows.ts`: nuova entry `assistant` (icona `Bot`,
`inDock: true` — a differenza del Knowledge Document Viewer, questa è una
feature in vista, non una finestra "nascosta").

`npx tsc -b --noEmit` e `npm run lint` puliti. Verificato dal vivo con
`npm run dev:full` + Chromium headless (Playwright):

- Apertura finestra, click su uno starter → risposta grounded corretta,
  fonte mostrata (`📄 knowledge-base/projects/antichita-fallavena.en.md`),
  **markdown renderizzato correttamente** dopo il fix di cui sopra (prima
  del fix: asterischi letterali attorno a "Next.js", "Firebase", ecc.).
- Chiusura e riapertura della finestra → conversazione ancora presente
  (persistenza confermata: 2 bolle prima e dopo).
- "Nuova conversazione" → stato svuotato, starter di nuovo visibili.
- Errore di rete simulato (route abortita) → banner "Failed to fetch" +
  bottone "Retry", **senza duplicare** la bolla utente già inviata.
- Zero errori console in tutti gli scenari.

**Nota sulla latenza del modello free-tier**: durante il primo test la
function locale è andata in timeout dopo 30s (limite dell'emulazione
`netlify dev`/lambda-local). Isolato il problema chiamando OpenRouter
direttamente con lo stesso system prompt reale (~8.800 caratteri, 12
documenti): in condizioni normali la risposta arriva in **~4 secondi**,
quindi il prompt non è la causa — è la stessa variabilità del provider
free-tier già osservata in Fase 10 (occasionali rallentamenti/429). Da
tenere presente: in produzione, se Netlify applica un timeout di
esecuzione più basso del previsto per le function, una risposta lenta del
modello free potrebbe restituire un errore al posto della risposta invece
di aspettare — l'utente vede comunque il banner "Riprova" invece di un
crash silenzioso, quindi il degrado è "educato", ma un modello a
pagamento più stabile risolverebbe la causa a monte (cambiare
`OPENROUTER_MODEL` è solo una env var, nessuna modifica al codice).

---

## Cosa resta (Fasi successive, non in scope qui)

- **Fase 12** — Explainability: rendere cliccabili le `sources` mostrate
  in `AssistantWindow` (aprono `KnowledgeDocumentWindow` per quel `path`
  tramite `openWindow("knowledge-document", { path })`, meccanismo già
  pronto dalla Fase 9)
- Persistere anche la bozza non ancora inviata nell'input (oggi si perde
  chiudendo la finestra, solo `messages` è persistito)
- Streaming della risposta (effetto "digitazione"), se in futuro si vuole
  migliorare la UX di attesa oltre l'indicatore "Sto pensando..."
