import { useLanguage } from "../../context/useLanguage";
import { Briefcase, Calendar, Code } from "lucide-react";
import "./Experience.css";

export function ExperienceWindow() {
  const { t, language } = useLanguage();

  const experiences = [
    {
      id: "xtel",
      role: "Software Engineer",
      company: "Xtel",
      period: `Giugno 2022 - ${t("present")}`,
      periodEn: `June 2022 - ${t("present")}`,
      desc: t("jobDesc"),
      skills: ["C#", ".NET", "React", "Azure", "AKS", "SQL Server", "Oracle", "DevOps"],
      responsibilities: [
        t("resp1"),
        t("resp2"),
        t("resp3"),
        t("resp4"),
        t("resp5"),
        t("resp6"),
        t("resp7"),
        t("resp8"),
      ],
      isCurrent: true,
    },
    {
      id: "tutor",
      role: "Tutor di Matematica",
      company: "ISIT Bassi-Burgatti",
      period: "Marzo 2021 - Aprile 2021",
      periodEn: "March 2021 - April 2021",
      desc: t("tutorDesc"),
      skills: ["Matematica", "Insegnamento", "Didattica a distanza"],
      responsibilities: [],
      isCurrent: false,
    },
  ];

  return (
    <div className="experience-window">
      <div className="timeline">
        {experiences.map((exp) => (
          <div key={exp.id} className="timeline__item">
            {/* Timeline node icon */}
            <div className={`timeline__node ${exp.isCurrent ? "timeline__node--current" : ""}`}>
              <Briefcase size={14} />
            </div>

            {/* Content card */}
            <div className="timeline__content">
              <div className="timeline__header">
                <div>
                  <h3 className="timeline__role">{exp.role}</h3>
                  <span className="timeline__company">{exp.company}</span>
                </div>
                <span className="timeline__date">
                  <Calendar size={12} style={{ marginRight: 4 }} />
                  {language === "it" ? exp.period : exp.periodEn}
                </span>
              </div>

              <p
                className="timeline__desc"
                dangerouslySetInnerHTML={{ __html: exp.desc }}
              />

              {exp.responsibilities.length > 0 && (
                <ul className="timeline__resps">
                  {exp.responsibilities.map((resp, i) => (
                    <li key={i} dangerouslySetInnerHTML={{ __html: resp }} />
                  ))}
                </ul>
              )}

              <div className="timeline__skills">
                <Code size={12} className="timeline__skills-icon" />
                <div className="timeline__tags">
                  {exp.skills.map((skill) => (
                    <span key={skill} className="timeline__tag">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
