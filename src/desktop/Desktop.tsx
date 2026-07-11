import { useEffect, useState } from "react";
import { windowsConfig } from "../config/windows";
import { Wallpaper } from "./Wallpaper";
import { DesktopIcon } from "./DesktopIcon";
import { Dock } from "./Dock";
import { WindowManager } from "./WindowManager";
import { useWindowManager } from "./useWindowManager";
import { useLanguage } from "../context/useLanguage";
import "./Desktop.css";

type Theme = "light" | "dark";

export function Desktop() {
  const [theme, setTheme] = useState<Theme>("dark");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const { windows, openWindow, toggleFromDock } = useWindowManager();

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  function handleDesktopClick(e: React.MouseEvent<HTMLDivElement>) {
    if (e.target === e.currentTarget) setSelectedId(null);
  }

  return (
    <div className="desktop" onClick={handleDesktopClick}>
      <Wallpaper />

      <div className="desktop__topbar">
        <span className="desktop__brand">Francesco Fallavena</span>
        <div className="desktop__topbar-right">
          <LanguageSwitcher />
          <span className="desktop__topbar-separator">·</span>
          <Clock />
        </div>
      </div>

      <div className="desktop__icons" onClick={handleDesktopClick}>
        {windowsConfig.map((w) => (
          <DesktopIcon
            key={w.id}
            id={w.id}
            label={w.title}
            icon={w.icon}
            selected={selectedId === w.id}
            onSelect={setSelectedId}
            onOpen={openWindow}
          />
        ))}
      </div>

      <WindowManager />

      <Dock
        items={windowsConfig.filter((w) => w.inDock)}
        openIds={Object.keys(windows)}
        onOpen={toggleFromDock}
        theme={theme}
        onToggleTheme={() =>
          setTheme((t) => (t === "dark" ? "light" : "dark"))
        }
      />
    </div>
  );
}

function Clock() {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000 * 30);
    return () => clearInterval(id);
  }, []);

  const time = now.toLocaleTimeString("it-IT", {
    hour: "2-digit",
    minute: "2-digit",
  });
  const date = now.toLocaleDateString("it-IT", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });

  return (
    <span className="desktop__clock">
      {date} · {time}
    </span>
  );
}

function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage();
  return (
    <div className="desktop__lang-switcher">
      <button
        className={`desktop__lang-btn ${language === "it" ? "active" : ""}`}
        onClick={() => setLanguage("it")}
      >
        ITA
      </button>
      <span className="desktop__lang-divider">/</span>
      <button
        className={`desktop__lang-btn ${language === "en" ? "active" : ""}`}
        onClick={() => setLanguage("en")}
      >
        ENG
      </button>
    </div>
  );
}
