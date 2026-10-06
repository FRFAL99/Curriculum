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
 * Vedi `docs/adr/0001-knowledge-base.md` per il criterio di separazione.
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
    tabHome: "Home",
    tabResume: "Curriculum",
    tabProjects: "Progetti",
    tabDeveloperNotes: "Developer Notes",
    heroCtaResume: "Guarda il CV",
    heroCtaProjects: "Vedi i progetti",
    heroContactTitle: "Contatti",
    copy: "Copia",
    copied: "Copiato",
    docDetailBack: "Torna indietro",
    devNotesBackToList: "Torna agli articoli",
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
    assistantTitle: "Chiedi di Francesco",
    assistantRateLimited: "Troppe richieste in poco tempo. Riprova tra qualche minuto.",
    assistantUnavailable: "L'assistente non è disponibile in questo momento. Riprova tra poco.",
    retry: "Riprova",
    send: "Invia",
    resetConversation: "Nuova conversazione",
    assistantStatModel: "Modello",
    assistantStatTokens: "Token in ingresso → in uscita",
    assistantStatTime: "Tempo di risposta",
    assistantStatSpeed: "Velocità di generazione",
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
    tabHome: "Home",
    tabResume: "Resume",
    tabProjects: "Projects",
    tabDeveloperNotes: "Developer Notes",
    heroCtaResume: "View resume",
    heroCtaProjects: "See projects",
    heroContactTitle: "Get in touch",
    copy: "Copy",
    copied: "Copied",
    docDetailBack: "Back",
    devNotesBackToList: "Back to articles",
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
    assistantTitle: "Ask about Francesco",
    assistantRateLimited: "Too many requests in a short time. Please try again in a few minutes.",
    assistantUnavailable: "The assistant isn't available right now. Please try again shortly.",
    retry: "Retry",
    send: "Send",
    resetConversation: "New conversation",
    assistantStatModel: "Model",
    assistantStatTokens: "Input → output tokens",
    assistantStatTime: "Response time",
    assistantStatSpeed: "Generation speed",
  }
};

export type TranslationKey = keyof typeof translations.it;

/**
 * Suggerimenti di conversazione (documento di visione "Knowledge Base +
 * AI Assistant"). Ogni voce ha una `label` breve (mostrata sul chip, per
 * stare tutta su una riga sotto la barra) e un `prompt` completo (il testo
 * effettivamente inviato all'AI). Tenuto fuori da `translations` per non
 * alterare il tipo di ritorno `string` di `t()` in `LanguageContext.tsx`.
 */
export const conversationStarters: Record<Language, { label: string; prompt: string }[]> = {
  it: [
    { label: "Esperienza", prompt: "Raccontami l'esperienza lavorativa di Francesco" },
    { label: "Progetti", prompt: "Quali progetti ha realizzato Francesco?" },
    { label: "Antichità Fallavena", prompt: "Spiegami il progetto Antichità Fallavena" },
    { label: "Backend", prompt: "Che esperienza backend ha Francesco?" },
    { label: "Contatti", prompt: "Come posso contattare Francesco e qual è la sua disponibilità?" },
  ],
  en: [
    { label: "Experience", prompt: "Tell me about Francesco's work experience" },
    { label: "Projects", prompt: "Which projects has Francesco built?" },
    { label: "Antichità Fallavena", prompt: "Explain the Antichità Fallavena project" },
    { label: "Backend", prompt: "What backend experience does Francesco have?" },
    { label: "Contact", prompt: "How can I contact Francesco and what's his availability?" },
  ],
};
