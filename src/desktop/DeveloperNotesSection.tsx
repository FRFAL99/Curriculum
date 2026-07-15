import { useState } from "react";
import { ArrowLeft, Calendar, Clock } from "lucide-react";
import { getDeveloperNotes } from "../lib/knowledgeBase";
import { renderBlock, getOverviewExcerpt, getReadingTime } from "../lib/markdown";
import { useLanguage } from "../context/useLanguage";
import "./DeveloperNotesSection.css";

/**
 * Sezione "Developer Notes" a tutta pagina (tab in topbar).
 * Layout editoriale/blog: indice di articoli + lettore a colonna larga.
 * I contenuti restano file markdown sotto knowledge-base/developer-notes/,
 * quindi ogni nuovo articolo compare qui e viene ingerito dall'AI senza
 * modifiche al codice.
 */
export function DeveloperNotesSection() {
  const { t, language } = useLanguage();
  const notes = getDeveloperNotes(language);
  const [selectedSlug, setSelectedSlug] = useState<string | null>(null);

  const selected = selectedSlug
    ? notes.find((n) => n.slug === selectedSlug)
    : undefined;

  if (selected) {
    const fm = selected.frontmatter;
    const readingTime = getReadingTime(selected.body);
    return (
      <div className="dev-section">
        <article className="dev-article">
          <button
            type="button"
            className="dev-article__back"
            onClick={() => setSelectedSlug(null)}
          >
            <ArrowLeft size={14} strokeWidth={1.8} />
            <span>{t("devNotesBackToList")}</span>
          </button>

          <h1 className="dev-article__title">{fm.title}</h1>

          <div className="dev-article__meta">
            <span className="dev-article__meta-item">
              <Calendar size={12} strokeWidth={1.8} />
              {fm.date}
            </span>
            <span className="dev-article__meta-item">
              <Clock size={12} strokeWidth={1.8} />
              {readingTime} {t("readingTimeSuffix")}
            </span>
          </div>

          {fm.tags && fm.tags.length > 0 && (
            <div className="dev-article__tags">
              {fm.tags.map((tag) => (
                <span key={tag} className="dev-article__tag">
                  {tag}
                </span>
              ))}
            </div>
          )}

          <div
            className="dev-article__body"
            dangerouslySetInnerHTML={{ __html: renderBlock(selected.body) }}
          />
        </article>
      </div>
    );
  }

  return (
    <div className="dev-section">
      <div className="dev-index">
        <header className="dev-index__header">
          <h1 className="dev-index__title">{t("developerNotesTitle")}</h1>
          <p className="dev-index__intro">{t("devNotesIntro")}</p>
        </header>

        <div className="dev-index__list">
          {notes.map((note) => {
            const fm = note.frontmatter;
            const summary = fm.summary?.trim() || getOverviewExcerpt(note.body);
            const readingTime = getReadingTime(note.body);

            return (
              <button
                type="button"
                key={note.slug}
                className="dev-card"
                onClick={() => setSelectedSlug(note.slug)}
              >
                <div className="dev-card__meta">
                  <span className="dev-card__meta-item">
                    <Calendar size={11} strokeWidth={1.8} />
                    {fm.date}
                  </span>
                  <span className="dev-card__meta-item">
                    <Clock size={11} strokeWidth={1.8} />
                    {readingTime} {t("readingTimeSuffix")}
                  </span>
                </div>

                <h2 className="dev-card__title">{fm.title}</h2>
                <p className="dev-card__summary">{summary}</p>

                {fm.tags && fm.tags.length > 0 && (
                  <div className="dev-card__tags">
                    {fm.tags.map((tag) => (
                      <span key={tag} className="dev-card__tag">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
