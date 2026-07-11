import { useLanguage } from "../../context/useLanguage";
import projectsData from "../../data/projects.json";
import { ExternalLink, Code } from "lucide-react";
import { GithubIcon } from "../../components/SocialIcons";
import "./Projects.css";

interface Project {
  id: string;
  title: string;
  stack: string[];
  image: string;
  demoUrl: string;
  githubUrl: string;
  description: {
    it: string;
    en: string;
  };
}

export function ProjectsWindow() {
  const { language } = useLanguage();
  const projects = projectsData as Project[];

  return (
    <div className="projects-window">
      <div className="projects-grid">
        {projects.map((proj) => {
          const desc = language === "it" ? proj.description.it : proj.description.en;

          return (
            <article key={proj.id} className="project-card">
              {/* Image Preview Container */}
              <div className="project-card__image-container">
                <img
                  src={proj.image}
                  alt={`${proj.title} Preview`}
                  className="project-card__image"
                  loading="lazy"
                />
              </div>

              {/* Text details */}
              <div className="project-card__details">
                <header className="project-card__header">
                  <h3 className="project-card__title">{proj.title}</h3>
                  <div className="project-card__links">
                    {proj.githubUrl && (
                      <a
                        href={proj.githubUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="project-card__link"
                        title="GitHub Repository"
                      >
                        <GithubIcon width={16} height={16} />
                      </a>
                    )}
                    {proj.demoUrl && proj.demoUrl !== "#" && (
                      <a
                        href={proj.demoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="project-card__link"
                        title="Live Demo"
                      >
                        <ExternalLink size={16} />
                      </a>
                    )}
                  </div>
                </header>

                <p
                  className="project-card__desc"
                  dangerouslySetInnerHTML={{ __html: desc }}
                />

                {/* Tech Stack badges */}
                <div className="project-card__footer">
                  <Code size={12} className="project-card__footer-icon" />
                  <div className="project-card__tags">
                    {proj.stack.map((tag) => (
                      <span key={tag} className="project-card__tag">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
