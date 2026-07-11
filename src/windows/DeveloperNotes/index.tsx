import { useLanguage } from "../../context/useLanguage";
import { Terminal, Calendar, Award } from "lucide-react";
import "./DeveloperNotes.css";

export function DeveloperNotesWindow() {
  const { t } = useLanguage();

  const notes = [
    {
      id: "note-1",
      logId: "LOG-041",
      title: t("note1Title"),
      body: t("note1Body"),
      date: "Nov 2023",
      status: "RESOLVED",
      statusType: "success",
    },
    {
      id: "note-2",
      logId: "LOG-028",
      title: t("note2Title"),
      body: t("note2Body"),
      date: "Feb 2023",
      status: "COMPLETED",
      statusType: "info",
    },
  ];

  return (
    <div className="developer-notes-window">
      <div className="dev-notes__intro">
        <Terminal size={14} className="dev-notes__intro-icon" />
        <p>{t("devNotesIntro")}</p>
      </div>

      <div className="dev-notes__list">
        {notes.map((note) => (
          <div key={note.id} className="dev-note-card">
            <header className="dev-note-card__header">
              <div className="dev-note-card__meta">
                <span className="dev-note-card__log-id">{note.logId}</span>
                <span className="dev-note-card__divider">·</span>
                <span className="dev-note-card__date">
                  <Calendar size={10} style={{ marginRight: 4 }} />
                  {note.date}
                </span>
              </div>
              <span className={`dev-note-card__status dev-note-card__status--${note.statusType}`}>
                {note.status}
              </span>
            </header>

            <h3 className="dev-note-card__title">{note.title}</h3>
            <p className="dev-note-card__body">{note.body}</p>

            <div className="dev-note-card__footer">
              <Award size={12} className="dev-note-card__footer-icon" />
              <span>Production Grade Solution</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
