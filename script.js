// Traduzioni
const translations = {
    it: {
        title: "Software Engineer",
        download: "📄 Scarica PDF",
        profileTitle: "Profilo",
        profile: "Software engineer con forte orientamento alla crescita e curiosità verso nuove tecnologie. Unisco competenze tecniche a un approccio metodico e analitico per la risoluzione di problemi complessi. Esperienza consolidata nel lavoro con team internazionali e nella gestione di progetti per clienti enterprise. Sempre aperto ad apprendere nuovi stack tecnologici e ad assumere responsabilità crescenti.",
        skillsTitle: "Competenze Tecniche",
        skillsLang: "Linguaggi",
        skillsFramework: "Framework & Tech",
        skillsCloud: "Cloud & Azure",
        skillsDatabase: "Database & Tools",
        skillsMethodology: "Metodologie",
        educationTitle: "Formazione",
        languagesTitle: "Lingue",
        availabilityText: "🌍 Disponibile al trasferimento<br>(Italia/Estero)",
        experienceTitle: "Esperienza Professionale",
        additionalExpTitle: "Esperienza Aggiuntiva",
        softSkillsTitle: "Competenze Trasversali",
        present: "Presente",
        degree1: "Laurea Triennale in Matematica",
        degree2: "Perito in Informatica e Telecomunicazioni",
        thesis: "Tesi: \"Metodo Monte Carlo e soluzione dell'equazione di Boltzmann\"",
        italian: "Italiano",
        english: "Inglese",
        motherTongue: "Madrelingua",
        professionalUse: "Uso professionale",
        jobDesc: "Full-stack developer specializzato nello sviluppo di applicazioni web per CPG companies. Progettazione e implementazione di soluzioni software scalabili per la gestione di TPM, Trade Terms e Business Plan, con deployment di successo per clienti enterprise di livello internazionale come <strong>Kellogg</strong> ed <strong>Energizer</strong>.",
        tutorDesc: "Supporto didattico e lezioni individuali di recupero per studenti con difficoltà in matematica. Esperienza in didattica a distanza su piattaforme digitali.",
        resp1: "Sviluppo full-stack di web application su piattaforma <strong>Azure Cloud</strong> con deployment su <strong>AKS (Azure Kubernetes Service)</strong>",
        resp2: "Implementazione di <strong>Logic Apps</strong> e <strong>Function Apps</strong> per automazione e integrazione di processi business",
        resp3: "Gestione <strong>Azure DevOps</strong>: work items, repository e utilizzo di pipeline CI/CD per deployment automatizzato",
        resp4: "Contributo alle diverse fasi di sviluppo: design, build, deploy e maintenance",
        resp5: "Analisi dati e gestione di database <strong>SQL Server</strong> e <strong>Oracle</strong>",
        resp6: "Monitoraggio applicazioni e troubleshooting tramite <strong>Application Insights</strong> e sistemi di logging",
        resp7: "Collaborazione in team internazionale utilizzando <strong>metodologie Agile</strong> e approcci Waterfall",
        resp8: "Integrazione e consumo di API REST per comunicazione tra servizi",
        soft1: "<strong>Lavoro in team internazionale</strong> - Collaborazione quotidiana con colleghi da diverse parti del mondo",
        soft2: "<strong>Gestione progetti</strong> - Coordinamento delle diverse fasi di sviluppo software",
        soft3: "<strong>Problem solving</strong> - Analisi e risoluzione di problematiche tecniche complesse",
        soft4: "<strong>Comunicazione</strong> - Interfaccia diretta con clienti enterprise per implementazioni software",
        footer: "Autorizzo il trattamento dei miei dati personali ai sensi del GDPR 679/16."
    },
    en: {
        title: "Software Engineer",
        download: "📄 Download PDF",
        profileTitle: "Profile",
        profile: "Software engineer with strong growth orientation and curiosity towards new technologies. I combine technical skills with a methodical and analytical approach to solve complex problems. Consolidated experience working with international teams and managing projects for enterprise clients. Always open to learning new technology stacks and taking on growing responsibilities.",
        skillsTitle: "Technical Skills",
        skillsLang: "Languages",
        skillsFramework: "Framework & Tech",
        skillsCloud: "Cloud & Azure",
        skillsDatabase: "Database & Tools",
        skillsMethodology: "Methodologies",
        educationTitle: "Education",
        languagesTitle: "Languages",
        availabilityText: "🌍 Available for relocation<br>(Italy/Abroad)",
        experienceTitle: "Professional Experience",
        additionalExpTitle: "Additional Experience",
        softSkillsTitle: "Soft Skills",
        present: "Present",
        degree1: "Bachelor's Degree in Mathematics",
        degree2: "IT and Telecommunications Diploma",
        thesis: "Thesis: \"Monte Carlo Method and Boltzmann Equation Solution\"",
        italian: "Italian",
        english: "English",
        motherTongue: "Native",
        professionalUse: "Professional use",
        jobDesc: "Full-stack developer specialized in web application development for CPG companies. Design and implementation of scalable software solutions for TPM, Trade Terms and Business Plan management, with successful deployment for international enterprise clients like <strong>Kellogg</strong> and <strong>Energizer</strong>.",
        tutorDesc: "Educational support and individual tutoring sessions for students with mathematics difficulties. Experience in remote teaching on digital platforms.",
        resp1: "Full-stack development of web applications on <strong>Azure Cloud</strong> platform with deployment on <strong>AKS (Azure Kubernetes Service)</strong>",
        resp2: "Implementation of <strong>Logic Apps</strong> and <strong>Function Apps</strong> for business process automation and integration",
        resp3: "<strong>Azure DevOps</strong> management: work items, repositories and CI/CD pipeline usage for automated deployment",
        resp4: "Contributing to different development phases: design, build, deploy and maintenance",
        resp5: "Data analysis and <strong>SQL Server</strong> and <strong>Oracle</strong> database management",
        resp6: "Application monitoring and troubleshooting through <strong>Application Insights</strong> and logging systems",
        resp7: "Collaboration in international team using <strong>Agile methodologies</strong> and Waterfall approaches",
        resp8: "REST API integration and consumption for service communication",
        soft1: "<strong>International teamwork</strong> - Daily collaboration with colleagues from different parts of the world",
        soft2: "<strong>Project management</strong> - Coordination of different software development phases",
        soft3: "<strong>Problem solving</strong> - Analysis and resolution of complex technical issues",
        soft4: "<strong>Communication</strong> - Direct interface with enterprise clients for software implementations",
        footer: "I authorize the processing of my personal data pursuant to GDPR 679/16."
    }
};

