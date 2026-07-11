import type { LucideIcon } from "lucide-react";
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
  function handleClick() {
    // Su touch il dblclick nativo non è affidabile: il primo tap seleziona,
    // il secondo tap (icona già selezionata) apre la finestra. Su desktop
    // questo comportamento convive con onDoubleClick qui sotto.
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
