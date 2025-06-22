// === VARIABILI GLOBALI ===
let currentLang = 'it';

// === FUNZIONI PRINCIPALI ===

// Funzione per cambiare lingua
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
        if (translations[lang] && translations[lang][key]) {
            element.innerHTML = translations[lang][key];
        }
    });

    // Animate the change
    document.body.style.opacity = '0.8';
    setTimeout(() => {
        document.body.style.opacity = '1';
    }, 200);
}

// Funzione principale per scaricare PDF
window.downloadPDF = function() {
    // Usa sempre il metodo print ottimizzato (più affidabile)
    generatePDFWithPrint();
}

// Funzione per generare PDF con jsPDF + html2canvas
function generatePDFWithJsPDF() {
    const webLayout = document.getElementById('web-layout');
    const pdfLayout = document.getElementById('pdf-layout');
    const downloadBtn = document.querySelector('.download-btn span');
    const originalText = downloadBtn.textContent;
    
    downloadBtn.textContent = '⏳ Generando PDF...';
    
    try {
        // 1. Nascondi layout web
        webLayout.style.display = 'none';
        
        // 2. Popola dati nel layout PDF
        populatePDFData();
        
        // 3. Mostra layout PDF
        pdfLayout.style.display = 'block';
        
        // 4. Applica stili ottimizzati per la cattura
        const pdfContainer = document.querySelector('.pdf-container');
        
        // Forza stili per la generazione (font più grandi!)
        pdfContainer.style.transform = 'scale(1)';
        pdfContainer.style.fontSize = '15px';
        pdfContainer.style.width = '210mm';
        pdfContainer.style.height = '297mm';
        pdfContainer.style.padding = '10mm';
        
        // Forza font specifici
        const nameElement = pdfContainer.querySelector('.pdf-name');
        const titleElement = pdfContainer.querySelector('.pdf-title');
        const sectionTitles = pdfContainer.querySelectorAll('.pdf-section-title');
        
        if (nameElement) nameElement.style.fontSize = '32px';
        if (titleElement) titleElement.style.fontSize = '18px';
        sectionTitles.forEach(el => el.style.fontSize = '16px');
        
        // Aspetta che il layout si stabilizzi
        setTimeout(() => {
            // 5. Genera con html2canvas
            html2canvas(pdfContainer, {
                scale: 2.5,
                useCORS: true,
                allowTaint: true,
                backgroundColor: '#ffffff',
                width: 794,
                height: 1123,
                dpi: 200,
                letterRendering: true,
                logging: false
            }).then(canvas => {
                try {
                    // 6. Crea PDF con jsPDF
                    const { jsPDF } = window.jspdf;
                    const pdf = new jsPDF({
                        orientation: 'portrait',
                        unit: 'mm',
                        format: 'a4',
                        compress: true
                    });
                    
                    // Converti canvas in immagine
                    const imgData = canvas.toDataURL('image/jpeg', 0.98);
                    
                    // Dimensioni A4
                    const pdfWidth = 210;
                    const pdfHeight = 297;
                    
                    // Aggiungi immagine al PDF (riempie tutta la pagina)
                    pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight, '', 'FAST');
                    
                    // Salva il PDF
                    const filename = `Francesco_Fallavena_CV_${currentLang.toUpperCase()}.pdf`;
                    pdf.save(filename);
                    
                    console.log('PDF generato con successo con jsPDF locale!');
                    showPDFMessage('PDF generato con successo!');
                    resetAfterPDF(webLayout, pdfLayout, downloadBtn, originalText);
                    
                } catch (pdfError) {
                    console.error('Errore nella creazione PDF:', pdfError);
                    showPDFMessage('Errore nella generazione PDF');
                    resetAfterPDF(webLayout, pdfLayout, downloadBtn, originalText);
                }
                
            }).catch(canvasError => {
                console.error('Errore html2canvas:', canvasError);
                showPDFMessage('Errore nella cattura del layout');
                resetAfterPDF(webLayout, pdfLayout, downloadBtn, originalText);
            });
            
        }, 200);
        
    } catch (error) {
        console.error('Errore durante la preparazione PDF:', error);
        resetAfterPDF(webLayout, pdfLayout, downloadBtn, originalText);
        showPDFMessage('Errore nella generazione PDF');
    }
}

// Fallback: Print ottimizzato (ora metodo principale)
function generatePDFWithPrint() {
    const webLayout = document.getElementById('web-layout');
    const pdfLayout = document.getElementById('pdf-layout');
    const downloadBtn = document.querySelector('.download-btn span');
    const originalText = downloadBtn.textContent;
    
    downloadBtn.textContent = '⏳ Preparando anteprima...';
    
    try {
        webLayout.style.display = 'none';
        populatePDFData();
        pdfLayout.style.display = 'block';
        
        // NON mostrare messaggi che coprono il contenuto
        // showPDFMessage('Anteprima pronta! Clicca "Salva" e scegli "Salva come PDF"');
        
        setTimeout(() => {
            window.print();
            // Ripristina dopo che si apre il dialog
            setTimeout(() => {
                resetAfterPDF(webLayout, pdfLayout, downloadBtn, originalText);
            }, 500);
        }, 200);
        
    } catch (error) {
        console.error('Errore nel metodo print:', error);
        resetAfterPDF(webLayout, pdfLayout, downloadBtn, originalText);
    }
}

