import { useLanguage } from "../../context/useLanguage";
import { getSkills } from "../../lib/knowledgeBase";
import { Terminal, Layers, Cloud, Database, GitBranch, Sparkles, Code } from "lucide-react";
import type { ComponentType } from "react";
import "./Skills.css";

/**
 * Mapping esplicito invece di `import * as Icons from "lucide-react"`:
 * l'import a wildcard impedisce il tree-shaking e portava l'intera libreria
 * di icone nel bundle finale (+~650 KB). Aggiungere una nuova icona qui
 * quando si aggiunge una categoria in knowledge-base/skills.md.
 */
const ICONS: Record<string, ComponentType<{ size?: number | string; className?: string }>> = {
  Terminal,
  Layers,
  Cloud,
  Database,
  GitBranch,
  Sparkles,
};

export function SkillsWindow() {
  const { language } = useLanguage();
  const skills = getSkills();
  const categories = skills?.frontmatter.categories ?? [];

  return (
    <div className="skills-window">
      <div className="skills-grid">
        {categories.map((cat) => {
          const Icon = ICONS[cat.icon] ?? Code;

          return (
            <div key={cat.key} className="skills-category">
              <header className="skills-category__header">
                <Icon className="skills-category__icon" size={16} />
                <h3 className="skills-category__title">{cat.labels[language]}</h3>
              </header>

              <div className="skills-category__tags">
                {cat.skills.map((skill) => (
                  <span key={skill} className="skills-category__tag">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
