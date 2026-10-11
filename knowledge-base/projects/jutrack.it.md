---
type: project
lang: it
slug: jutrack
title: JuTrack
stack: ["React Native", "Expo", "TypeScript", "SQLite", "Yjs", "Cloudflare Workers"]
image: /images/jutrack.svg
demoUrl: "#"
githubUrl: https://github.com/FRFAL99
order: 3
---

## Overview

App Android per tracciare le spese condivise (coppie, coinquilini, viaggi): **local-first** e con **cifratura end-to-end**, senza account, e-mail, pubblicità o tracciamento. I dati vivono sui telefoni; il server si limita a portare blob cifrati. L'app è su Google Play in test chiuso.

## Problem

Le app per dividere le spese chiedono di registrarsi e tengono i dati dei gruppi su un server che può leggerli. Serviva un'alternativa in cui le informazioni restino ai membri del gruppo, anche se il server venisse compromesso.

## Solution

Ogni gruppo è un vault con una propria chiave: lo stato è un documento **Yjs** sul telefono, salvato su **SQLite** e sincronizzato in forma cifrata tramite un relay su **Cloudflare Workers** (un Durable Object per gruppo) che non ha la chiave e non può leggere nulla. Si entra in un gruppo con un QR code o un link, con la chiave nel fragment dell'URL. Una spesa si aggiunge con un importo e un tap, con calcolatrice integrata, oppure scrivendola in una riga (la frase è interpretata sul telefono, per ora solo in italiano). L'app mostra la quota di ciascuno, semplifica i debiti nel minor numero di pagamenti e conta un pareggio solo quando chi riceve conferma. Ci sono budget per categoria e mese, grafici organizzati come sette domande, widget Android, notifiche facoltative, sei temi e interfaccia italiano/inglese. I dati si recuperano con un codice di recupero, un backup automatico cifrato ed esportazioni in Excel e JSON.

## Challenges

Rendere utilizzabile la cifratura end-to-end senza account: identità crittografica dei membri, recupero su un nuovo telefono tramite codice, e il limite dichiarato che senza telefono e codice i dati non si recuperano. A questo si aggiungono la sincronizzazione tra dispositivi su un relay che conserva gli aggiornamenti per 30 giorni e comportamenti (tastiera, permessi sulle cartelle, notifiche) che solo la prova su dispositivo reale conferma.

## Future Improvements

Completare la verifica su dispositivo di backup, esportazioni e grafici e, concluso il periodo di test chiuso, chiedere l'accesso alla produzione su Google Play. Il parser delle frasi capisce per ora solo l'italiano.
