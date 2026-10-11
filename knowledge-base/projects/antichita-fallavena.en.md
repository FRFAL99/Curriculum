---
type: project
lang: en
slug: antichita-fallavena
title: Antichità Fallavena
stack: ["Next.js", "React", "TypeScript", "Firebase", "Netlify", "Brevo"]
image: /images/antichita_fallavena.jpg
demoUrl: https://antichitafallavena.com/
githubUrl: https://github.com/FRFAL99
order: 1
---

## Overview

Website for the family antiques shop in Cento (Ferrara): a catalogue of furniture, paintings and period objects, an exhibitions calendar and an automatic newsletter for subscribers, with a private area where the owner updates everything without touching the code. Built independently with the support of AI tools (**GitHub Copilot**, **Claude**, **ChatGPT**). The site is live and constantly improving.

## Problem

The old site was outdated and no longer maintained. A small-town shop doesn't buy advertising: the only way customers find it is by searching "antiquariato Cento" or "mobili antichi Ferrara" and landing on a page that really answers. It needed an up-to-date online presence and, above all, one that could rank on Google.

## Solution

The site is written in **Next.js 15** (App Router, **TypeScript**) and deployed on **Netlify**: public pages are rendered on the server with the content already in the HTML, while filters, galleries and cards are small client islands. The catalogue and events live on **Firebase Realtime Database**, with a custom admin panel (Google sign-in on a closed list, `noindex`) to edit them without touching the database. The newsletter goes through **Brevo** (REST API, migrated from SendGrid) and a cron job sends event reminders. On the SEO side: a canonical for every page, a sitemap with real dates, a `robots.txt` from a single source, structured data on product pages and a dedicated Services page. The site is now Italian-only, because the database has a single field per language. A CI runs formatting, lint, types, tests (Vitest) and build on every push.

## Challenges

Because of a bug in a provider wrapping the whole tree, the site wasn't serving HTML: every page came out with an empty body and the content appeared only after the JavaScript ran, undoing the ranking work. Then the admin panel, which had to be secure and easy to use, and protecting the public email routes (validation, rate limiting, a secret for the cron). Finally, a cleanup: dead code and unused dependencies removed, and 234 KB of icon CSS and webfonts replaced with inline paths.

## Future Improvements

Bring other languages back: the `next-intl` setup is still in place, but it would need real translations of the content and a database with multiple fields per language.
