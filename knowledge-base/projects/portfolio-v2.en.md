---
type: project
lang: en
slug: portfolio-v2
title: "Portfolio v2"
stack: ["React", "TypeScript", "Vite", "Netlify Functions", "OpenRouter"]
image: /images/portfolio_v2.jpg
demoUrl: "#"
githubUrl: https://github.com/FRFAL99/Curriculum
order: 2
---

## Overview

My interactive portfolio: a landing page with a Home and tabs (Resume, Projects, Developer Notes) plus an AI assistant that answers questions about me, grounded on a Markdown Knowledge Base. Built with React, TypeScript, and Vite, with light/dark theme and IT/EN localization. It's also the project you're looking at right now.

## Problem

The old portfolio had the same content duplicated in three different places (Resume, Experience, PrintableResume), hard to keep in sync, with no data layer ready for an AI assistant grounded on real data.

## Solution

A Markdown Knowledge Base with frontmatter as the Single Source of Truth, read at build-time by the UI and at runtime by the AI assistant's Netlify Function: the same `.md` files feed both the site and the AI, so adding content makes it available everywhere with no code changes. The interface is a classic landing page with a Home and tabs (evolved from an earlier desktop-style prototype), with the AI citing the sources it actually used.

## Challenges

Keeping the UI and the AI perfectly aligned from a single Markdown source, grounding the assistant with citations of real sources (no out-of-scope hallucinations), handling IT/EN content everywhere, and a non-obvious bug in the `Buffer` polyfill needed to make `gray-matter` work in the browser.

## Future Improvements

Deep-linking to a single case study/article, cross-references between Knowledge Base documents, and search/categorization of articles.
