import { useState } from "react";
import { Mail, Phone, MapPin, Copy, Check } from "lucide-react";
import { GithubIcon, LinkedinIcon } from "../components/SocialIcons";
import { getContacts, getSocials } from "../lib/knowledgeBase";
import { useLanguage } from "../context/useLanguage";
import "./HomeContact.css";

/**
 * Sezione contatti della Home (ex finestra Contact). I dati arrivano dalla
 * Knowledge Base (config/contacts.md, config/socials.md), così restano
 * un'unica fonte per UI e AI.
 */
export function HomeContact() {
  const { t } = useLanguage();
  const contacts = getContacts()?.frontmatter;
  const socials = getSocials()?.frontmatter;
  const [copiedId, setCopiedId] = useState<string | null>(null);

  function handleCopy(id: string, text: string) {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  }

  const items = [
    contacts?.email && {
      id: "email",
      label: "Email",
      value: contacts.email,
      href: `mailto:${contacts.email}`,
      icon: Mail,
      copyable: true,
    },
    contacts?.phone && {
      id: "phone",
      label: "Phone",
      value: contacts.phone,
      href: `tel:${contacts.phoneHref ?? contacts.phone}`,
      icon: Phone,
      copyable: true,
    },
    contacts?.location && {
      id: "location",
      label: "Location",
      value: contacts.location,
      href: undefined,
      icon: MapPin,
      copyable: false,
    },
    socials?.github && {
      id: "github",
      label: "GitHub",
      value: socials.githubLabel ?? socials.github,
      href: socials.github,
      icon: GithubIcon,
      copyable: false,
    },
    socials?.linkedin && {
      id: "linkedin",
      label: "LinkedIn",
      value: socials.linkedinLabel ?? socials.linkedin,
      href: socials.linkedin,
      icon: LinkedinIcon,
      copyable: false,
    },
  ].filter(Boolean) as {
    id: string;
    label: string;
    value: string;
    href?: string;
    icon: typeof Mail;
    copyable: boolean;
  }[];

  return (
    <section className="home-contact" id="contact">
      <h2 className="home-contact__title">{t("heroContactTitle")}</h2>
      <div className="home-contact__list">
        {items.map((item) => {
          const Icon = item.icon;
          const isCopied = copiedId === item.id;
          const inner = (
            <>
              <div className="home-contact__icon">
                <Icon size={16} />
              </div>
              <div className="home-contact__info">
                <span className="home-contact__label">{item.label}</span>
                <span className="home-contact__value">{item.value}</span>
              </div>
            </>
          );

          return (
            <div key={item.id} className="home-contact__card">
              {item.href ? (
                <a
                  href={item.href}
                  target={item.href.startsWith("http") ? "_blank" : undefined}
                  rel="noopener noreferrer"
                  className="home-contact__link"
                >
                  {inner}
                </a>
              ) : (
                <div className="home-contact__link">{inner}</div>
              )}

              {item.copyable && (
                <button
                  type="button"
                  className="home-contact__copy"
                  onClick={() => handleCopy(item.id, item.value)}
                  aria-label={`${t("copy")} ${item.label}`}
                  title={`${t("copy")} ${item.label}`}
                >
                  {isCopied ? (
                    <Check size={14} className="home-contact__copied" />
                  ) : (
                    <Copy size={14} />
                  )}
                </button>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
