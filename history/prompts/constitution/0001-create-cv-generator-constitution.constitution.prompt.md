---
id: 0001
title: Create CV Generator constitution
stage: constitution
date: 2026-07-11
surface: agent
model: claude-fable-5
feature: none
branch: master
user: Muhammad Maaz
command: /sp.constitution
labels: ["constitution", "cv-generator", "mobile-first", "zero-backend", "print"]
links:
  spec: null
  ticket: null
  adr: null
  pr: null
files:
  - .specify/memory/constitution.md
tests:
  - none (documentation artifact; no automated tests applicable)
---

## Prompt

Create a constitution for a CV Generator web app built with Next.js. This app will be used in a shop where a shopkeeper creates CVs for walk-in customers on a mobile phone browser. Core principles:

1. Mobile-First: Every screen must work perfectly on a 360px-wide mobile browser. Touch targets minimum 44px. The shopkeeper uses this on a phone all day.

2. Zero Backend: Pure client-side Next.js app. No database, no API routes, no user accounts, no data persistence. All state lives in React memory only. Page refresh = fresh start for the next customer. Customer data must never leave the device.

3. Print-Perfect Output: Every CV template must render pixel-perfect on A4 size via the browser's print-to-PDF. Print styles (@media print) are a first-class requirement, not an afterthought. No cut-off content, no broken page margins.

4. Speed of Use: A complete CV must be creatable in under 5 minutes. No unnecessary steps, no mandatory fields beyond name and phone. Empty sections must never render on the final CV.

5. Simplicity Over Cleverness: Prefer plain React state over state libraries where possible. Prefer CSS over JS. No feature should require documentation to use — the UI must be self-explanatory for a non-technical shopkeeper.

6. Tech Stack: Next.js (App Router) with TypeScript, Tailwind CSS, client components only, deployable on Vercel free tier as a static-friendly app.

## Response snapshot

Ratified constitution v1.0.0 at `.specify/memory/constitution.md` with six core principles mapped 1:1 from user input: I. Mobile-First (360px viewport, 44px touch targets), II. Zero Backend, Zero Persistence (React memory only, no storage APIs, data never leaves device), III. Print-Perfect Output (A4 @media print as first-class deliverable), IV. Speed of Use (<5 min, only name+phone mandatory, empty sections never render), V. Simplicity Over Cleverness (plain React state, CSS over JS, self-explanatory UI), VI. Fixed Tech Stack (Next.js App Router, TypeScript, Tailwind, client components, Vercel free tier). Added Additional Constraints (privacy, offline tolerance, A4-only, mobile input types), Development Workflow & Quality Gates (six checkable gates per feature), and Governance (semver amendment policy, compliance review). Sync Impact Report embedded as HTML comment; plan/spec/tasks templates verified aligned (dynamic constitution gate, no static edits needed).

## Outcome

- ✅ Impact: Project constitution ratified at v1.0.0; establishes binding gates for all future specs, plans, and implementations.
- 🧪 Tests: None — documentation artifact.
- 📁 Files: .specify/memory/constitution.md (created from template)
- 🔁 Next prompts: /sp.specify to define the first feature (CV form + templates + print flow).
- 🧠 Reflection: User principles were complete and unambiguous; no clarifiers needed. Ratification date set to today (initial adoption).

## Evaluation notes (flywheel)

- Failure modes observed: none — PHR shell script absent, agent-native fallback used as designed.
- Graders run and results (PASS/FAIL): PASS — no unresolved placeholders, ISO dates, version line matches Sync Impact Report.
- Prompt variant (if applicable): n/a
- Next experiment (smallest change to try): n/a
