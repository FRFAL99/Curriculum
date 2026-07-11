---
type: project
lang: en
slug: antichita-fallavena
title: Antichità Fallavena
stack: ["Next.js", "React", "Firebase", "Netlify"]
image: /images/antichita_fallavena.jpg
demoUrl: https://antichitafallavena.com/
githubUrl: https://github.com/FRFAL99
order: 1
---

## Overview

Showcase website for a family business, with a product/event catalog and an automatic newsletter for subscribers, built independently with the help of AI tools (**GitHub Copilot**, **Claude**, **ChatGPT**).

## Problem

The old website was outdated and no longer maintained: the business needed an up-to-date online presence to reach customers beyond the physical store.

## Solution

The site was rewritten in **Next.js** and deployed on **Netlify** — the first version was plain React, but server-side control was needed. The product and event catalog is managed on **Firebase**, with a custom-built admin panel that lets content be updated without touching the database directly. A newsletter feature was also added, with a cron job automatically emailing news to subscribers.

## Challenges

Designing an admin panel that's secure and simple enough to manage products and events without direct database access, and orchestrating the automatic newsletter delivery through a cron job.

## Future Improvements

Improve the site's internal navigation and make the interface more user-friendly.
