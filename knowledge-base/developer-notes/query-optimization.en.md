---
type: developer-note
lang: en
slug: query-optimization
title: Query Optimization and Concurrency in Enterprise Databases
date: "Nov 2023"
order: 1
summary: How I analyzed and eliminated recurring deadlocks on high-volume TPM transactions by working on SQL indexes and transaction isolation levels.
tags: [SQL, Performance, Concurrency, Database]
---

## Context

On a high-volume enterprise system, some TPM (Trade Promotion Management) transactions produced **recurring deadlocks** during peak hours. The symptom was intermittent and hard to reproduce in development: contention only surfaced under real load, when multiple processes wrote to the same tables at the same instant.

## Diagnosis

The first step was to **make the problem observable** instead of guessing:

- collecting deadlock graphs to understand which resources were contended and in what order locks were acquired;
- analyzing the execution plans of the queries involved, looking for unnecessary scans and lock escalation;
- correlating deadlock timestamps with batch jobs running in parallel with interactive inserts.

The recurring pattern was locks acquired in a **different order** by two code paths — the classic recipe for a deadlock.

## Solution

The fix worked on two complementary fronts:

- **SQL index optimization**: adding and reshaping targeted indexes to remove the scans that held locks longer than necessary, shrinking the contention window.
- **Isolation level tuning**: revising the transaction isolation level to balance consistency and concurrency, avoiding locks more aggressive than needed where semantics allowed.

In parallel, the resource-access order was made **consistent** across the different paths, removing the cause of the wait cycle.

## Outcome

The recurring deadlocks were eliminated and high-volume transactions went back to completing without forced retries, keeping the platform stable even during peak hours.

## What I learned

A deadlock is rarely solved by a single "fix": it's almost always the combination of **how queries are written**, **which indexes exist**, and **the order in which code touches resources**. Making the problem measurable is half the job.
