import { useLanguage } from "../../context/useLanguage";
import { Download, Mail, Phone, MapPin } from "lucide-react";
import { GithubIcon, LinkedinIcon } from "../../components/SocialIcons";
import "./Resume.css";

export function ResumeWindow() {
  const { t } = useLanguage();

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
            <h1 className="resume-window__name">Francesco Fallavena</h1>
            <p className="resume-window__title">{t("title")}</p>
          </div>

          {/* Contact Info */}
          <section className="resume-window__section">
            <h2 className="resume-window__section-title">{t("contactTitle")}</h2>
            <ul className="resume-window__contacts">
              <li>
                <Mail size={14} className="resume-window__icon" />
                <a href="mailto:francesco.fallavena@gmail.com">francesco.fallavena@gmail.com</a>
              </li>
              <li>
                <Phone size={14} className="resume-window__icon" />
                <a href="tel:+393208787258">(+39) 320 878 7258</a>
              </li>
              <li>
                <MapPin size={14} className="resume-window__icon" />
                <span>Pieve di Cento (BO), Italia</span>
              </li>
              <li>
                <GithubIcon width={14} height={14} className="resume-window__icon" />
                <a href="https://github.com/FRFAL99" target="_blank" rel="noopener noreferrer">
                  github.com/FRFAL99
                </a>
              </li>
              <li>
                <LinkedinIcon width={14} height={14} className="resume-window__icon" />
                <a href="https://www.linkedin.com/in/francesco-fallavena" target="_blank" rel="noopener noreferrer">
                  linkedin.com/in/francesco-fallavena
                </a>
              </li>
            </ul>
          </section>

          {/* Languages */}
          <section className="resume-window__section">
            <h2 className="resume-window__section-title">{t("languagesTitle")}</h2>
            <div className="resume-window__lang-list">
              <div className="resume-window__lang-item">
                <span className="resume-window__lang-name">{t("italian")}</span>
                <span className="resume-window__lang-level">{t("motherTongue")}</span>
              </div>
              <div className="resume-window__lang-item">
                <span className="resume-window__lang-name">{t("english")}</span>
                <span className="resume-window__lang-level">{t("professionalUse")}</span>
              </div>
            </div>
          </section>

          {/* Relocation Availability */}
          <div className="resume-window__availability">
            {t("availabilityText")}
          </div>
        </aside>

        {/* Right column / Main Content */}
        <main className="resume-window__main">
          {/* Profile */}
          <section className="resume-window__section">
            <h2 className="resume-window__section-title">{t("profileTitle")}</h2>
            <p className="resume-window__text">{t("profile")}</p>
          </section>

          {/* Experience */}
          <section className="resume-window__section">
            <h2 className="resume-window__section-title">{t("experienceTitle")}</h2>
            <div className="resume-window__exp-item">
              <div className="resume-window__exp-header">
                <div>
                  <h3 className="resume-window__exp-role">Software Engineer</h3>
                  <span className="resume-window__exp-company">Xtel</span>
                </div>
                <span className="resume-window__exp-date">
                  Giugno 2022 - {t("present")}
                </span>
              </div>
              <p
                className="resume-window__exp-desc"
                dangerouslySetInnerHTML={{ __html: t("jobDesc") }}
              />
              <ul className="resume-window__exp-resps">
                <li dangerouslySetInnerHTML={{ __html: t("resp1") }} />
                <li dangerouslySetInnerHTML={{ __html: t("resp2") }} />
                <li dangerouslySetInnerHTML={{ __html: t("resp3") }} />
                <li dangerouslySetInnerHTML={{ __html: t("resp4") }} />
                <li dangerouslySetInnerHTML={{ __html: t("resp5") }} />
                <li dangerouslySetInnerHTML={{ __html: t("resp6") }} />
                <li dangerouslySetInnerHTML={{ __html: t("resp7") }} />
                <li dangerouslySetInnerHTML={{ __html: t("resp8") }} />
              </ul>
            </div>
          </section>

          {/* Education */}
          <section className="resume-window__section">
            <h2 className="resume-window__section-title">{t("educationTitle")}</h2>
            <div className="resume-window__edu-item">
              <div className="resume-window__edu-header">
                <h3 className="resume-window__edu-degree">{t("degree1")}</h3>
                <span className="resume-window__edu-date">2018 - 2022</span>
              </div>
              <p className="resume-window__edu-inst">Università degli Studi di Ferrara | Voto: 96/110</p>
              <p className="resume-window__edu-thesis">{t("thesis")}</p>
            </div>
            <div className="resume-window__edu-item">
              <div className="resume-window__edu-header">
                <h3 className="resume-window__edu-degree">{t("degree2")}</h3>
                <span className="resume-window__edu-date">2013 - 2018</span>
              </div>
              <p className="resume-window__edu-inst">ISIT Bassi-Burgatti, Cento | Voto: 88/100</p>
            </div>
          </section>

          {/* Additional Experience */}
          <section className="resume-window__section">
            <h2 className="resume-window__section-title">{t("additionalExpTitle")}</h2>
            <div className="resume-window__exp-item">
              <div className="resume-window__exp-header">
                <div>
                  <h3 className="resume-window__exp-role">Tutor di Matematica</h3>
                  <span className="resume-window__exp-company">ISIT Bassi-Burgatti</span>
                </div>
                <span className="resume-window__exp-date">Marzo 2021 - Aprile 2021</span>
              </div>
              <p className="resume-window__exp-desc">{t("tutorDesc")}</p>
            </div>
          </section>

          {/* Soft Skills */}
          <section className="resume-window__section">
            <h2 className="resume-window__section-title">{t("softSkillsTitle")}</h2>
            <ul className="resume-window__exp-resps">
              <li dangerouslySetInnerHTML={{ __html: t("soft1") }} />
              <li dangerouslySetInnerHTML={{ __html: t("soft2") }} />
              <li dangerouslySetInnerHTML={{ __html: t("soft3") }} />
              <li dangerouslySetInnerHTML={{ __html: t("soft4") }} />
            </ul>
          </section>
        </main>
      </div>

      <footer className="resume-window__footer">{t("footer")}</footer>
    </div>
  );
}
