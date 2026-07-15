---
type: developer-note
lang: en
slug: data-integration-logic-apps
title: Data Integration via Azure Logic Apps
date: "Feb 2023"
order: 2
summary: Designing serverless workflows for the daily import of price lists and trade terms from legacy systems to Azure cloud repositories, with automatic retries for resilience.
tags: [Azure, Logic Apps, Integration, Serverless]
---

## Context

The goal was to move **price lists and trade terms** every day from legacy systems to cloud repositories on Azure, reliably and without manual intervention. The data fed downstream processes, so a missed or partial import had a direct business impact.

## Approach

I chose a **serverless** architecture based on Azure Logic Apps, to avoid managing dedicated infrastructure for an essentially scheduled workload:

- a daily-cadence trigger starts the workflow;
- connection steps read the data from the legacy systems and normalize it;
- the result is written to the destination cloud repository.

The advantage of serverless here is **usage-proportional cost** and zero server maintenance for a job that runs a few times a day.

## Resilience

The critical question in any integration is: **what happens when something fails?** Legacy systems aren't always available and the network can drop. That's why I added:

- **automatic retry policies** on the connection steps, to absorb transient failures without losing the import;
- explicit error handling, so that a persistent failure is visible instead of passing silently.

## Outcome

The import flow became **automatic and resilient**: data arrives every day without manual intervention, and transient failures are absorbed by the retries, drastically reducing missed imports.

## What I learned

In an integration, the "happy path" code is the easy part. The difference between a fragile flow and a reliable one is almost entirely in **error handling and retries**.
