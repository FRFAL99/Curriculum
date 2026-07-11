---
type: project
lang: it
slug: portfolio-v2
title: "Portfolio v2 — Desktop"
stack: ["React", "TypeScript", "Vite", "CSS Variables", "Lucide Icons"]
image: /images/portfolio_v2.jpg
demoUrl: "#"
githubUrl: https://github.com/FRFAL99/Curriculum
order: 2
---

## Overview

Il mio nuovo portfolio interattivo in stile desktop engineer. Costruito con React, TypeScript e Vite, con drag delle finestre, orologio di sistema, coordinate del mouse e switch multilingua. È anche il progetto che stai guardando ora.

## Problem

Il vecchio portfolio aveva contenuti duplicati in tre punti diversi (ResumeWindow, ExperienceWindow, PrintableResume), difficili da mantenere allineati, e nessuna base dati pronta per un futuro assistente AI grounded sui dati reali.

## Solution

Architettura "desktop-style" con finestre trascinabili, e dalla Fase 8 una Knowledge Base in Markdown con frontmatter come Single Source of Truth, letta a build-time e condivisa da tutti i componenti — sito, e in futuro l'assistente AI.

## Challenges

Sincronizzare stato e interazioni di più finestre (drag, minimize, maximize, persistenza in localStorage), gestire il multilingua IT/EN su tutti i contenuti, e un bug non banale nel polyfill di `Buffer` necessario per far funzionare `gray-matter` nel browser.

## Future Improvements

Knowledge Document Viewer (questa fase), poi un assistente AI grounded sulla Knowledge Base con Explainability delle fonti citate.
