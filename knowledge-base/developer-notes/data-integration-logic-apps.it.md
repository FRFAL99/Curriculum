---
type: developer-note
lang: it
slug: data-integration-logic-apps
title: Integrazione Dati via Azure Logic Apps
date: "Feb 2023"
order: 2
summary: Progettazione di flussi serverless per l'importazione quotidiana di listini e trade terms da sistemi legacy a repository cloud Azure, con retry automatici per la resilienza.
tags: [Azure, Logic Apps, Integration, Serverless]
---

## Contesto

L'obiettivo era portare ogni giorno **listini e trade terms** da sistemi legacy verso repository cloud su Azure, in modo affidabile e senza intervento manuale. I dati alimentavano processi a valle, quindi un import mancato o parziale aveva un impatto diretto sul business.

## Approccio

Ho scelto un'architettura **serverless** basata su Azure Logic Apps, per evitare di gestire infrastruttura dedicata a un carico essenzialmente schedulato:

- un trigger a cadenza giornaliera avvia il flusso;
- gli step di connessione leggono i dati dai sistemi legacy e li normalizzano;
- il risultato viene scritto nel repository cloud di destinazione.

Il vantaggio del serverless qui è il **costo proporzionale all'uso** e zero manutenzione di server per un job che gira poche volte al giorno.

## Resilienza

Il punto critico di ogni integrazione è: **cosa succede quando qualcosa fallisce?** I sistemi legacy non sono sempre disponibili e la rete può cadere. Per questo ho aggiunto:

- **policy di retry automatiche** sugli step di connessione, per assorbire i fallimenti transitori senza perdere l'import;
- una gestione esplicita degli errori, così che un fallimento persistente sia visibile invece di passare in silenzio.

## Risultato

Il flusso di importazione è diventato **automatico e resiliente**: i dati arrivano ogni giorno senza intervento manuale e i fallimenti transitori vengono riassorbiti dai retry, riducendo drasticamente gli import mancati.

## Cosa ho imparato

In un'integrazione, il codice del "percorso felice" è la parte facile. La differenza tra un flusso fragile e uno affidabile sta quasi tutta nella **gestione degli errori e dei retry**.
