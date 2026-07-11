import { useState } from "react";
import { Mail, Phone, MapPin, Copy, Check } from "lucide-react";
import { GithubIcon, LinkedinIcon } from "../../components/SocialIcons";
import "./Contact.css";

export function ContactWindow() {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const contactItems = [
    {
      id: "email",
      label: "Email",
      value: "francesco.fallavena@gmail.com",
      href: "mailto:francesco.fallavena@gmail.com",
      icon: Mail,
      copyable: true,
    },
    {
      id: "phone",
      label: "Phone",
      value: "(+39) 320 878 7258",
      href: "tel:+393208787258",
      icon: Phone,
      copyable: true,
    },
    {
      id: "location",
      label: "Location",
      value: "Pieve di Cento (BO), Italia",
      href: "https://www.google.com/maps/place/40096+Pieve+di+Cento+BO/@44.722885,11.3069151,14z",
      icon: MapPin,
      copyable: false,
    },
    {
      id: "github",
      label: "GitHub",
      value: "github.com/FRFAL99",
      href: "https://github.com/FRFAL99",
      icon: GithubIcon,
      copyable: false,
    },
    {
      id: "linkedin",
      label: "LinkedIn",
      value: "linkedin.com/in/francesco-fallavena",
      href: "https://www.linkedin.com/in/francesco-fallavena",
      icon: LinkedinIcon,
      copyable: false,
    },
  ];

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="contact-window">
      <div className="contact-list">
        {contactItems.map((item) => {
          const Icon = item.icon;
          const isCopied = copiedId === item.id;

          return (
            <div key={item.id} className="contact-card">
              <a
                href={item.href}
                target="_blank"
                rel="noopener noreferrer"
                className="contact-card__link"
              >
                <div className="contact-card__icon-wrapper">
                  <Icon size={16} />
                </div>
                <div className="contact-card__info">
                  <span className="contact-card__label">{item.label}</span>
                  <span className="contact-card__value">{item.value}</span>
                </div>
              </a>

              {item.copyable && (
                <button
                  type="button"
                  className="contact-card__copy-btn"
                  onClick={() => handleCopy(item.id, item.value)}
                  title={`Copy ${item.label} to clipboard`}
                >
                  {isCopied ? (
                    <Check size={14} className="contact-card__copied-icon" />
                  ) : (
                    <Copy size={14} />
                  )}
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
