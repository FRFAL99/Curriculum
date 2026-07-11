import { useLanguage } from "../../context/useLanguage";
import { Download, Mail, Phone, MapPin } from "lucide-react";
import { GithubIcon, LinkedinIcon } from "../../components/SocialIcons";
import { getAbout, getContacts, getSocials, getExperience, getEducation } from "../../lib/knowledgeBase";
import { renderInline } from "../../lib/markdown";
import "./Resume.css";

export function ResumeWindow() {
  const { t, language } = useLanguage();

  const about = getAbout(language);
  const contacts = getContacts();
  const socials = getSocials();
  const experience = getExperience(language);
  const education = getEducation(language);
  const mainJob = experience[0];
  const additionalJob = experience[1];

  const handleDownload = () => {
    window.print();
  };

  return (
    <div className="resume-window">
      {/* Action Header */}
      <div className="resume-window__actions">
        <button className="resume-window__btn" onClick={handleDownload}>
          <Download size={16} />
          <span>{t("download")}</span>
        </button>
      </div>

      {/* CV Grid Layout */}
      <div className="resume-window__grid">
        {/* Left column / Sidebar */}
        <aside className="resume-window__sidebar">
          {/* Hero */}
          <div className="resume-window__hero">
            <h1 className="resume-window__name">{about?.frontmatter.name}</h1>
            <p className="resume-window__title">{about?.frontmatter.role}</p>
          </div>

          {/* Contact Info */}
          <section className="resume-window__section">
            <h2 className="resume-window__section-title">{t("contactTitle")}</h2>
            <ul className="resume-window__contacts">
              <li>
                <Mail size={14} className="resume-window__icon" />
                <a href={`mailto:${contacts?.frontmatter.email}`}>{contacts?.frontmatter.email}</a>
              </li>
              <li>
                <Phone size={14} className="resume-window__icon" />
                <a href={`tel:${contacts?.frontmatter.phoneHref}`}>{contacts?.frontmatter.phone}</a>
              </li>
              <li>
                <MapPin size={14} className="resume-window__icon" />
                <span>{contacts?.frontmatter.location}</span>
              </li>
              <li>
                <GithubIcon width={14} height={14} className="resume-window__icon" />
                <a href={socials?.frontmatter.github} target="_blank" rel="noopener noreferrer">
                  {socials?.frontmatter.githubLabel}
                </a>
              </li>
              <li>
                <LinkedinIcon width={14} height={14} className="resume-window__icon" />
                <a href={socials?.frontmatter.linkedin} target="_blank" rel="noopener noreferrer">
                  {socials?.frontmatter.linkedinLabel}
                </a>
              </li>
            </ul>
          </section>

          {/* Languages */}
          <section className="resume-window__section">
            <h2 className="resume-window__section-title">{t("languagesTitle")}</h2>
            <div className="resume-window__lang-list">
              {about?.frontmatter.languages.map((l) => (
                <div className="resume-window__lang-item" key={l.name}>
                  <span className="resume-window__lang-name">{l.name}</span>
                  <span className="resume-window__lang-level">{l.level}</span>
                </div>
              ))}
            </div>
          </section>

          {/* Relocation Availability */}
          <div className="resume-window__availability">
            {about?.frontmatter.availability}
          </div>
        </aside>

        {/* Right column / Main Content */}
        <main className="resume-window__main">
          {/* Profile */}
          <section className="resume-window__section">
            <h2 className="resume-window__section-title">{t("profileTitle")}</h2>
            <p className="resume-window__text">{about?.body}</p>
          </section>

          {/* Experience */}
          <section className="resume-window__section">
            <h2 className="resume-window__section-title">{t("experienceTitle")}</h2>
            {mainJob && (
              <div className="resume-window__exp-item">
                <div className="resume-window__exp-header">
                  <div>
                    <h3 className="resume-window__exp-role">{mainJob.frontmatter.role}</h3>
                    <span className="resume-window__exp-company">{mainJob.frontmatter.company}</span>
                  </div>
                  <span className="resume-window__exp-date">
                    {mainJob.frontmatter.dateStart} - {mainJob.frontmatter.dateEnd ?? t("present")}
                  </span>
                </div>
                <p
                  className="resume-window__exp-desc"
                  dangerouslySetInnerHTML={{ __html: renderInline(mainJob.body) }}
                />
                <ul className="resume-window__exp-resps">
                  {mainJob.frontmatter.responsibilities.map((resp) => (
                    <li key={resp} dangerouslySetInnerHTML={{ __html: renderInline(resp) }} />
                  ))}
                </ul>
              </div>
            )}
          </section>

          {/* Education */}
          <section className="resume-window__section">
            <h2 className="resume-window__section-title">{t("educationTitle")}</h2>
            {education.map((edu) => (
              <div className="resume-window__edu-item" key={edu.slug}>
                <div className="resume-window__edu-header">
                  <h3 className="resume-window__edu-degree">{edu.frontmatter.degree}</h3>
                  <span className="resume-window__edu-date">
                    {edu.frontmatter.dateStart} - {edu.frontmatter.dateEnd}
                  </span>
                </div>
                <p className="resume-window__edu-inst">
                  {edu.frontmatter.institution} | {t("gradeLabel")}: {edu.frontmatter.grade}
                </p>
                {edu.body && <p className="resume-window__edu-thesis">{edu.body}</p>}
              </div>
            ))}
          </section>

          {/* Additional Experience */}
          <section className="resume-window__section">
            <h2 className="resume-window__section-title">{t("additionalExpTitle")}</h2>
            {additionalJob && (
              <div className="resume-window__exp-item">
                <div className="resume-window__exp-header">
                  <div>
                    <h3 className="resume-window__exp-role">{additionalJob.frontmatter.role}</h3>
                    <span className="resume-window__exp-company">{additionalJob.frontmatter.company}</span>
                  </div>
                  <span className="resume-window__exp-date">
                    {additionalJob.frontmatter.dateStart} - {additionalJob.frontmatter.dateEnd}
                  </span>
                </div>
                <p className="resume-window__exp-desc">{additionalJob.body}</p>
              </div>
            )}
          </section>

          {/* Soft Skills */}
          <section className="resume-window__section">
            <h2 className="resume-window__section-title">{t("softSkillsTitle")}</h2>
            <ul className="resume-window__exp-resps">
              {about?.frontmatter.softSkills.map((skill) => (
                <li key={skill} dangerouslySetInnerHTML={{ __html: renderInline(skill) }} />
              ))}
            </ul>
          </section>
        </main>
      </div>

      <footer className="resume-window__footer">{t("footer")}</footer>
    </div>
  );
}
