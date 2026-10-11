---
type: project
lang: it
slug: antichita-fallavena
title: Antichità Fallavena
stack: ["Next.js", "React", "TypeScript", "Firebase", "Netlify", "Brevo"]
image: /images/antichita_fallavena.jpg
demoUrl: https://antichitafallavena.com/
githubUrl: https://github.com/FRFAL99
order: 1
---

## Overview

Sito del negozio di antiquariato di famiglia a Cento (Ferrara): catalogo di mobili, dipinti e oggetti d'epoca, calendario delle mostre e newsletter automatica per gli iscritti, con un'area riservata da cui il titolare aggiorna tutto senza toccare il codice. Sviluppato in autonomia con supporto di strumenti AI (**GitHub Copilot**, **Claude**, **ChatGPT**). Il sito è online e in continuo miglioramento.

## Problem

Il vecchio sito era obsoleto e non più mantenuto. Un negozio di paese non compra pubblicità: l'unico modo in cui un cliente lo trova è cercare «antiquariato Cento» o «mobili antichi Ferrara» e trovare una pagina che risponde davvero. Serviva quindi una presenza online aggiornata e, soprattutto, posizionabile su Google.

## Solution

Il sito è scritto in **Next.js 15** (App Router, **TypeScript**) e deployato su **Netlify**: le pagine pubbliche escono dal server con il contenuto già nell'HTML, mentre filtri, gallerie e schede sono piccole isole client. Catalogo ed eventi stanno su **Firebase Realtime Database**, con un pannello di amministrazione ad hoc (accesso Google su lista chiusa, `noindex`) che permette di modificarli senza intervenire sul database. La newsletter passa da **Brevo** (via API REST, migrata da SendGrid) e un cron job invia i reminder degli eventi. Sul fronte SEO: canonical per ogni pagina, sitemap con date reali, `robots.txt` da un'unica sorgente, dati strutturati sulle schede prodotto e una pagina Servizi dedicata. Il sito è ora solo in italiano, perché il database ha un solo campo per lingua. Una CI esegue formattazione, lint, tipi, test (Vitest) e build a ogni push.

## Challenges

Per un bug in un provider che avvolgeva l'intero albero, il sito non serviva HTML: ogni pagina usciva con il corpo vuoto e il contenuto compariva solo dopo l'esecuzione del JavaScript, vanificando il lavoro di posizionamento. Poi il pannello di amministrazione, che doveva essere sicuro e semplice da usare, e la protezione delle rotte email pubbliche (validazione, rate limiting, segreto per il cron). Infine la pulizia: rimossi codice morto e dipendenze inutilizzate, e sostituiti 234 KB di CSS e webfont per le icone con tracciati in linea.

## Future Improvements

Reintrodurre altre lingue: la struttura di `next-intl` è rimasta, ma servirebbero traduzioni vere dei contenuti e un database con più campi per lingua.
