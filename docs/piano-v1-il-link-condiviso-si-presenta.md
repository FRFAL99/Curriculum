# Curriculum — Piano v1: «il link condiviso si presenta da solo»

> Punto d'ingresso del progetto: [STATO.md](STATO.md). **Da dove viene questo piano:** il punto 1
> di «cosa manca» in `STATO.md`, dall'analisi del sito del 6 ottobre 2026. Scritto il 2026-10-06.
>
> **Occupa le Fasi 21–23**, scritte in [registro.md](registro.md) insieme a questo piano.
>
> **Ogni misura e ogni riferimento qui sotto è stato letto nel codice**, non dedotto.

## Contesto

1. **Il link incollato su LinkedIn, WhatsApp o in una mail esce nudo.** `index.html` ha solo
   `<title>Francesco Fallavena — Desktop</title>`, eredità del sito «desktop» chiuso dalla Fase 18:
   nessuna meta description, nessun Open Graph, nessuna immagine di anteprima. Chi riceve il link
   vede un titolo sbagliato e niente altro.
2. **Chi non esegue JavaScript non vede niente.** L'HTML servito è un `<div id="root"></div>`
   vuoto; tutto il contenuto arriva dal bundle. I crawler che non eseguono JS (e quelli delle
   anteprime, che non lo eseguono mai) trovano una pagina vuota.

I due problemi hanno la stessa causa: l'HTML iniziale non dice niente di Francesco.

## La cosa che il codice sapeva già (decisione 0)

**Decisione.** Tutto ciò che serve è già nella knowledge base: non si scrive nessun testo nuovo
nell'HTML a mano.

**Perché.**

- `knowledge-base/about.it.md` e `about.en.md`: `name`, `role`, `location` nel frontmatter e il
  riassunto nel corpo. Sono la meta description e il testo statico, già scritti e già tradotti.
- `knowledge-base/config/socials.md` e `contacts.md`: GitHub, LinkedIn, email, per i link statici
  e per lo schema `Person`.
- `src/context/LanguageContext.tsx:21-23` sceglie l'**italiano** per chiunque non abbia il browser
  in inglese, mentre `index.html` dichiara `lang="en"`: un'incoerenza che questo piano corregge.
- `createRoot(...).render()` in `src/main.tsx` sostituisce il contenuto di `#root`: un HTML
  statico messo lì in build sparisce da solo quando React monta, senza flash di codice nuovo.
- Netlify espone in build la variabile `URL` (l'indirizzo principale del sito, dominio
  personalizzato compreso): serve per gli URL assoluti di `og:url` e `og:image`.

**Tocca la knowledge base?** Solo in lettura. Nessun `.md` si sposta, `included_files` resta
com'è.

## Decisioni

### 1. Un plugin Vite legge la KB e scrive l'`<head>`

**Decisione.** Un piccolo plugin in `vite.config.ts` (`transformIndexHtml`) legge `about.*.md` e
`config/*.md` in build e genera `<title>`, meta description, Open Graph, Twitter card,
`<link rel="canonical">` e uno JSON-LD `Person`. `index.html` resta un template con un segnaposto.

**Perché.** Rispetta l'ADR-001: se Francesco cambia ruolo in `about.*.md`, l'anteprima segue senza
toccare l'HTML.

**Scartato.** Meta scritte a mano in `index.html`: duplicherebbero la KB e invecchierebbero come il
titolo «Desktop».

### 2. Una lingua per l'anteprima

**Decisione.** L'anteprima e l'HTML statico sono in **una** lingua (le piattaforme ne leggono una
sola): l'**inglese**, scelto da Francesco il 6 ottobre, con `og:locale:alternate` `it_IT`.
`lang` di `<html>` parte da `en` e React lo cambia come oggi in base alla lingua del visitatore.

**Perché.** Il profilo è «disponibile al trasferimento (Italia/Estero)»: l'inglese lo legge
chiunque riceva il link.

**Scartato.** L'italiano, che è la lingua con cui il sito si apre per la maggior parte dei
visitatori ma non per un recruiter estero.

### 3. L'immagine di anteprima si genera dalla KB, una volta

**Decisione.** Uno script `npm run og` disegna una card 1200×630 (nome, ruolo, colori di
`src/styles/tokens.css`) con il Chromium di Playwright e la salva in `public/og.png`, che si
committa. Lo script legge nome e ruolo da `about.en.md`: se cambiano, si rilancia `npm run og`, e
la regola entra in `docs/conoscenza/trappole.md`.

**Perché.** LinkedIn e WhatsApp non accettano SVG; generarla in ogni build Netlify richiederebbe
un browser nel deploy.

**Scartato.** Riusare `public/images/portfolio_v2.jpg`: è lo screenshot di un progetto, non dice
chi è Francesco.

### 4. HTML statico dentro `#root`

**Decisione.** Il plugin mette in `#root` un blocco semantico minimale: `<h1>` con il nome, il
ruolo, il riassunto di `about`, i link a LinkedIn, GitHub ed email. Stessi colori di fondo del
tema per non avere un flash bianco; React lo rimpiazza al montaggio.

**Scartato.** Prerender completo dei quattro tab: molto più lavoro, e il contenuto che conta per
un'anteprima o un crawler è quello della Home.

## Le Fasi

| Fase | Cosa                                                  | Fatto quando…                                                                 |
| ---- | ----------------------------------------------------- | ----------------------------------------------------------------------------- |
| 21   | Plugin Vite: `<head>` generato dalla KB, `lang` coerente | `curl` sull'anteprima Netlify mostra titolo, description e OG giusti         |
| 22   | Immagine di anteprima `og.png` e `npm run og`         | Il link dell'anteprima Netlify incollato in WhatsApp mostra la card          |
| 23   | HTML statico in `#root` + JSON-LD `Person`            | Con JavaScript disattivato il sito mostra nome, ruolo, riassunto e contatti |

## Criterio di «fatto»

- [ ] Il link del sito incollato in WhatsApp (da telefono) e nel Post Inspector di LinkedIn mostra
      nome, ruolo, una riga di descrizione e la card.
- [ ] Con JavaScript disattivato, a 390 px e su desktop, si leggono nome, ruolo, riassunto e
      contatti.
- [ ] Con JavaScript attivo il sito è identico a oggi: nessun flash del contenuto statico.
- [ ] Cambiare `role` in `about.en.md` e rifare la build cambia title, description e OG.

## Fuori da questo piano

- Il peso del bundle (punto 2 di «cosa manca»): il piano non aggiunge dipendenze al client.
- Un dominio personalizzato: gli URL assoluti usano `URL` di Netlify, qualunque esso sia.
- `sitemap.xml` e `robots.txt`: con una sola pagina servono poco; se mai, in coda alla Fase 23.
