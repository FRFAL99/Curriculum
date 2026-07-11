import { useLanguage } from "../../context/useLanguage";
import { Terminal, Calendar, Award } from "lucide-react";
import { getDeveloperNotes } from "../../lib/knowledgeBase";
import "./DeveloperNotes.css";

export function DeveloperNotesWindow() {
  const { t, language } = useLanguage();
  const notes = getDeveloperNotes(language);

  return (
    <div className="developer-notes-window">
      <div className="dev-notes__intro">
        <Terminal size={14} className="dev-notes__intro-icon" />
        <p>{t("devNotesIntro")}</p>
      </div>

      <div className="dev-notes__list">
        {notes.map((note) => {
          const statusType = note.frontmatter.status === "RESOLVED" ? "success" : "info";

          return (
            <div key={note.slug} className="dev-note-card">
              <header className="dev-note-card__header">
                <div className="dev-note-card__meta">
                  <span className="dev-note-card__log-id">{note.frontmatter.logId}</span>
                  <span className="dev-note-card__divider">·</span>
                  <span className="dev-note-card__date">
                    <Calendar size={10} style={{ marginRight: 4 }} />
                    {note.frontmatter.date}
                  </span>
                </div>
                <span className={`dev-note-card__status dev-note-card__status--${statusType}`}>
                  {note.frontmatter.status}
                </span>
              </header>

              <h3 className="dev-note-card__title">{note.frontmatter.title}</h3>
              <p className="dev-note-card__body">{note.body}</p>

              <div className="dev-note-card__footer">
                <Award size={12} className="dev-note-card__footer-icon" />
                <span>Production Grade Solution</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
