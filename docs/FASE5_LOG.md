# Fase 5 — Persistenza — Log di avanzamento

Riferimento: `Curriculum_Portfolio_v2_Roadmap.md`, sezione "Fase 5 - Gestione
con Context/Zustand. Persistenza: tema, finestre aperte, finestra attiva."

Nota: la persistenza della **lingua** è già stata implementata insieme al
sistema i18n arrivato in Fase 4 (`localStorage.getItem("language")` in
`LanguageContext.tsx`). Questa fase copre quello che manca: tema, finestre
aperte (posizione, minimizzate) e finestra attiva (a fuoco).

Si resta su **Context + reducer** (non Zustand): lo stato è già centralizzato
e la roadmap lascia "Context/Zustand" come alternativa equivalente — passare
a Zustand qui sarebbe un cambio di libreria senza un problema reale da
risolvere (over-engineering, contro uno dei principi guida della roadmap).

---

## Step 1 — Utility di storage condivisa

**Stato: ✅ completato**

- `src/utils/storage.ts`: `readJSON`/`writeJSON`, entrambe con try/catch —
  se lo storage non è disponibile l'app continua a funzionare, solo senza persistenza

## Step 2 — Persistenza tema

**Stato: ✅ completato**

- `Desktop.tsx`: stato iniziale del tema calcolato in un lazy initializer
  (`getInitialTheme`) — `localStorage` → se assente, `prefers-color-scheme`
  di sistema → default `dark`
- Salvataggio in `localStorage` nello stesso `useEffect` che già applicava
  `data-theme` al `documentElement`, nessun effect aggiuntivo necessario

## Step 3 — Persistenza Window Manager (finestre aperte + finestra attiva)

**Stato: ✅ completato**

- `useReducer(reducer, undefined, getInitialState)`: stato iniziale letto da
  `localStorage` tramite la forma a 3 argomenti di `useReducer` (init function)
- `getInitialState` scarta le finestre con id non più presente in
  `windowsConfig`, per sicurezza in caso la config cambi in futuro
- Un solo `useEffect` su `state` salva l'intero stato (`windows` + `nextZIndex`)
  ad ogni variazione — apertura, chiusura, drag, minimizza, focus
- "Finestra attiva" non è stata trattata come dato a parte: è già derivabile
  come quella con `zIndex` più alto, e viene ripristinata automaticamente
  perché ogni finestra porta con sé il proprio `zIndex` salvato

## Step 4 — Verifica finale

**Stato: ✅ completato**

- `npm run build`: OK (bundle ~238 KB / 73 KB gzip, invariato)
- `npm run lint` (oxlint): 0 warning, 0 errori
- `README.md` aggiornato

---

## Decisioni prese durante l'implementazione

- **Niente Zustand.** Lo stato del Window Manager era già centralizzato in
  un reducer; introdurre Zustand qui avrebbe significato cambiare libreria
  senza risolvere un problema reale (la roadmap stessa elenca "Context/Zustand"
  come alternative equivalenti, non come step obbligati entrambi).
- **`useReducer` a 3 argomenti invece di un `useEffect` di hydration**: evita
  un render "vuoto" seguito da un secondo render con lo stato ripristinato —
  lo stato iniziale è già quello corretto al primo render.
- **Un solo `useEffect` di salvataggio per l'intero stato** (non uno per
  ogni singola azione): più semplice da mantenere, e scrivere su
  localStorage ad ogni variazione di stato (anche durante il drag) ha un
  costo trascurabile per un oggetto di queste dimensioni.
- **Nessuna gestione esplicita di "finestra attiva" come campo separato**:
  sarebbe stato un dato ridondante, dato che è già ricavabile dal `zIndex`
  massimo tra le finestre aperte.

## Fase 5 completata — riepilogo persistenza

| Dato | Persistito | Dove |
|---|---|---|
| Tema (light/dark) | ✅ | `localStorage["theme"]` |
| Lingua (it/en) | ✅ (da Fase 4) | `localStorage["language"]` |
| Finestre aperte/minimizzate/posizione | ✅ | `localStorage["windowManagerState"]` |
| Finestra attiva (a fuoco) | ✅ (derivata da `zIndex`) | incluso nel punto sopra |

Con questo, tutti i punti della roadmap risultano implementati. Prossimi
passi possibili (non richiesti dalla roadmap originale, solo idee):
rifiniture i18n minori già segnalate nel log Fase 4 (titoli finestre/dock),
eventuale resize delle finestre se in futuro servisse.
