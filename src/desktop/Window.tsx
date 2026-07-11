import { useCallback, useEffect, useRef, type ReactNode } from "react";
import { Minus, X } from "lucide-react";
import "./Window.css";

export interface WindowProps {
  id: string;
  title: string;
  position: { x: number; y: number };
  zIndex: number;
  width?: number;
  onClose: (id: string) => void;
  onFocus: (id: string) => void;
  onMinimize: (id: string) => void;
  onMove: (id: string, position: { x: number; y: number }) => void;
  children?: ReactNode;
}

export function Window({
  id,
  title,
  position,
  zIndex,
  width = 420,
  onClose,
  onFocus,
  onMinimize,
  onMove,
  children,
}: WindowProps) {
  const dragRef = useRef<{
    startX: number;
    startY: number;
    origin: { x: number; y: number };
  } | null>(null);

  const handleTitlebarPointerDown = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      onFocus(id);
      dragRef.current = {
        startX: e.clientX,
        startY: e.clientY,
        origin: position,
      };
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
    },
    [id, onFocus, position],
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

  return (
    <div
      className="window"
      style={{
        left: position.x,
        top: position.y,
        zIndex,
        width,
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
      >
        <span className="window__title">{title}</span>
        <div className="window__controls">
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
