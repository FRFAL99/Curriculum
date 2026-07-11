# Fase 12 — Explainability — Log di avanzamento

Riferimento: documento di visione "Portfolio Architecture — Knowledge Base +
AI Assistant" (stesso citato nei log precedenti). Ultima fase della
roadmap originale: rende cliccabili le fonti già restituite dall'AI
Assistant (Fase 10) e già mostrate come testo semplice in `AssistantWindow`
(Fase 11), così l'utente può aprire direttamente il documento citato.

Fase piccola e ben definita: tutto il meccanismo necessario esisteva già
(payload del `WindowManager` dalla Fase 9, `KnowledgeDocumentWindow`,
`sources` già validate lato server in Fase 10) — qui si collegano i pezzi.

---

## Modifica

**Stato: ✅ completato**

`src/windows/Assistant/index.tsx`: ogni fonte sotto una risposta
dell'assistente era uno `<span>` di solo testo; trasformato in
`<button>` che chiama `openWindow("knowledge-document", { path: source })`
(stesso meccanismo già usato da `ProjectsWindow` per "Leggi il case
study", vedi `FASE9_LOG.md`). Serve `useWindowManager()`, non ancora
importato in questa finestra.

Nessuna corrispondenza da verificare tra il `path` restituito
dall'assistant e quello atteso da `KnowledgeDocumentWindow`: sono già lo
stesso formato (`knowledge-base/...`), e la function di Fase 10 già
valida le fonti dichiarate dal modello contro i path reali della
Knowledge Base prima di restituirle (`validPaths` in
`netlify/functions/assistant.ts`) — quindi ogni fonte cliccata in chat
corrisponde sempre a un documento esistente.

`src/windows/Assistant/Assistant.css`: `.assistant-msg__source` da testo
statico a bottone (reset di `background`/`border`/`padding` del browser,
`cursor: pointer`, hover con colore accent + sottolineatura per segnalare
la cliccabilità).

## Verifica

**Stato: ✅ completato**

`npx tsc -b --noEmit` e `npm run lint` puliti. Testato dal vivo con
`npm run dev:full` + Chromium headless: chiesto "Explain Antichità
Fallavena" all'assistente, cliccata la fonte mostrata
(`📄 knowledge-base/projects/antichita-fallavena.en.md`) → si apre la
finestra "Case Study" con il documento corretto ("Antichità Fallavena"),
sopra la finestra Assistant. Zero errori console.

---

## Stato della roadmap

Con questa fase si chiude la roadmap originale "Knowledge Base + AI
Assistant" (Fasi 8-12): Knowledge Base come Single Source of Truth,
Knowledge Document Viewer, backend grounded su OpenRouter, finestra
conversazionale, ed Explainability con fonti cliccabili — l'intero ciclo
"il sito e l'assistente leggono dagli stessi documenti" descritto nella
visione originale è ora implementato end-to-end.

Idee non implementate, emerse durante le fasi precedenti (non richieste
dalla roadmap, possibili sviluppi futuri):
- Evidenziare la sezione specifica del documento citata (oggi si apre
  l'intero documento, non uno scroll-to-section)
- Confidence score sulla risposta
- Streaming della risposta dell'assistente
- Rate limiting reale sulla function (oggi solo limiti di lunghezza input)
