---
type: project
lang: it
slug: portfolio-v2
title: "Portfolio v2"
stack: ["React", "TypeScript", "Vite", "Netlify Functions", "OpenRouter"]
image: /images/portfolio_v2.jpg
demoUrl: "#"
githubUrl: https://github.com/FRFAL99/Curriculum
order: 2
---

## Overview

Il mio portfolio interattivo: una landing page con Home e tab (Curriculum, Progetti, Developer Notes) e un assistente AI che risponde su di me, grounded su una Knowledge Base in Markdown. Costruito con React, TypeScript e Vite, con tema chiaro/scuro e multilingua IT/EN. È anche il progetto che stai guardando ora.

## Problem

Il vecchio portfolio aveva gli stessi contenuti duplicati in tre punti diversi (Resume, Experience, PrintableResume), difficili da mantenere allineati, e nessuna base dati pronta per un assistente AI grounded sui dati reali.

## Solution

Una Knowledge Base in Markdown con frontmatter come Single Source of Truth, letta a build-time dalla UI e a runtime dalla Netlify Function dell'assistente AI: gli stessi file `.md` alimentano sito e AI, così aggiungere un contenuto lo rende disponibile ovunque senza toccare il codice. L'interfaccia è una landing page classica con Home + tab (evoluta da un primo prototipo in stile desktop), con l'AI che cita le fonti effettivamente usate.

## Challenges

Tenere UI e AI perfettamente allineate da un'unica fonte Markdown, dare grounding all'assistente con citazione delle fonti reali (niente allucinazioni fuori scope), gestire il multilingua IT/EN su tutti i contenuti, e un bug non banale nel polyfill di `Buffer` necessario per far funzionare `gray-matter` nel browser.

## Future Improvements

Deep-link al singolo case study/articolo, cross-reference tra documenti della Knowledge Base e ricerca/categorizzazione degli articoli.
