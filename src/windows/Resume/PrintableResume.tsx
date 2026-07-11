import { useLanguage } from "../../context/useLanguage";
import {
  getAbout,
  getContacts,
  getSocials,
  getSkills,
  getEducation,
  getExperience,
  getProjects,
} from "../../lib/knowledgeBase";
import { renderInline } from "../../lib/markdown";
import "./PrintableResume.css";

export function PrintableResume() {
  const { t, language } = useLanguage();

  const about = getAbout(language);
  const contacts = getContacts();
  const socials = getSocials();
  const skills = getSkills();
  const education = getEducation(language);
  const experience = getExperience(language);
  const projects = getProjects(language);
  const mainJob = experience[0];
  const additionalJob = experience[1];
  const mainProject = projects[0];

  // Il layout di stampa mostra una selezione più corta delle responsabilità
  // (già così nella versione pre-Fase 8, per stare su una pagina).
  const printedResponsibilities = (mainJob?.frontmatter.responsibilities ?? []).filter(
    (_, i) => [0, 1, 2, 4, 5, 6].includes(i)
  );

  return (
    <div className="pdf-layout">
      <div className="pdf-container">
        <header className="pdf-header">
          <h1 className="pdf-name">{about?.frontmatter.name}</h1>
          <p className="pdf-title">{about?.frontmatter.role}</p>
        </header>

        <div className="pdf-profile">{about?.body}</div>

        <div className="pdf-content">
          <aside className="pdf-sidebar">
            <section className="pdf-section">
              <h2 className="pdf-section-title">
                {language === "it" ? "CONTATTI" : "CONTACTS"}
              </h2>
              <div className="pdf-contact-info">
                <div className="pdf-contact-item">{contacts?.frontmatter.email}</div>
                <div className="pdf-contact-item">{contacts?.frontmatter.phone}</div>
                <div className="pdf-contact-item">{contacts?.frontmatter.location}</div>
                <div className="pdf-contact-item">{socials?.frontmatter.githubLabel}</div>
                <div className="pdf-contact-item">{socials?.frontmatter.linkedinLabel}</div>
              </div>
            </section>

            <section className="pdf-section">
              <h2 className="pdf-section-title">{t("skillsTitle").toUpperCase()}</h2>
              {skills?.frontmatter.categories.map((cat) => (
                <div className="pdf-skills-category" key={cat.key}>
                  <h4>{cat.labels[language]}</h4>
                  <div className="pdf-skills-list">{cat.skills.join(", ")}</div>
                </div>
              ))}
            </section>

            <section className="pdf-section">
              <h2 className="pdf-section-title">{t("educationTitle").toUpperCase()}</h2>
              {education.map((edu) => (
                <div className="pdf-education-item" key={edu.slug}>
                  <div className="pdf-degree">{edu.frontmatter.degree}</div>
                  <div className="pdf-institution">{edu.frontmatter.institution}</div>
                  <div className="pdf-grade">
                    {edu.frontmatter.dateStart} - {edu.frontmatter.dateEnd} | {t("gradeLabel")}:{" "}
                    {edu.frontmatter.grade}
                  </div>
                  {edu.body && <div className="pdf-thesis">{edu.body}</div>}
                </div>
              ))}
            </section>
          </aside>

          <main className="pdf-main">
            <section className="pdf-section">
              <h2 className="pdf-section-title">{t("experienceTitle").toUpperCase()}</h2>
              {mainJob && (
                <div className="pdf-experience-item">
                  <div className="pdf-job-header">
                    <div>
                      <div className="pdf-job-title">{mainJob.frontmatter.role}</div>
                      <div className="pdf-company">{mainJob.frontmatter.company}</div>
                    </div>
                    <div className="pdf-date">
                      {mainJob.frontmatter.dateStart} - {mainJob.frontmatter.dateEnd ?? t("present")}
                    </div>
                  </div>
                  <div
                    className="pdf-job-description"
                    dangerouslySetInnerHTML={{ __html: renderInline(mainJob.body) }}
                  />
                  <ul className="pdf-responsibilities">
                    {printedResponsibilities.map((resp) => (
                      <li key={resp} dangerouslySetInnerHTML={{ __html: renderInline(resp) }} />
                    ))}
                  </ul>
                </div>
              )}
            </section>

            <section className="pdf-section">
              <h2 className="pdf-section-title">{t("projectsTitle").toUpperCase()}</h2>
              {mainProject && (
                <div className="pdf-experience-item">
                  <div className="pdf-job-header">
                    <div>
                      <div className="pdf-job-title">{mainProject.frontmatter.title}</div>
                      <div className="pdf-company">
                        {mainProject.frontmatter.demoUrl !== "#" ? mainProject.frontmatter.demoUrl : ""}
                      </div>
                    </div>
                  </div>
                  <div
                    className="pdf-job-description"
                    dangerouslySetInnerHTML={{ __html: renderInline(mainProject.body) }}
                  />
                </div>
              )}
            </section>

            <section className="pdf-section">
              <h2 className="pdf-section-title">{t("additionalExpTitle").toUpperCase()}</h2>
              {additionalJob && (
                <div className="pdf-experience-item">
                  <div className="pdf-job-header">
                    <div>
                      <div className="pdf-job-title">{additionalJob.frontmatter.role}</div>
                      <div className="pdf-company">{additionalJob.frontmatter.company}</div>
                    </div>
                    <div className="pdf-date">
                      {additionalJob.frontmatter.dateStart} - {additionalJob.frontmatter.dateEnd}
                    </div>
                  </div>
                  <div className="pdf-job-description">{additionalJob.body}</div>
                </div>
              )}
            </section>

            <section className="pdf-section">
              <h2 className="pdf-section-title">{t("softSkillsTitle").toUpperCase()}</h2>
              <ul className="pdf-soft-skills">
                {about?.frontmatter.softSkills.map((skill) => (
                  <li key={skill} dangerouslySetInnerHTML={{ __html: renderInline(skill) }} />
                ))}
              </ul>
            </section>

            <div className="pdf-right-info">
              <section className="pdf-section">
                <h2 className="pdf-section-title">{t("languagesTitle").toUpperCase()}</h2>
                <div className="pdf-languages-horizontal">
                  {about?.frontmatter.languages.map((l) => (
                    <div className="pdf-language-box" key={l.name}>
                      <span className="pdf-language-name">{l.name}</span>
                      <span className="pdf-language-level">{l.level}</span>
                    </div>
                  ))}
                </div>
              </section>
            </div>
          </main>
        </div>

        <footer className="pdf-footer">{t("footer")}</footer>
      </div>
    </div>
  );
}
