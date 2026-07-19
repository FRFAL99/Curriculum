import { ArrowLeft } from "lucide-react";
import { getAllDocs, type KnowledgeDoc } from "../lib/knowledgeBase";
import { renderBlock, getReadingTime } from "../lib/markdown";
import { useLanguage } from "../context/useLanguage";
import type { TranslationKey } from "../context/translations";
import "./DocumentDetail.css";

/**
 * Visualizzatore documento a tutta pagina (master/detail inline), riusato
 * dal tab Projects e dalla Knowledge Base della Home. Sostituisce la vecchia
 * finestra `KnowledgeDocumentWindow`: stessa logica di rendering (frontmatter
 * → titolo/tag/periodo + body markdown), ma senza window manager.
 */

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

export function DocumentDetail({ path, onBack }: { path: string; onBack: () => void }) {
  const { t } = useLanguage();
  const doc = getAllDocs().find((d) => d.path === path);

  return (
    <article className="doc-detail">
      <button type="button" className="doc-detail__back" onClick={onBack}>
        <ArrowLeft size={14} strokeWidth={1.8} />
        <span>{t("docDetailBack")}</span>
      </button>

      {!doc ? (
        <p className="doc-detail__missing">Documento non trovato.</p>
      ) : (
        <DocumentBody doc={doc} />
      )}
    </article>
  );
}

function DocumentBody({ doc }: { doc: KnowledgeDoc }) {
  const { t } = useLanguage();
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
    <>
      <h1 className="doc-detail__title">{getTitle(doc)}</h1>

      <div className="doc-detail__meta">
        {typeLabelKey && <span className="doc-detail__badge">{t(typeLabelKey)}</span>}
        {period && <span className="doc-detail__meta-item">{period}</span>}
        <span className="doc-detail__meta-item">
          {readingTime} {t("readingTimeSuffix")}
        </span>
      </div>

      {tags && tags.length > 0 && (
        <div className="doc-detail__tags">
          {tags.map((tag) => (
            <span key={tag} className="doc-detail__tag">
              {tag}
            </span>
          ))}
        </div>
      )}

      <div
        className="doc-detail__body"
        dangerouslySetInnerHTML={{ __html: renderBlock(doc.body) }}
      />
      <footer className="doc-detail__source">📄 {doc.path}</footer>
    </>
  );
}
