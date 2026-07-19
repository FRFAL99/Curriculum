import { useEffect, useState } from "react";
import { Sun, Moon, Menu } from "lucide-react";
import { Wallpaper } from "./Wallpaper";
import { KnowledgeExplorer } from "./KnowledgeExplorer";
import { DeveloperNotesSection } from "./DeveloperNotesSection";
import { DocumentDetail } from "./DocumentDetail";
import { HomeHero } from "./HomeHero";
import { HomeContact } from "./HomeContact";
import { useLanguage } from "../context/useLanguage";
import { readJSON, writeJSON } from "../utils/storage";
import { AssistantWindow } from "../windows/Assistant";
import { ResumeWindow } from "../windows/Resume";
import { ProjectsWindow } from "../windows/Projects";
import "./Desktop.css";

type Theme = "light" | "dark";
type Tab = "home" | "resume" | "projects" | "notes";

const THEME_KEY = "theme";

/** Hash URL per ogni tab (Home resta senza hash). Rende le sezioni condivisibili. */
const TAB_HASH: Record<Tab, string> = {
  home: "",
  resume: "resume",
  projects: "projects",
  notes: "notes",
};

function getInitialTheme(): Theme {
  const saved = readJSON<Theme | null>(THEME_KEY, null);
  if (saved === "light" || saved === "dark") return saved;

  const prefersLight =
    typeof window !== "undefined" &&
    window.matchMedia?.("(prefers-color-scheme: light)").matches;
  return prefersLight ? "light" : "dark";
}

function getInitialTab(): Tab {
  if (typeof window === "undefined") return "home";
  const hash = window.location.hash.replace("#", "");
  if (hash === "resume" || hash === "projects" || hash === "notes") return hash;
  return "home";
}

export function Desktop() {
  const [theme, setTheme] = useState<Theme>(getInitialTheme);
  const [activeTab, setActiveTab] = useState<Tab>(getInitialTab);
  const [menuOpen, setMenuOpen] = useState(false);
  const { t } = useLanguage();

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    writeJSON(THEME_KEY, theme);
  }, [theme]);

  // Sincronizza il tab con l'hash: supporta back/forward del browser e link
  // condivisi (#resume, #projects, #notes) anche dopo il primo caricamento.
  useEffect(() => {
    const onHashChange = () => setActiveTab(getInitialTab());
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  function selectTab(tab: Tab) {
    setActiveTab(tab);
    setMenuOpen(false);
    if (typeof window !== "undefined") {
      window.location.hash = TAB_HASH[tab];
    }
  }

  const tabs: { id: Tab; label: string }[] = [
    { id: "home", label: t("tabHome") },
    { id: "resume", label: t("tabResume") },
    { id: "projects", label: t("tabProjects") },
    { id: "notes", label: t("tabDeveloperNotes") },
  ];
  const activeLabel = tabs.find((tab) => tab.id === activeTab)?.label ?? "";

  return (
    <div className="desktop">
      <Wallpaper />

      <header className="desktop__topbar">
        <div className="desktop__topbar-left">
          <span className="desktop__brand">Francesco Fallavena</span>
          <button
            type="button"
            className="desktop__menu-toggle"
            onClick={() => setMenuOpen((v) => !v)}
            aria-expanded={menuOpen}
            aria-label="Menu"
          >
            <Menu size={16} strokeWidth={1.8} />
            <span>{activeLabel}</span>
          </button>
          <nav className={`desktop__tabs ${menuOpen ? "desktop__tabs--open" : ""}`}>
            {tabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                className={`desktop__tab ${activeTab === tab.id ? "desktop__tab--active" : ""}`}
                onClick={() => selectTab(tab.id)}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
        <div className="desktop__topbar-right">
          <LanguageSwitcher />
          <span className="desktop__topbar-separator">·</span>
          <button
            type="button"
            className="desktop__theme-toggle"
            onClick={() => setTheme((prev) => (prev === "dark" ? "light" : "dark"))}
            aria-label={t("themeLabel")}
          >
            {theme === "dark" ? <Sun size={15} strokeWidth={1.8} /> : <Moon size={15} strokeWidth={1.8} />}
          </button>
          <span className="desktop__topbar-separator">·</span>
          <Clock />
        </div>
      </header>

      {activeTab === "home" && <HomeSection onNavigate={selectTab} />}

      {activeTab === "resume" && (
        <div className="tab-section">
          <div className="tab-section__inner tab-section__inner--wide">
            <ResumeWindow />
          </div>
        </div>
      )}

      {activeTab === "projects" && <ProjectsWindow />}

      {activeTab === "notes" && <DeveloperNotesSection />}
    </div>
  );
}

/** Home: hero + assistant + contatti, con la Knowledge Base come doc laterale. */
function HomeSection({ onNavigate }: { onNavigate: (tab: "resume" | "projects") => void }) {
  const [docPath, setDocPath] = useState<string | null>(null);

  return (
    <>
      <div className="home__main">
        {docPath ? (
          <DocumentDetail path={docPath} onBack={() => setDocPath(null)} />
        ) : (
          <div className="home__stack">
            <HomeHero onNavigate={onNavigate} />
            <div className="home__assistant">
              <AssistantWindow onOpenDoc={setDocPath} />
            </div>
            <HomeContact />
          </div>
        )}
      </div>

      <KnowledgeExplorer activePath={docPath} onOpenDoc={setDocPath} />
    </>
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
