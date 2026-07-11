import { useLanguage } from "../../context/useLanguage";
import type { TranslationKey } from "../../context/translations";
import skillsData from "../../data/skills.json";
import { Terminal, Layers, Cloud, Database, GitBranch, Sparkles, Code } from "lucide-react";
import type { ComponentType } from "react";
import "./Skills.css";

interface SkillCategory {
  categoryKey: string;
  icon: string;
  skills: string[];
}

/**
 * Mapping esplicito invece di `import * as Icons from "lucide-react"`:
 * l'import a wildcard impedisce il tree-shaking e portava l'intera libreria
 * di icone nel bundle finale (+~650 KB). Aggiungere una nuova icona qui
 * quando si aggiunge una categoria in skills.json.
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
  const { t } = useLanguage();
  const categories = skillsData as SkillCategory[];

  return (
    <div className="skills-window">
      <div className="skills-grid">
        {categories.map((cat) => {
          const Icon = ICONS[cat.icon] ?? Code;

          return (
            <div key={cat.categoryKey} className="skills-category">
              <header className="skills-category__header">
                <Icon className="skills-category__icon" size={16} />
                <h3 className="skills-category__title">
                  {t(cat.categoryKey as TranslationKey)}
                </h3>
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
