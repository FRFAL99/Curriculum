import { Moon, Sun } from "lucide-react";
import type { WindowConfig } from "../config/windows";
import "./Dock.css";

interface DockProps {
  items: WindowConfig[];
  openIds: string[];
  onOpen: (id: string) => void;
  theme: "light" | "dark";
  onToggleTheme: () => void;
}

export function Dock({ items, openIds, onOpen, theme, onToggleTheme }: DockProps) {
  return (
    <nav className="dock" aria-label="Dock">
      <ul className="dock__list">
        {items.map((item) => {
          const Icon = item.icon;
          const isOpen = openIds.includes(item.id);
          return (
            <li key={item.id} className="dock__item">
              <button
                type="button"
                className="dock__button"
                onClick={() => onOpen(item.id)}
              >
                <Icon size={20} strokeWidth={1.7} />
                <span className="dock__tooltip">{item.title}</span>
              </button>
              {isOpen && <span className="dock__indicator" aria-hidden="true" />}
            </li>
          );
        })}
        <li className="dock__divider" aria-hidden="true" />
        <li className="dock__item">
          <button
            type="button"
            className="dock__button"
            onClick={onToggleTheme}
            aria-label="Cambia tema"
          >
            {theme === "dark" ? (
              <Sun size={20} strokeWidth={1.7} />
            ) : (
              <Moon size={20} strokeWidth={1.7} />
            )}
            <span className="dock__tooltip">
              Tema {theme === "dark" ? "chiaro" : "scuro"}
            </span>
          </button>
        </li>
      </ul>
    </nav>
  );
}