// Funzione per generare PDF con jsPDF + html2canvas
function generatePDFWithJsPDF() {
    const webLayout = document.getElementById('web-layout');
    const pdfLayout = document.getElementById('pdf-layout');
    const downloadBtn = document.querySelector('.download-btn span');
    const originalText = downloadBtn.textContent;
    
    // Mostra messaggio di caricamento
    downloadBtn.textContent = '⏳ Generando PDF...';
    
    try {
        // 1. Nascondi layout web
        webLayout.style.display = 'none';
        
        // 2. Popola dati nel layout PDF
        populatePDFData();
        
        // 3. Mostra layout PDF
        pdfLayout.style.display = 'block';
        
        // 4. Applica stili ottimizzati per la cattura
        const pdfContainer = document.querySelector('.pdf-container');
        
        // Forza stili per la generazione
        pdfContainer.style.transform = 'scale(1)';
        pdfContainer.style.fontSize = '14px';
        pdfContainer.style.width = '210mm';
        pdfContainer.style.height = '297mm';
        pdfContainer.style.padding = '12mm';
        
        // Aspetta che il layout si stabilizzi
        setTimeout(() => {
            // 5. Genera con html2canvas
            html2canvas(pdfContainer, {
                scale: 3,
                useCORS: true,
                allowTaint: true,
                backgroundColor: '#ffffff',
                width: 794,  // A4 width in pixels
                height: 1123, // A4 height in pixels
                dpi: 300,
                letterRendering: true
            }).then(canvas => {
                try {
                    // 6. Crea PDF con jsPDF
                    const { jsPDF } = window.jspdf;
                    const pdf = new jsPDF({
                        orientation: 'portrait',
                        unit: 'mm',
                        format: 'a4'
                    });
                    
                    // Converti canvas in immagine
                    const imgData = canvas.toDataURL('image/jpeg', 1.0);
                    
                    // Calcola dimensioni per riempire la pagina A4
                    const pdfWidth = 210;
                    const pdfHeight = 297;
                    
                    // Aggiungi immagine al PDF
                    pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight);
                    
                    // Salva il PDF
                    const filename = `Francesco_Fallavena_CV_${currentLang.toUpperCase()}.pdf`;
                    pdf.save(filename);
                    
                    console.log('PDF generato con successo con jsPDF!');
                    resetAfterPDF(webLayout, pdfLayout, downloadBtn, originalText);
                    
                } catch (pdfError) {
                    console.error('Errore nella creazione PDF:', pdfError);
                    showPDFMessage('Errore nella generazione PDF');
                    resetAfterPDF(webLayout, pdfLayout, downloadBtn, originalText);
                }
                
            }).catch(canvasError => {
                console.error('Errore html2canvas:', canvasError);
                showPDFMessage('Errore nella cattura del layout');
                resetAfterPDF(webLayout, pdfLayout, downloadBtn, originalText);
            });
            
        }, 100); // Piccolo delay per stabilizzare il layout
        
    } catch (error) {
        console.error('Errore durante la preparazione PDF:', error);
        resetAfterPDF(webLayout, pdfLayout, downloadBtn, originalText);
        showPDFMessage('Errore nella generazione PDF');
    }
}

