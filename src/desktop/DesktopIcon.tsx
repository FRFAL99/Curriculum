import type { LucideIcon } from "lucide-react";
import { useIsMobile } from "../utils/useIsMobile";
import "./DesktopIcon.css";

interface DesktopIconProps {
  id: string;
  label: string;
  icon: LucideIcon;
  selected: boolean;
  onSelect: (id: string) => void;
  onOpen: (id: string) => void;
}

export function DesktopIcon({
  id,
  label,
  icon: Icon,
  selected,
  onSelect,
  onOpen,
}: DesktopIconProps) {
  const isMobile = useIsMobile();

  function handleClick() {
    // Su mobile il "doppio click" non è un gesto intuitivo: un tap singolo
    // apre direttamente la finestra, niente passaggio intermedio di
    // selezione. Su desktop resta il comportamento seleziona/apri (con
    // anche il doppio click, vedi onDoubleClick qui sotto).
    if (isMobile) {
      onOpen(id);
      return;
    }
    if (selected) {
      onOpen(id);
    } else {
      onSelect(id);
    }
  }

  return (
    <button
      type="button"
      className={`desktop-icon ${selected ? "desktop-icon--selected" : ""}`}
      onClick={handleClick}
      onDoubleClick={() => onOpen(id)}
      aria-pressed={selected}
    >
      <span className="desktop-icon__glyph">
        <Icon size={26} strokeWidth={1.6} />
      </span>
      <span className="desktop-icon__label">{label}</span>
    </button>
  );
}
