import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  type ReactNode,
} from "react";
import { Maximize2, Minimize2, Minus, X } from "lucide-react";
import { useIsMobile } from "../utils/useIsMobile";
import "./Window.css";

// Spazio riservato sopra/sotto la finestra quando si centra o si va a
// schermo intero, per non coprire topbar e dock. Tenuti in sync "a occhio"
// con le altezze reali di Desktop.css/Dock.css (non critico: qualche px
// di margine in più o in meno non rompe nulla).
const TOPBAR_SAFE = 64;
const DOCK_SAFE = 96;

export interface WindowProps {
  id: string;
  title: string;
  position: { x: number; y: number };
  zIndex: number;
  width?: number;
  maximized?: boolean;
  allowMaximize?: boolean;
  onClose: (id: string) => void;
  onFocus: (id: string) => void;
  onMinimize: (id: string) => void;
  onMove: (id: string, position: { x: number; y: number }) => void;
  onToggleMaximize?: (id: string) => void;
  children?: ReactNode;
}

export function Window({
  id,
  title,
  position,
  zIndex,
  width = 420,
  maximized = false,
  allowMaximize = false,
  onClose,
  onFocus,
  onMinimize,
  onMove,
  onToggleMaximize,
  children,
}: WindowProps) {
  const dragRef = useRef<{
    startX: number;
    startY: number;
    origin: { x: number; y: number };
  } | null>(null);
  const windowRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();

  // Centra la finestra al primo render dopo l'apertura: la posizione
  // "sentinella" (x < 0, vedi CENTER_ON_OPEN in WindowManagerContext) segnala
  // che non è mai stata spostata dall'utente. Si misura l'altezza reale già
  // renderizzata per centrare correttamente anche finestre di contenuto
  // diverso, poi si scrive la posizione calcolata nello stato (persistita),
  // così un successivo restore-da-minimizzata non ricentra più.
  useLayoutEffect(() => {
    if (position.x >= 0) return;
    const el = windowRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = Math.max(8, Math.round((window.innerWidth - width) / 2));
    const availableHeight = Math.max(
      160,
      window.innerHeight - TOPBAR_SAFE - DOCK_SAFE,
    );
    const y =
      TOPBAR_SAFE + Math.max(0, Math.round((availableHeight - rect.height) / 2));
    onMove(id, { x, y });
    // Va eseguito solo all'apertura (posizione sentinella), non ad ogni resize.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleTitlebarPointerDown = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      onFocus(id);
      // Niente drag: su mobile la finestra è ancorata via CSS, a schermo
      // intero è ancorata allo stesso modo (si "sblocca" solo uscendo dal
      // fullscreen).
      if (isMobile || maximized) return;
      dragRef.current = {
        startX: e.clientX,
        startY: e.clientY,
        origin: position,
      };
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
    },
    [id, onFocus, position, isMobile, maximized],
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (!dragRef.current) return;
      const { startX, startY, origin } = dragRef.current;
      const nextX = origin.x + (e.clientX - startX);
      const nextY = origin.y + (e.clientY - startY);

      // Mantiene la finestra dentro i confini visibili (niente resize, ma
      // niente nemmeno finestre perse fuori schermo).
      const clampedX = Math.max(8, Math.min(nextX, window.innerWidth - 120));
      const clampedY = Math.max(8, Math.min(nextY, window.innerHeight - 60));

      onMove(id, { x: clampedX, y: clampedY });
    },
    [id, onMove],
  );

  const handlePointerUp = useCallback(() => {
    dragRef.current = null;
  }, []);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose(id);
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [id, onClose]);

  const showMaximizeButton = allowMaximize && !isMobile;

  return (
    <div
      ref={windowRef}
      className={[
        "window",
        isMobile && "window--mobile",
        maximized && !isMobile && "window--maximized",
      ]
        .filter(Boolean)
        .join(" ")}
      style={{
        left: Math.max(0, position.x),
        top: Math.max(0, position.y),
        zIndex,
        width,
        // La transizione CSS su left/top (per l'animazione dello schermo
        // intero) andrebbe in conflitto col drag, rendendolo "gommoso":
        // qui viene disattivata mentre l'utente sta trascinando.
        transition: dragRef.current ? "none" : undefined,
      }}
      onMouseDown={() => onFocus(id)}
      role="dialog"
      aria-label={title}
    >
      <div
        className="window__titlebar"
        onPointerDown={handleTitlebarPointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onDoubleClick={() => {
          if (showMaximizeButton) onToggleMaximize?.(id);
        }}
      >
        <span className="window__title">{title}</span>
        <div className="window__controls">
          {showMaximizeButton && (
            <button
              type="button"
              className="window__control"
              aria-label={maximized ? "Ripristina" : "Schermo intero"}
              onClick={(e) => {
                e.stopPropagation();
                onToggleMaximize?.(id);
              }}
            >
              {maximized ? (
                <Minimize2 size={13} strokeWidth={2} />
              ) : (
                <Maximize2 size={13} strokeWidth={2} />
              )}
            </button>
          )}
          <button
            type="button"
            className="window__control"
            aria-label="Minimizza"
            onClick={(e) => {
              e.stopPropagation();
              onMinimize(id);
            }}
          >
            <Minus size={14} strokeWidth={2} />
          </button>
          <button
            type="button"
            className="window__control window__control--close"
            aria-label="Chiudi"
            onClick={(e) => {
              e.stopPropagation();
              onClose(id);
            }}
          >
            <X size={14} strokeWidth={2} />
          </button>
        </div>
      </div>
      <div className="window__body">{children}</div>
    </div>
  );
}
