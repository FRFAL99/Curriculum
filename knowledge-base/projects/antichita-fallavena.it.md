---
type: project
lang: it
slug: antichita-fallavena
title: Antichità Fallavena
stack: ["Next.js", "React", "Firebase", "Netlify"]
image: /images/antichita_fallavena.jpg
demoUrl: https://antichitafallavena.com/
githubUrl: https://github.com/FRFAL99
order: 1
---

## Overview

Sito vetrina per un'attività di famiglia, con catalogo prodotti ed eventi e newsletter automatica per gli iscritti, sviluppato in autonomia con supporto di strumenti AI (**GitHub Copilot**, **Claude**, **ChatGPT**).

## Problem

Il vecchio sito era obsoleto e non più mantenuto: l'attività aveva bisogno di una presenza online aggiornata per farsi conoscere anche fuori dal negozio fisico.

## Solution

Il sito è stato riscritto in **Next.js** e deployato su **Netlify** — la prima versione era in React puro, ma serviva più controllo lato server. Il catalogo di prodotti ed eventi è gestito su **Firebase**, con un pannello di amministrazione realizzato ad hoc che permette di modificare i contenuti senza intervenire direttamente sul database. È stata inoltre implementata una newsletter con un cron job che invia automaticamente le novità agli iscritti.

## Challenges

Progettare un pannello di amministrazione sicuro e semplice da usare per gestire prodotti ed eventi senza accesso diretto al database, e orchestrare l'invio automatico della newsletter tramite cron job.

## Future Improvements

Migliorare la navigazione interna del sito e rendere l'interfaccia più user-friendly.
