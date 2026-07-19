import { useMemo, useState } from "react";
import {
  User,
  History,
  FolderKanban,
  Sparkles,
  GraduationCap,
  ChevronDown,
  ChevronRight,
  PanelLeft,
  Search,
  type LucideIcon,
} from "lucide-react";
import {
  getAbout,
  getEducation,
  getExperience,
  getProjects,
  getSkills,
} from "../lib/knowledgeBase";
import { useLanguage } from "../context/useLanguage";
import { useIsMobile } from "../utils/useIsMobile";
import { readJSON, writeJSON } from "../utils/storage";
import type { TranslationKey } from "../context/translations";
import "./KnowledgeExplorer.css";

const STORAGE_KEY = "knowledgeExplorerState";

interface ExplorerItem {
  path: string;
  label: string;
  searchText: string;
}

interface ExplorerLeaf {
  kind: "leaf";
  id: string;
  icon: LucideIcon;
  titleKey: TranslationKey;
  path?: string;
  searchText?: string;
}

interface ExplorerBranch {
  kind: "branch";
  id: string;
  icon: LucideIcon;
  titleKey: TranslationKey;
  items: ExplorerItem[];
}

type ExplorerCategory = ExplorerLeaf | ExplorerBranch;

interface SearchResult {
  path: string;
  label: string;
  icon: LucideIcon;
  titleKey: TranslationKey;
}

function label(doc: { slug: string; frontmatter: unknown }, field: string): string {
  const value = (doc.frontmatter as Record<string, unknown>)[field];
  return typeof value === "string" ? value : doc.slug;
}

function searchTextFor(
  doc: { body: string; frontmatter: unknown },
  itemLabel: string,
  tagField?: string,
): string {
  const fm = doc.frontmatter as Record<string, unknown>;
  const tags =
    tagField && Array.isArray(fm[tagField])
      ? (fm[tagField] as unknown[]).filter((v): v is string => typeof v === "string")
      : [];
  return [itemLabel, doc.body, ...tags].join(" ").toLowerCase();
}

export function KnowledgeExplorer({
  activePath,
  onOpenDoc,
}: {
  activePath: string | null;
  onOpenDoc: (path: string) => void;
}) {
  const { language, t } = useLanguage();
  const isMobile = useIsMobile();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [expanded, setExpanded] = useState<Record<string, boolean>>(() =>
    readJSON(STORAGE_KEY, {} as Record<string, boolean>),
  );

  const categories = useMemo<ExplorerCategory[]>(() => {
    const about = getAbout(language);
    const skills = getSkills();

    return [
      {
        kind: "leaf",
        id: "about",
        icon: User,
        titleKey: "profileTitle",
        path: about?.path,
        searchText: about ? about.body.toLowerCase() : undefined,
      },
      {
        kind: "branch",
        id: "experience",
        icon: History,
        titleKey: "experienceTitle",
        items: getExperience(language).map((doc) => {
          const itemLabel = label(doc, "role");
          return { path: doc.path, label: itemLabel, searchText: searchTextFor(doc, itemLabel, "skills") };
        }),
      },
      {
        kind: "branch",
        id: "projects",
        icon: FolderKanban,
        titleKey: "projectsTitle",
        items: getProjects(language).map((doc) => {
          const itemLabel = label(doc, "title");
          return { path: doc.path, label: itemLabel, searchText: searchTextFor(doc, itemLabel, "stack") };
        }),
      },
      {
        kind: "leaf",
        id: "skills",
        icon: Sparkles,
        titleKey: "skillsTitle",
        path: skills?.path,
        searchText: skills ? skills.body.toLowerCase() : undefined,
      },
      {
        kind: "branch",
        id: "education",
        icon: GraduationCap,
        titleKey: "educationTitle",
        items: getEducation(language).map((doc) => {
          const itemLabel = label(doc, "degree");
          return { path: doc.path, label: itemLabel, searchText: searchTextFor(doc, itemLabel) };
        }),
      },
    ];
  }, [language]);

  const trimmedQuery = query.trim().toLowerCase();

  const searchResults = useMemo<SearchResult[]>(() => {
    if (!trimmedQuery) return [];
    const results: SearchResult[] = [];
    for (const category of categories) {
      if (category.kind === "leaf") {
        if (category.path && category.searchText?.includes(trimmedQuery)) {
          results.push({ path: category.path, label: t(category.titleKey), icon: category.icon, titleKey: category.titleKey });
        }
        continue;
      }
      for (const item of category.items) {
        if (item.searchText.includes(trimmedQuery)) {
          results.push({ path: item.path, label: item.label, icon: category.icon, titleKey: category.titleKey });
        }
      }
    }
    return results;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categories, trimmedQuery]);

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
    onOpenDoc(path);
    if (isMobile) setMobileOpen(false);
  }

  const panel = (
    <nav className="kb-explorer__panel" aria-label={t("knowledgeExplorerTitle")}>
      <div className="kb-explorer__header">{t("knowledgeExplorerTitle")}</div>

      <div className="kb-explorer__search">
        <Search size={13} strokeWidth={1.8} />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t("knowledgeExplorerSearchPlaceholder")}
        />
      </div>

      {trimmedQuery ? (
        <ul className="kb-explorer__list">
          {searchResults.length === 0 && (
            <li className="kb-explorer__empty">{t("knowledgeExplorerNoResults")}</li>
          )}
          {searchResults.map((result) => {
            const Icon = result.icon;
            return (
              <li key={result.path}>
                <button
                  type="button"
                  className={`kb-explorer__row kb-explorer__row--item ${
                    result.path === activePath ? "kb-explorer__row--active" : ""
                  }`}
                  onClick={() => handleOpen(result.path)}
                >
                  <Icon size={14} strokeWidth={1.7} />
                  <span>{result.label}</span>
                </button>
              </li>
            );
          })}
        </ul>
      ) : (
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
      )}
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
