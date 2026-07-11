import { windowsConfig } from "../config/windows";
import { useWindowManager } from "./useWindowManager";
import { Window } from "./Window";

/**
 * Legge lo stato dal WindowManagerContext e renderizza una <Window> per ogni
 * finestra aperta e non minimizzata, con il contenuto reale definito in
 * `config.component` (Fase 3: ancora placeholder, Fase 4: contenuto vero).
 */
export function WindowManager() {
  const { windows, closeWindow, focusWindow, minimizeWindow, moveWindow } =
    useWindowManager();

  const openEntries = Object.values(windows).filter((w) => !w.minimized);

  return (
    <>
      {openEntries.map((win) => {
        const config = windowsConfig.find((w) => w.id === win.id);
        if (!config) return null;
        const Content = config.component;
        return (
          <Window
            key={win.id}
            id={win.id}
            title={config.title}
            position={win.position}
            zIndex={win.zIndex}
            width={config.width}
            onClose={closeWindow}
            onFocus={focusWindow}
            onMinimize={minimizeWindow}
            onMove={moveWindow}
          >
            <Content />
          </Window>
        );
      })}
    </>
  );
}
