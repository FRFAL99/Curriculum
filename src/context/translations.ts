export type Language = "it" | "en";
/**
 * Dati di traduzione, in file separato da LanguageContext.tsx per evitare
 * il warning oxlint "only-export-components" (file che esportano sia
 * componenti che costanti rompono il fast refresh di Vite).
 *
 * Fase 8 — Knowledge Base: qui restano SOLO le stringhe di UI/chrome
 * (etichette di pulsanti, titoli di sezione, testo di sistema). Tutti i
 * contenuti "di fatto" su Francesco (profilo, esperienze, formazione,
 * competenze, progetti, developer notes) sono stati spostati in
 * `knowledge-base/` e si leggono tramite `src/lib/knowledgeBase.ts`.
 * Vedi `docs/ADR-001-knowledge-base.md` per il criterio di separazione.
 */
export const translations = {
  it: {
    // Topbar & System
    brand: "Francesco Fallavena",
    clockDot: "·",
    languageLabel: "Lingua",
    themeLabel: "Tema",
    minimize: "Minimizza",
    close: "Chiudi",
    contactTitle: "Contatti",
    developerNotesTitle: "Developer Notes",
    knowledgeExplorerTitle: "Knowledge Base",
    knowledgeExplorerToggle: "Apri/chiudi la Knowledge Base",
    knowledgeExplorerSearchPlaceholder: "Cerca nella Knowledge Base...",
    knowledgeExplorerNoResults: "Nessun risultato.",
    readingTimeSuffix: "min di lettura",

    // Resume / CV — solo etichette di sezione/chrome
    download: "Scarica PDF",
    downloading: "Preparando anteprima...",
    skillsTitle: "Competenze Tecniche",
    projectsTitle: "Progetti",
    educationTitle: "Formazione",
    gradeLabel: "Voto",
    languagesTitle: "Lingue",
    profileTitle: "Profilo",
    experienceTitle: "Esperienza Professionale",
    present: "Presente",
    additionalExpTitle: "Esperienza Aggiuntiva",
    softSkillsTitle: "Competenze Trasversali",
    footer: "Autorizzo il trattamento dei miei dati personali ai sensi del GDPR 679/16.",

    // Developer Notes Window
    devNotesIntro: "In questa sezione condivido appunti e dettagli tecnici su sfide reali di problem solving affrontate nel mio percorso professionale.",

    // Projects Window — Knowledge Document Viewer (Fase 9)
    viewCaseStudy: "Leggi il case study",

    // Assistant Window (Fase 11)
    assistantPlaceholder: "Scrivi un messaggio...",
    assistantThinking: "Sto pensando...",
    assistantRateLimited: "Abbiamo raggiunto il limite di richieste gratuite per oggi. Riprova tra qualche minuto.",
    retry: "Riprova",
    send: "Invia",
    resetConversation: "Nuova conversazione",
  },
  en: {
    // Topbar & System
    brand: "Francesco Fallavena",
    clockDot: "·",
    languageLabel: "Language",
    themeLabel: "Theme",
    minimize: "Minimize",
    close: "Close",
    contactTitle: "Contact Info",
    developerNotesTitle: "Developer Notes",
    knowledgeExplorerTitle: "Knowledge Base",
    knowledgeExplorerToggle: "Open/close the Knowledge Base",
    knowledgeExplorerSearchPlaceholder: "Search the Knowledge Base...",
    knowledgeExplorerNoResults: "No results.",
    readingTimeSuffix: "min read",

    // Resume / CV — chrome labels only
    download: "Download PDF",
    downloading: "Preparing preview...",
    skillsTitle: "Technical Skills",
    projectsTitle: "Projects",
    educationTitle: "Education",
    gradeLabel: "Grade",
    languagesTitle: "Languages",
    profileTitle: "Profile",
    experienceTitle: "Professional Experience",
    present: "Present",
    additionalExpTitle: "Additional Experience",
    softSkillsTitle: "Soft Skills",
    footer: "I authorize the processing of my personal data in accordance with GDPR 679/16.",

    // Developer Notes Window
    devNotesIntro: "In this section, I share technical notes on real-world problem-solving challenges encountered throughout my professional journey.",

    // Projects Window — Knowledge Document Viewer (Fase 9)
    viewCaseStudy: "Read case study",

    // Assistant Window (Fase 11)
    assistantPlaceholder: "Type a message...",
    assistantThinking: "Thinking...",
    assistantRateLimited: "We've hit today's free request limit. Please try again in a few minutes.",
    retry: "Retry",
    send: "Send",
    resetConversation: "New conversation",
  }
};

export type TranslationKey = keyof typeof translations.it;

/**
 * Suggerimenti di conversazione (documento di visione "Knowledge Base +
 * AI Assistant"). Array, non stringa: tenuto fuori da `translations` per
 * non alterare il tipo di ritorno `string` di `t()` in `LanguageContext.tsx`.
 */
export const conversationStarters: Record<Language, string[]> = {
  it: [
    "Raccontami della tua esperienza",
    "Di quale progetto sei più orgoglioso?",
    "Spiegami Antichità Fallavena",
    "Mostrami la tua esperienza backend",
    "Quali tecnologie usi di più?",
    "Come hai costruito questo portfolio?",
    "Cosa stai imparando ora?",
  ],
  en: [
    "Tell me about your experience",
    "Which project are you most proud of?",
    "Explain Antichità Fallavena",
    "Show your backend experience",
    "Which technologies do you use the most?",
    "How did you build this portfolio?",
    "What are you currently learning?",
  ],
};
