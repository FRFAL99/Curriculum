import { useLanguage } from "../../context/useLanguage";
import { getProjects } from "../../lib/knowledgeBase";
import { renderInline } from "../../lib/markdown";
import { ExternalLink, Code } from "lucide-react";
import { GithubIcon } from "../../components/SocialIcons";
import "./Projects.css";

export function ProjectsWindow() {
  const { language } = useLanguage();
  const projects = getProjects(language);

  return (
    <div className="projects-window">
      <div className="projects-grid">
        {projects.map((proj) => {
          const { title, image, demoUrl, githubUrl, stack } = proj.frontmatter;

          return (
            <article key={proj.slug} className="project-card">
              {/* Image Preview Container */}
              <div className="project-card__image-container">
                <img
                  src={image}
                  alt={`${title} Preview`}
                  className="project-card__image"
                  loading="lazy"
                />
              </div>

              {/* Text details */}
              <div className="project-card__details">
                <header className="project-card__header">
                  <h3 className="project-card__title">{title}</h3>
                  <div className="project-card__links">
                    {githubUrl && (
                      <a
                        href={githubUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="project-card__link"
                        title="GitHub Repository"
                      >
                        <GithubIcon width={16} height={16} />
                      </a>
                    )}
                    {demoUrl && demoUrl !== "#" && (
                      <a
                        href={demoUrl}
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
                  dangerouslySetInnerHTML={{ __html: renderInline(proj.body) }}
                />

                {/* Tech Stack badges */}
                <div className="project-card__footer">
                  <Code size={12} className="project-card__footer-icon" />
                  <div className="project-card__tags">
                    {stack.map((tag) => (
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