// Funzione per popolare i dati nel layout PDF
function populatePDFData() {
    const lang = currentLang;
    const t = translations[lang];
    
    // Popola tutti i testi tradotti
    document.getElementById('pdf-title-text').textContent = t.title;
    document.getElementById('pdf-profile-text').textContent = t.profile;
    
    // Titoli sezioni
    document.getElementById('pdf-contacts-title').textContent = 'CONTATTI';
    document.getElementById('pdf-skills-title').textContent = t.skillsTitle.toUpperCase();
    document.getElementById('pdf-education-title').textContent = t.educationTitle.toUpperCase();
    document.getElementById('pdf-experience-title').textContent = t.experienceTitle.toUpperCase();
    document.getElementById('pdf-additional-exp-title').textContent = t.additionalExpTitle.toUpperCase();
    document.getElementById('pdf-soft-skills-title').textContent = t.softSkillsTitle.toUpperCase();
    document.getElementById('pdf-languages-title').textContent = t.languagesTitle.toUpperCase();
    
    // Skills sottotitoli
    document.getElementById('pdf-skills-lang-title').textContent = t.skillsLang;
    document.getElementById('pdf-skills-framework-title').textContent = t.skillsFramework;
    document.getElementById('pdf-skills-cloud-title').textContent = t.skillsCloud;
    document.getElementById('pdf-skills-database-title').textContent = t.skillsDatabase;
    document.getElementById('pdf-skills-methodology-title').textContent = t.skillsMethodology;
    
    // Formazione
    document.getElementById('pdf-degree1').textContent = t.degree1;
    document.getElementById('pdf-degree2').textContent = t.degree2;
    document.getElementById('pdf-thesis').textContent = t.thesis;
    
    // Esperienza
    document.getElementById('pdf-present').textContent = t.present;
    document.getElementById('pdf-job-desc').innerHTML = t.jobDesc;
    document.getElementById('pdf-tutor-desc').textContent = t.tutorDesc;
    
    // Competenze trasversali
    const softSkillsList = document.getElementById('pdf-soft-skills-list');
    softSkillsList.innerHTML = `
        <li>${t.soft1}</li>
        <li>${t.soft2}</li>
        <li>${t.soft3}</li>
        <li>${t.soft4}</li>
    `;
    
    // Lingue
    document.getElementById('pdf-italian').textContent = t.italian;
    document.getElementById('pdf-english').textContent = t.english;
    document.getElementById('pdf-mother-tongue').textContent = t.motherTongue;
    document.getElementById('pdf-professional-use').textContent = t.professionalUse;
    
    // Footer
    document.getElementById('pdf-footer').textContent = t.footer;
    
    // Responsabilità (versione ridotta per PDF)
    const respList = document.getElementById('pdf-responsibilities');
    const responsibilities = lang === 'it' ? [
        'Sviluppo full-stack di web application su piattaforma <strong>Azure Cloud</strong> con deployment su <strong>AKS</strong>',
        'Implementazione di <strong>Logic Apps</strong> e <strong>Function Apps</strong> per automazione e integrazione',
        'Gestione <strong>Azure DevOps</strong>: work items, repository e pipeline CI/CD',
        'Analisi dati e gestione di database <strong>SQL Server</strong> e <strong>Oracle</strong>',
        'Monitoraggio applicazioni tramite <strong>Application Insights</strong>',
        'Collaborazione in team internazionale utilizzando <strong>metodologie Agile</strong>'
    ] : [
        'Full-stack development of web applications on <strong>Azure Cloud</strong> platform with deployment on <strong>AKS</strong>',
        'Implementation of <strong>Logic Apps</strong> and <strong>Function Apps</strong> for automation and integration',
        'Management of <strong>Azure DevOps</strong>: work items, repositories and CI/CD pipelines',
        'Data analysis and management of <strong>SQL Server</strong> and <strong>Oracle</strong> databases',
        'Application monitoring through <strong>Application Insights</strong>',
        'Collaboration in international teams using <strong>Agile methodologies</strong>'
    ];
    
    respList.innerHTML = responsibilities.map(resp => `<li>${resp}</li>`).join('');
}

// Funzione per ripristinare lo stato dopo la generazione PDF
function resetAfterPDF(webLayout, pdfLayout, downloadBtn, originalText) {
    // Nascondi layout PDF
    pdfLayout.style.display = 'none';
    
    // Mostra layout web
    webLayout.style.display = 'block';
    
    // Ripristina bottone
    downloadBtn.textContent = originalText;
}

// Funzione per mostrare messaggi
function showPDFMessage(message) {
    const messageDiv = document.createElement('div');
    messageDiv.textContent = message;
    messageDiv.style.cssText = `
        position: fixed;
        top: 20px;
        left: 50%;
        transform: translateX(-50%);
        background: #667eea;
        color: white;
        padding: 12px 24px;
        border-radius: 25px;
        z-index: 10000;
        font-weight: 500;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    `;
    
    document.body.appendChild(messageDiv);
    
    setTimeout(() => {
        if (messageDiv.parentNode) {
            messageDiv.parentNode.removeChild(messageDiv);
        }
    }, 4000);
}

// === INIZIALIZZAZIONE ===
document.addEventListener('DOMContentLoaded', function() {
    // Detect browser language and set default
    const browserLang = navigator.language.substring(0, 2);
    if (browserLang === 'en' && translations.en) {
        switchLanguage('en');
    }
    
    console.log('Sistema CV integrato caricato correttamente!');
    console.log('jsPDF disponibile:', typeof window.jspdf !== 'undefined');
    console.log('html2canvas disponibile:', typeof html2canvas !== 'undefined');
});

// Gestione errori globali
window.addEventListener('error', function(e) {
    console.error('Errore JavaScript:', e.error);
});

// Funzione di debug
function debugInfo() {
    console.log('Lingua corrente:', currentLang);
    console.log('html2pdf disponibile:', typeof html2pdf !== 'undefined');
    console.log('Traduzioni disponibili:', typeof translations !== 'undefined');
    console.log('Layout PDF nascosto:', document.getElementById('pdf-layout').style.display === 'none');
}

// Esponi debugInfo per test
window.debugInfo = debugInfo;