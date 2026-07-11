# Fase 3 — Configurazione — Log di avanzamento

Riferimento: `Curriculum_Portfolio_v2_Roadmap.md`, sezione "Fase 3 - Configurazione".

> Tutte le finestre vengono registrate in una configurazione:
> `{ id, title, icon, component, defaultPosition }`

`config/windows.ts` esisteva già dalla Fase 1 (creato in anticipo per
alimentare le icone) con `id, title, icon, defaultPosition`. Manca solo
`component`: il collegamento tra ogni voce di config e il componente React
reale da renderizzare dentro la finestra. Questo è l'unico pezzo mancante
della Fase 3, quindi il task è più piccolo delle Fasi 1/2 — un solo step.

---

## Step 1 — Campo `component` + placeholder per finestra

**Stato: ✅ completato**

- `WindowConfig` ora include `component: ComponentType`
- Creati 6 placeholder tipizzati in `src/windows/<Nome>/index.tsx`
  (`ResumeWindow`, `ProjectsWindow`, `ExperienceWindow`, `SkillsWindow`,
  `ContactWindow`, `DeveloperNotesWindow`) — ognuno mostra solo il proprio
  nome, in attesa del contenuto reale della Fase 4
- `windowsConfig` in `config/windows.ts` collega ogni voce al proprio componente
- `WindowManager.tsx` ora fa `const Content = config.component` e
  renderizza `<Content />` genericamente, al posto del `PlaceholderContent`
  hardcoded della Fase 2 — questo era l'obiettivo esplicito della Fase 3
- `tsc --noEmit`: OK · `npm run build`: OK · `oxlint`: 0 warning, 0 errori

---

## Decisioni prese durante l'implementazione

- **Un file `index.tsx` per cartella finestra** (`src/windows/Resume/index.tsx`)
  invece di componenti annidati altrove: rispetta esattamente la "Struttura
  suggerita" della roadmap (`windows/ Resume/ Projects/ ...`) e rende
  l'import pulito (`from "../windows/Resume"`).
- **Placeholder ancora minimi**: la Fase 3 riguarda solo il collegamento
  struttura/config, non il contenuto. I placeholder sono stati mantenuti
  semplici apposta, per non anticipare lavoro della Fase 4 e restare
  facilmente distinguibili in fase di test manuale.
- **Nessun cambiamento alla shape dello stato del Window Manager** (Fase 2):
  la Fase 3 tocca solo la config e il punto di rendering del contenuto,
  non il reducer né il comportamento di drag/focus/minimizza.

## Prossimo passo

Fase 4: sostituire il contenuto dei 6 placeholder con i componenti reali,
popolando `src/data/resume.json`, `projects.json`, `skills.json` con i dati
migrati dal vecchio `Index.html`.
