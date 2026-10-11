---
type: project
lang: en
slug: jutrack
title: JuTrack
stack: ["React Native", "Expo", "TypeScript", "SQLite", "Yjs", "Cloudflare Workers"]
image: /images/jutrack.svg
demoUrl: "#"
githubUrl: https://github.com/FRFAL99
order: 3
---

## Overview

An Android app for tracking shared expenses (couples, flatmates, trips): **local-first** and **end-to-end encrypted**, with no account, e-mail, ads or tracking. The data lives on the phones; the server only carries encrypted blobs. The app is on Google Play in closed testing.

## Problem

Expense-splitting apps ask you to sign up and keep group data on a server that can read it. The goal was an alternative where the information stays with the group members, even if the server were compromised.

## Solution

Each group is a vault with its own key: the state is a **Yjs** document on the phone, stored in **SQLite** and synced in encrypted form through a relay on **Cloudflare Workers** (one Durable Object per group) that has no key and can read nothing. You join a group with a QR code or a link, with the key in the URL fragment. An expense is an amount and a tap, with a built-in calculator, or a one-line sentence (parsed on the phone, Italian only for now). The app shows everyone's share, simplifies debts into the fewest payments, and counts a settle-up only once the receiver confirms it. It has budgets per category and month, charts organised as seven questions, Android widgets, optional notifications, six themes and an Italian/English interface. Data can be recovered with a recovery code, an encrypted automatic backup, and Excel and JSON exports.

## Challenges

Making end-to-end encryption usable without accounts: a cryptographic identity for members, recovery on a new phone through a code, and the stated limit that without the phone and the code the data cannot be recovered. On top of that, syncing devices through a relay that keeps updates for 30 days, and behaviours (keyboard, folder permissions, notifications) that only testing on a real device confirms.

## Future Improvements

Finish verifying backup, exports and charts on a device and, once closed testing is over, request production access on Google Play. The sentence parser only understands Italian for now.
