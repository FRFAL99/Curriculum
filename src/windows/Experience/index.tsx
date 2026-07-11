import { useLanguage } from "../../context/useLanguage";
import { Briefcase, Calendar, Code } from "lucide-react";
import { getExperience } from "../../lib/knowledgeBase";
import { renderInline } from "../../lib/markdown";
import "./Experience.css";

export function ExperienceWindow() {
  const { t, language } = useLanguage();
  const experiences = getExperience(language);

  return (
    <div className="experience-window">
      <div className="timeline">
        {experiences.map((exp) => {
          const isCurrent = exp.frontmatter.dateEnd === null;

          return (
            <div key={exp.slug} className="timeline__item">
              {/* Timeline node icon */}
              <div className={`timeline__node ${isCurrent ? "timeline__node--current" : ""}`}>
                <Briefcase size={14} />
              </div>

              {/* Content card */}
              <div className="timeline__content">
                <div className="timeline__header">
                  <div>
                    <h3 className="timeline__role">{exp.frontmatter.role}</h3>
                    <span className="timeline__company">{exp.frontmatter.company}</span>
                  </div>
                  <span className="timeline__date">
                    <Calendar size={12} style={{ marginRight: 4 }} />
                    {exp.frontmatter.dateStart} - {exp.frontmatter.dateEnd ?? t("present")}
                  </span>
                </div>

                <p
                  className="timeline__desc"
                  dangerouslySetInnerHTML={{ __html: renderInline(exp.body) }}
                />

                {exp.frontmatter.responsibilities.length > 0 && (
                  <ul className="timeline__resps">
                    {exp.frontmatter.responsibilities.map((resp) => (
                      <li key={resp} dangerouslySetInnerHTML={{ __html: renderInline(resp) }} />
                    ))}
                  </ul>
                )}

                <div className="timeline__skills">
                  <Code size={12} className="timeline__skills-icon" />
                  <div className="timeline__tags">
                    {exp.frontmatter.skills.map((skill) => (
                      <span key={skill} className="timeline__tag">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
