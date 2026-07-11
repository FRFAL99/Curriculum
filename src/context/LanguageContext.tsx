import { createContext, useState, useEffect } from "react";
import type { ReactNode } from "react";
import { translations } from "./translations";
import type { Language, TranslationKey } from "./translations";

export type { Language, TranslationKey };

interface LanguageContextValue {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: TranslationKey) => string;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem("language");
    if (saved === "it" || saved === "en") return saved;

    // Auto-detect browser language
    const browserLang = navigator.language.substring(0, 2);
    return browserLang === "en" ? "en" : "it";
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem("language", lang);
  };

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  const t = (key: TranslationKey): string => {
    return translations[language][key] || translations["it"][key] || String(key);
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export { LanguageContext };
