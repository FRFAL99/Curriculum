---
type: project
lang: en
slug: portfolio-v2
title: "Portfolio v2 — Desktop"
stack: ["React", "TypeScript", "Vite", "CSS Variables", "Lucide Icons"]
image: /images/portfolio_v2.jpg
demoUrl: "#"
githubUrl: https://github.com/FRFAL99/Curriculum
order: 2
---

## Overview

My new interactive portfolio in a desktop engineer style. Built with React, TypeScript, and Vite, featuring draggable windows, a system clock, mouse coordinate tracking, and a language switcher. It's also the project you're looking at right now.

## Problem

The old portfolio had the same content duplicated in three different places (ResumeWindow, ExperienceWindow, PrintableResume), hard to keep in sync, with no data layer ready for a future AI assistant grounded on real data.

## Solution

A "desktop-style" architecture with draggable windows, and starting from Phase 8, a Markdown Knowledge Base with frontmatter as the Single Source of Truth, read at build-time and shared by every component — the site today, and the AI assistant tomorrow.

## Challenges

Synchronizing state and interactions across multiple windows (drag, minimize, maximize, localStorage persistence), handling IT/EN content everywhere, and a non-obvious bug in the `Buffer` polyfill needed to make `gray-matter` work in the browser.

## Future Improvements

Knowledge Document Viewer (this phase), then an AI assistant grounded on the Knowledge Base with Explainability of cited sources.