let currentLang = 'it';

// Assicuriamoci che la funzione sia globale
window.switchLanguage = function(lang) {
    currentLang = lang;
    
    // Update active button
    document.querySelectorAll('.lang-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelector(`[data-lang="${lang}"]`).classList.add('active');
    
    // Update page language
    document.documentElement.lang = lang;
    
    // Update all translatable elements
    const elements = document.querySelectorAll('[data-key]');
    elements.forEach(element => {
        const key = element.getAttribute('data-key');
        if (translations[lang][key]) {
            element.innerHTML = translations[lang][key];
        }
    });

    // Animate the change
    document.body.style.opacity = '0.8';
    setTimeout(() => {
        document.body.style.opacity = '1';
    }, 200);
}

// Smooth scroll per i link interni
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth'
            });
        }
    });
});

// Animazione fade-in per le sezioni quando entrano nella viewport
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Applica l'animazione a tutti gli elementi esperienza
document.querySelectorAll('.experience-item, .education-item').forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(20px)';
    el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    observer.observe(el);
});

// Detect browser language and set default
document.addEventListener('DOMContentLoaded', function() {
    const browserLang = navigator.language.substring(0, 2);
    if (browserLang === 'en' && translations.en) {
        switchLanguage('en');
    }
});

// Funzione alternativa per generare PDF usando la stampa del browser
window.downloadPDF = function() {
    // Metodo più semplice: usa la funzione di stampa del browser
    window.print();
    
    // Oppure, se vuoi usare html2pdf con configurazione più semplice:
    /*
    const element = document.querySelector('.container');
    const opt = {
        margin: 1,
        filename: 'Francesco_Fallavena_CV.pdf',
        image: { type: 'jpeg', quality: 0.95 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
    };
    
    // Nascondi temporaneamente i controlli
    const headerActions = document.querySelector('.header-actions');
    if (headerActions) {
        headerActions.style.visibility = 'hidden';
    }
    
    html2pdf().set(opt).from(element).save().then(() => {
        if (headerActions) {
            headerActions.style.visibility = 'visible';
        }
    });
    */
}