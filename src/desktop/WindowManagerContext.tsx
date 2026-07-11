import {
  createContext,
  useCallback,
  useMemo,
  useReducer,
  type ReactNode,
} from "react";
import { windowsConfig } from "../config/windows";

export interface WindowState {
  id: string;
  zIndex: number;
  minimized: boolean;
  position: { x: number; y: number };
}

interface ManagerState {
  windows: Record<string, WindowState>;
  nextZIndex: number;
}

type Action =
  | { type: "OPEN"; id: string }
  | { type: "CLOSE"; id: string }
  | { type: "FOCUS"; id: string }
  | { type: "MINIMIZE"; id: string }
  | { type: "RESTORE"; id: string }
  | { type: "MOVE"; id: string; position: { x: number; y: number } };

const BASE_Z = 10;

function reducer(state: ManagerState, action: Action): ManagerState {
  switch (action.type) {
    case "OPEN": {
      const existing = state.windows[action.id];
      if (existing) {
        // Già aperta: portala a fuoco e ripristinala se minimizzata.
        return {
          ...state,
          windows: {
            ...state.windows,
            [action.id]: {
              ...existing,
              minimized: false,
              zIndex: state.nextZIndex,
            },
          },
          nextZIndex: state.nextZIndex + 1,
        };
      }
      const config = windowsConfig.find((w) => w.id === action.id);
      return {
        ...state,
        windows: {
          ...state.windows,
          [action.id]: {
            id: action.id,
            zIndex: state.nextZIndex,
            minimized: false,
            position: config?.defaultPosition ?? { x: 100, y: 100 },
          },
        },
        nextZIndex: state.nextZIndex + 1,
      };
    }
    case "CLOSE": {
      const { [action.id]: _removed, ...rest } = state.windows;
      return { ...state, windows: rest };
    }
    case "FOCUS": {
      const existing = state.windows[action.id];
      if (!existing) return state;
      return {
        ...state,
        windows: {
          ...state.windows,
          [action.id]: { ...existing, zIndex: state.nextZIndex },
        },
        nextZIndex: state.nextZIndex + 1,
      };
    }
    case "MINIMIZE": {
      const existing = state.windows[action.id];
      if (!existing) return state;
      return {
        ...state,
        windows: {
          ...state.windows,
          [action.id]: { ...existing, minimized: true },
        },
      };
    }
    case "RESTORE": {
      const existing = state.windows[action.id];
      if (!existing) return state;
      return {
        ...state,
        windows: {
          ...state.windows,
          [action.id]: {
            ...existing,
            minimized: false,
            zIndex: state.nextZIndex,
          },
        },
        nextZIndex: state.nextZIndex + 1,
      };
    }
    case "MOVE": {
      const existing = state.windows[action.id];
      if (!existing) return state;
      return {
        ...state,
        windows: {
          ...state.windows,
          [action.id]: { ...existing, position: action.position },
        },
      };
    }
    default:
      return state;
  }
}

export interface WindowManagerContextValue {
  windows: Record<string, WindowState>;
  openWindow: (id: string) => void;
  closeWindow: (id: string) => void;
  focusWindow: (id: string) => void;
  minimizeWindow: (id: string) => void;
  restoreWindow: (id: string) => void;
  moveWindow: (id: string, position: { x: number; y: number }) => void;
  /** Toggle usato dal dock: apri / porta a fuoco / minimizza a seconda dello stato corrente. */
  toggleFromDock: (id: string) => void;
}

const WindowManagerContext = createContext<WindowManagerContextValue | null>(
  null,
);

export function WindowManagerProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, {
    windows: {},
    nextZIndex: BASE_Z,
  });

  const openWindow = useCallback((id: string) => dispatch({ type: "OPEN", id }), []);
  const closeWindow = useCallback((id: string) => dispatch({ type: "CLOSE", id }), []);
  const focusWindow = useCallback((id: string) => dispatch({ type: "FOCUS", id }), []);
  const minimizeWindow = useCallback(
    (id: string) => dispatch({ type: "MINIMIZE", id }),
    [],
  );
  const restoreWindow = useCallback(
    (id: string) => dispatch({ type: "RESTORE", id }),
    [],
  );
  const moveWindow = useCallback(
    (id: string, position: { x: number; y: number }) =>
      dispatch({ type: "MOVE", id, position }),
    [],
  );

  const toggleFromDock = useCallback(
    (id: string) => {
      const win = state.windows[id];
      if (!win) {
        dispatch({ type: "OPEN", id });
        return;
      }
      if (win.minimized) {
        dispatch({ type: "RESTORE", id });
        return;
      }
      const isTopMost = win.zIndex === state.nextZIndex - 1;
      if (isTopMost) {
        dispatch({ type: "MINIMIZE", id });
      } else {
        dispatch({ type: "FOCUS", id });
      }
    },
    [state.windows, state.nextZIndex],
  );

  const value = useMemo<WindowManagerContextValue>(
    () => ({
      windows: state.windows,
      openWindow,
      closeWindow,
      focusWindow,
      minimizeWindow,
      restoreWindow,
      moveWindow,
      toggleFromDock,
    }),
    [
      state.windows,
      openWindow,
      closeWindow,
      focusWindow,
      minimizeWindow,
      restoreWindow,
      moveWindow,
      toggleFromDock,
    ],
  );

  return (
    <WindowManagerContext.Provider value={value}>
      {children}
    </WindowManagerContext.Provider>
  );
}

export { WindowManagerContext };
