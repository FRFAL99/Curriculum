---
type: developer-note
lang: it
slug: query-optimization
title: Ottimizzazione Query e Concorrenza su Database Enterprise
date: "Nov 2023"
order: 1
summary: Come ho analizzato ed eliminato deadlock ricorrenti su transazioni TPM ad alto volume, lavorando su indici SQL e livelli di isolamento delle transazioni.
tags: [SQL, Performance, Concurrency, Database]
---

## Contesto

Su un gestionale enterprise ad alto volume, alcune transazioni TPM (Trade Promotion Management) generavano **deadlock ricorrenti** nelle ore di picco. Il sintomo era intermittente e difficile da riprodurre in sviluppo: la contesa emergeva solo sotto carico reale, quando più processi scrivevano sulle stesse tabelle nello stesso istante.

## Diagnosi

Il primo passo è stato **rendere osservabile** il problema invece di indovinare:

- raccolta dei deadlock graph per capire quali risorse erano contese e in quale ordine venivano acquisiti i lock;
- analisi dei piani di esecuzione delle query coinvolte, alla ricerca di scan inutili e lock escalation;
- correlazione tra gli orari dei deadlock e i job batch che giravano in parallelo agli inserimenti interattivi.

Il pattern ricorrente era l'acquisizione dei lock in **ordine diverso** da due percorsi di codice, condizione classica per un deadlock.

## Soluzione

L'intervento si è mosso su due fronti complementari:

- **Ottimizzazione degli indici SQL**: aggiunta e ridisegno di indici mirati per eliminare gli scan che tenevano lock più a lungo del necessario, riducendo la finestra di contesa.
- **Tuning del livello di isolamento**: revisione del transaction isolation level per bilanciare consistenza e concorrenza, evitando lock più aggressivi del necessario dove la semantica lo permetteva.

In parallelo, l'ordine di accesso alle risorse è stato reso **coerente** tra i vari percorsi, così da rimuovere la causa del ciclo di attesa.

## Risultato

I deadlock ricorrenti sono stati eliminati e le transazioni ad alto volume hanno ripreso a completare senza retry forzati, mantenendo la piattaforma stabile anche nelle ore di picco.

## Cosa ho imparato

Un deadlock raramente si risolve con un singolo "fix": è quasi sempre la combinazione tra **come sono scritte le query**, **quali indici esistono** e **in che ordine il codice tocca le risorse**. Rendere il problema misurabile è metà del lavoro.
