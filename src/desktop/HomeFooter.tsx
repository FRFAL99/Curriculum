import { Mail, Phone, MapPin } from "lucide-react";
import { GithubIcon, LinkedinIcon } from "../components/SocialIcons";
import { getContacts, getSocials } from "../lib/knowledgeBase";
import "./HomeFooter.css";

/**
 * Footer contatti della Home: una riga inline di link compatti (icona +
 * testo), niente card. Dati dalla Knowledge Base (config/contacts.md,
 * config/socials.md), stessa fonte di CV e AI.
 */
export function HomeFooter() {
  const c = getContacts()?.frontmatter;
  const s = getSocials()?.frontmatter;

  return (
    <footer className="home-footer">
      {c?.email && (
        <a className="home-footer__item" href={`mailto:${c.email}`}>
          <Mail size={13} strokeWidth={1.8} />
          <span>{c.email}</span>
        </a>
      )}
      {c?.phone && (
        <a className="home-footer__item" href={`tel:${c.phoneHref ?? c.phone}`}>
          <Phone size={13} strokeWidth={1.8} />
          <span>{c.phone}</span>
        </a>
      )}
      {c?.location && (
        <span className="home-footer__item">
          <MapPin size={13} strokeWidth={1.8} />
          <span>{c.location}</span>
        </span>
      )}
      {s?.github && (
        <a className="home-footer__item" href={s.github} target="_blank" rel="noopener noreferrer">
          <GithubIcon width={13} height={13} />
          <span>{s.githubLabel ?? "GitHub"}</span>
        </a>
      )}
      {s?.linkedin && (
        <a className="home-footer__item" href={s.linkedin} target="_blank" rel="noopener noreferrer">
          <LinkedinIcon width={13} height={13} />
          <span>{s.linkedinLabel ?? "LinkedIn"}</span>
        </a>
      )}
    </footer>
  );
}
