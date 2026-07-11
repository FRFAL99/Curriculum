import { useMemo, useState } from "react";
import {
  User,
  History,
  FolderKanban,
  Sparkles,
  GraduationCap,
  Terminal,
  ChevronDown,
  ChevronRight,
  PanelLeft,
  type LucideIcon,
} from "lucide-react";
import {
  getAbout,
  getDeveloperNotes,
  getEducation,
  getExperience,
  getProjects,
  getSkills,
} from "../lib/knowledgeBase";
import { useLanguage } from "../context/useLanguage";
import { useWindowManager } from "./useWindowManager";
import { useIsMobile } from "../utils/useIsMobile";
import { readJSON, writeJSON } from "../utils/storage";
import type { TranslationKey } from "../context/translations";
import "./KnowledgeExplorer.css";

const STORAGE_KEY = "knowledgeExplorerState";

interface ExplorerLeaf {
  kind: "leaf";
  id: string;
  icon: LucideIcon;
  titleKey: TranslationKey;
  path?: string;
}

interface ExplorerBranch {
  kind: "branch";
  id: string;
  icon: LucideIcon;
  titleKey: TranslationKey;
  items: { path: string; label: string }[];
}

type ExplorerCategory = ExplorerLeaf | ExplorerBranch;

function label(doc: { slug: string; frontmatter: unknown }, field: string): string {
  const value = (doc.frontmatter as Record<string, unknown>)[field];
  return typeof value === "string" ? value : doc.slug;
}

export function KnowledgeExplorer() {
  const { language, t } = useLanguage();
  const { windows, openWindow } = useWindowManager();
  const isMobile = useIsMobile();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [expanded, setExpanded] = useState<Record<string, boolean>>(() =>
    readJSON(STORAGE_KEY, {} as Record<string, boolean>),
  );

  const categories = useMemo<ExplorerCategory[]>(() => {
    const about = getAbout(language);
    const skills = getSkills();

    return [
      { kind: "leaf", id: "about", icon: User, titleKey: "profileTitle", path: about?.path },
      {
        kind: "branch",
        id: "experience",
        icon: History,
        titleKey: "experienceTitle",
        items: getExperience(language).map((doc) => ({ path: doc.path, label: label(doc, "role") })),
      },
      {
        kind: "branch",
        id: "projects",
        icon: FolderKanban,
        titleKey: "projectsTitle",
        items: getProjects(language).map((doc) => ({ path: doc.path, label: label(doc, "title") })),
      },
      { kind: "leaf", id: "skills", icon: Sparkles, titleKey: "skillsTitle", path: skills?.path },
      {
        kind: "branch",
        id: "education",
        icon: GraduationCap,
        titleKey: "educationTitle",
        items: getEducation(language).map((doc) => ({ path: doc.path, label: label(doc, "degree") })),
      },
      {
        kind: "branch",
        id: "developer-notes",
        icon: Terminal,
        titleKey: "developerNotesTitle",
        items: getDeveloperNotes(language).map((doc) => ({ path: doc.path, label: label(doc, "title") })),
      },
    ];
  }, [language]);

  const activeDocWindow = windows["knowledge-document"];
  const activePath =
    activeDocWindow && !activeDocWindow.minimized
      ? (activeDocWindow.payload as { path?: string } | undefined)?.path
      : undefined;

  function isExpanded(id: string): boolean {
    return expanded[id] ?? true;
  }

  function toggleCategory(id: string) {
    setExpanded((prev) => {
      const next = { ...prev, [id]: !isExpanded(id) };
      writeJSON(STORAGE_KEY, next);
      return next;
    });
  }

  function handleOpen(path?: string) {
    if (!path) return;
    openWindow("knowledge-document", { path });
    if (isMobile) setMobileOpen(false);
  }

  const panel = (
    <nav className="kb-explorer__panel" aria-label={t("knowledgeExplorerTitle")}>
      <div className="kb-explorer__header">{t("knowledgeExplorerTitle")}</div>
      <ul className="kb-explorer__list">
        {categories.map((category) => {
          const Icon = category.icon;

          if (category.kind === "leaf") {
            return (
              <li key={category.id} className="kb-explorer__category">
                <button
                  type="button"
                  className={`kb-explorer__row kb-explorer__row--leaf ${
                    category.path && category.path === activePath ? "kb-explorer__row--active" : ""
                  }`}
                  onClick={() => handleOpen(category.path)}
                >
                  <Icon size={15} strokeWidth={1.7} />
                  <span>{t(category.titleKey)}</span>
                </button>
              </li>
            );
          }

          const open = isExpanded(category.id);
          return (
            <li key={category.id} className="kb-explorer__category">
              <button
                type="button"
                className="kb-explorer__row kb-explorer__row--branch"
                onClick={() => toggleCategory(category.id)}
                aria-expanded={open}
              >
                {open ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                <Icon size={15} strokeWidth={1.7} />
                <span>{t(category.titleKey)}</span>
              </button>
              {open && (
                <ul className="kb-explorer__items">
                  {category.items.map((item) => (
                    <li key={item.path}>
                      <button
                        type="button"
                        className={`kb-explorer__row kb-explorer__row--item ${
                          item.path === activePath ? "kb-explorer__row--active" : ""
                        }`}
                        onClick={() => handleOpen(item.path)}
                      >
                        <span>{item.label}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          );
        })}
      </ul>
    </nav>
  );

  if (isMobile) {
    return (
      <>
        <button
          type="button"
          className="kb-explorer__toggle"
          aria-label={t("knowledgeExplorerToggle")}
          onClick={() => setMobileOpen((v) => !v)}
        >
          <PanelLeft size={18} strokeWidth={1.7} />
        </button>
        {mobileOpen && (
          <div className="kb-explorer kb-explorer--mobile">
            <div className="kb-explorer__backdrop" onClick={() => setMobileOpen(false)} />
            {panel}
          </div>
        )}
      </>
    );
  }

  return <div className="kb-explorer">{panel}</div>;
}
