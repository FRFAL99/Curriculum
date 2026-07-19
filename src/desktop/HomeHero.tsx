import { ArrowRight, FileText, FolderKanban } from "lucide-react";
import { getAbout } from "../lib/knowledgeBase";
import { useLanguage } from "../context/useLanguage";
import "./HomeHero.css";

/**
 * Intestazione della landing (Home). Nome/ruolo/disponibilità arrivano da
 * `knowledge-base/about.<lang>.md`, così restano allineati con CV e AI.
 * Le CTA cambiano tab tramite `onNavigate`.
 */
export function HomeHero({
  onNavigate,
}: {
  onNavigate: (tab: "resume" | "projects") => void;
}) {
  const { language, t } = useLanguage();
  const about = getAbout(language);
  const fm = about?.frontmatter;

  return (
    <header className="home-hero">
      {fm?.availability && (
        <span className="home-hero__availability">
          <span className="home-hero__dot" aria-hidden="true" />
          {fm.availability}
        </span>
      )}
      <h1 className="home-hero__name">{fm?.name}</h1>
      <p className="home-hero__role">{fm?.role}</p>

      <div className="home-hero__cta">
        <button
          type="button"
          className="home-hero__btn home-hero__btn--primary"
          onClick={() => onNavigate("resume")}
        >
          <FileText size={15} strokeWidth={1.8} />
          <span>{t("heroCtaResume")}</span>
          <ArrowRight size={14} strokeWidth={1.8} />
        </button>
        <button
          type="button"
          className="home-hero__btn"
          onClick={() => onNavigate("projects")}
        >
          <FolderKanban size={15} strokeWidth={1.8} />
          <span>{t("heroCtaProjects")}</span>
        </button>
      </div>
    </header>
  );
}
