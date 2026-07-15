import { getAllDocs, type KnowledgeDoc } from "../../lib/knowledgeBase";
import { renderBlock, getReadingTime } from "../../lib/markdown";
import { useLanguage } from "../../context/useLanguage";
import type { TranslationKey } from "../../context/translations";
import "./KnowledgeDocument.css";

interface KnowledgeDocumentPayload {
  path?: string;
}

const TYPE_LABEL_KEY: Record<string, TranslationKey> = {
  about: "profileTitle",
  experience: "experienceTitle",
  project: "projectsTitle",
  skills: "skillsTitle",
  education: "educationTitle",
  "developer-note": "developerNotesTitle",
};

const TAG_FIELD: Record<string, string> = {
  project: "stack",
  experience: "skills",
};

const TITLE_FIELD: Record<string, string> = {
  experience: "role",
  education: "degree",
  about: "name",
};

function getTitle(doc: KnowledgeDoc): string {
  const field = TITLE_FIELD[doc.type] ?? "title";
  const value = (doc.frontmatter as Record<string, unknown>)[field];
  return typeof value === "string" ? value : doc.slug;
}

function getTags(doc: KnowledgeDoc): string[] | undefined {
  const field = TAG_FIELD[doc.type];
  if (!field) return undefined;
  const value = (doc.frontmatter as Record<string, unknown>)[field];
  return Array.isArray(value) ? value.filter((v): v is string => typeof v === "string") : undefined;
}

export function KnowledgeDocumentWindow({ payload }: { payload?: unknown }) {
  const { t } = useLanguage();
  const { path } = (payload ?? {}) as KnowledgeDocumentPayload;
  const doc = path ? getAllDocs().find((d) => d.path === path) : undefined;

  if (!doc) {
    return (
      <div className="kb-doc-window">
        <p className="kb-doc-window__missing">Documento non trovato.</p>
      </div>
    );
  }

  const fm = doc.frontmatter as Record<string, unknown>;
  const period =
    typeof fm.date === "string"
      ? fm.date
      : typeof fm.dateStart === "string"
        ? `${fm.dateStart} – ${typeof fm.dateEnd === "string" ? fm.dateEnd : t("present")}`
        : undefined;
  const tags = getTags(doc);
  const readingTime = getReadingTime(doc.body);
  const typeLabelKey = TYPE_LABEL_KEY[doc.type];

  return (
    <div className="kb-doc-window">
      <h1 className="kb-doc-window__title">{getTitle(doc)}</h1>

      <div className="kb-doc-window__meta">
        {typeLabelKey && <span className="kb-doc-window__badge">{t(typeLabelKey)}</span>}
        {period && <span className="kb-doc-window__meta-item">{period}</span>}
        <span className="kb-doc-window__meta-item">
          {readingTime} {t("readingTimeSuffix")}
        </span>
      </div>

      {tags && tags.length > 0 && (
        <div className="kb-doc-window__tags">
          {tags.map((tag) => (
            <span key={tag} className="kb-doc-window__tag">
              {tag}
            </span>
          ))}
        </div>
      )}

      <div
        className="kb-doc-window__body"
        dangerouslySetInnerHTML={{ __html: renderBlock(doc.body) }}
      />
      <footer className="kb-doc-window__source">📄 {doc.path}</footer>
    </div>
  );
}
