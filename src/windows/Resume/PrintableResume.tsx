import { useLanguage } from "../../context/useLanguage";
import "./PrintableResume.css";

export function PrintableResume() {
  const { t, language } = useLanguage();

  return (
    <div className="pdf-layout">
      <div className="pdf-container">
        <header className="pdf-header">
          <h1 className="pdf-name">Francesco Fallavena</h1>
          <p className="pdf-title">{t("title")}</p>
        </header>

        <div className="pdf-profile">{t("profile")}</div>

        <div className="pdf-content">
          <aside className="pdf-sidebar">
            <section className="pdf-section">
              <h2 className="pdf-section-title">
                {language === "it" ? "CONTATTI" : "CONTACTS"}
              </h2>
              <div className="pdf-contact-info">
                <div className="pdf-contact-item">francesco.fallavena@gmail.com</div>
                <div className="pdf-contact-item">(+39) 320 878 7258</div>
                <div className="pdf-contact-item">Pieve di Cento (BO), Italia</div>
                <div className="pdf-contact-item">github.com/FRFAL99</div>
                <div className="pdf-contact-item">linkedin.com/in/francesco-fallavena</div>
              </div>
            </section>

            <section className="pdf-section">
              <h2 className="pdf-section-title">{t("skillsTitle").toUpperCase()}</h2>
              <div className="pdf-skills-category">
                <h4>{t("skillsLang")}</h4>
                <div className="pdf-skills-list">C#, JavaScript, SQL, HTML</div>
              </div>
              <div className="pdf-skills-category">
                <h4>{t("skillsFramework")}</h4>
                <div className="pdf-skills-list">.NET, React, Azure</div>
              </div>
              <div className="pdf-skills-category">
                <h4>{t("skillsCloud")}</h4>
                <div className="pdf-skills-list">
                  Logic Apps, Function Apps, AKS, Blob Storage, App Insights
                </div>
              </div>
              <div className="pdf-skills-category">
                <h4>{t("skillsDatabase")}</h4>
                <div className="pdf-skills-list">
                  SQL Server, Oracle, Git, Visual Studio, Azure DevOps, Postman
                </div>
              </div>
              <div className="pdf-skills-category">
                <h4>{t("skillsMethodology")}</h4>
                <div className="pdf-skills-list">Agile/Scrum, CI/CD, DevOps</div>
              </div>
              <div className="pdf-skills-category">
                <h4>{t("skillsAI")}</h4>
                <div className="pdf-skills-list">GitHub Copilot, Claude, ChatGPT</div>
              </div>
            </section>

            <section className="pdf-section">
              <h2 className="pdf-section-title">{t("educationTitle").toUpperCase()}</h2>
              <div className="pdf-education-item">
                <div className="pdf-degree">{t("degree1")}</div>
                <div className="pdf-institution">Università degli Studi di Ferrara</div>
                <div className="pdf-grade">
                  {language === "it" ? "Sett 2018 - Mar 2022" : "Sept 2018 - Mar 2022"} | Voto: 96/110
                </div>
                <div className="pdf-thesis">{t("thesis")}</div>
              </div>
              <div className="pdf-education-item">
                <div className="pdf-degree">{t("degree2")}</div>
                <div className="pdf-institution">ISIT Bassi-Burgatti, Cento</div>
                <div className="pdf-grade">
                  {language === "it" ? "Sett 2013 - Giu 2018" : "Sept 2013 - Jun 2018"} | Voto: 88/100
                </div>
              </div>
            </section>
          </aside>

          <main className="pdf-main">
            <section className="pdf-section">
              <h2 className="pdf-section-title">
                {t("experienceTitle").toUpperCase()}
              </h2>
              <div className="pdf-experience-item">
                <div className="pdf-job-header">
                  <div>
                    <div className="pdf-job-title">Software Engineer</div>
                    <div className="pdf-company">Xtel</div>
                  </div>
                  <div className="pdf-date">
                    {language === "it" ? "Giugno 2022" : "June 2022"} - {t("present")}
                  </div>
                </div>
                <div
                  className="pdf-job-description"
                  dangerouslySetInnerHTML={{ __html: t("jobDesc") }}
                />
                <ul className="pdf-responsibilities">
                  <li dangerouslySetInnerHTML={{ __html: t("resp1") }} />
                  <li dangerouslySetInnerHTML={{ __html: t("resp2") }} />
                  <li dangerouslySetInnerHTML={{ __html: t("resp3") }} />
                  <li dangerouslySetInnerHTML={{ __html: t("resp5") }} />
                  <li dangerouslySetInnerHTML={{ __html: t("resp6") }} />
                  <li dangerouslySetInnerHTML={{ __html: t("resp7") }} />
                </ul>
              </div>
            </section>

            <section className="pdf-section">
              <h2 className="pdf-section-title">{t("projectsTitle").toUpperCase()}</h2>
              <div className="pdf-experience-item">
                <div className="pdf-job-header">
                  <div>
                    <div className="pdf-job-title">Antichità Fallavena</div>
                    <div className="pdf-company">antichitafallavena.com</div>
                  </div>
                </div>
                <div
                  className="pdf-job-description"
                  dangerouslySetInnerHTML={{ __html: t("project1Desc") }}
                />
              </div>
            </section>

            <section className="pdf-section">
              <h2 className="pdf-section-title">
                {t("additionalExpTitle").toUpperCase()}
              </h2>
              <div className="pdf-experience-item">
                <div className="pdf-job-header">
                  <div>
                    <div className="pdf-job-title">Tutor di Matematica</div>
                    <div className="pdf-company">ISIT Bassi-Burgatti</div>
                  </div>
                  <div className="pdf-date">
                    {language === "it" ? "Marzo 2021 - Aprile 2021" : "March 2021 - April 2021"}
                  </div>
                </div>
                <div className="pdf-job-description">{t("tutorDesc")}</div>
              </div>
            </section>

            <section className="pdf-section">
              <h2 className="pdf-section-title">
                {t("softSkillsTitle").toUpperCase()}
              </h2>
              <ul className="pdf-soft-skills">
                <li dangerouslySetInnerHTML={{ __html: t("soft1") }} />
                <li dangerouslySetInnerHTML={{ __html: t("soft2") }} />
                <li dangerouslySetInnerHTML={{ __html: t("soft3") }} />
                <li dangerouslySetInnerHTML={{ __html: t("soft4") }} />
              </ul>
            </section>

            <div className="pdf-right-info">
              <section className="pdf-section">
                <h2 className="pdf-section-title">
                  {t("languagesTitle").toUpperCase()}
                </h2>
                <div className="pdf-languages-horizontal">
                  <div className="pdf-language-box">
                    <span className="pdf-language-name">{t("italian")}</span>
                    <span className="pdf-language-level">{t("motherTongue")}</span>
                  </div>
                  <div className="pdf-language-box">
                    <span className="pdf-language-name">{t("english")}</span>
                    <span className="pdf-language-level">
                      {language === "it" ? "Professionale" : "Professional"}
                    </span>
                  </div>
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
