---
id: 0005
title: ADRs for client architecture and print strategy
stage: plan
date: 2026-07-11
surface: agent
model: claude-fable-5
feature: 001-cv-generator
branch: 001-cv-generator
user: Muhammad Maaz
command: /sp.adr
labels: ["adr", "architecture", "client-only", "print", "cv-generator"]
links:
  spec: specs/001-cv-generator/spec.md
  ticket: null
  adr: history/adr/0001-client-only-application-architecture.md
  pr: null
files:
  - history/adr/0001-client-only-application-architecture.md
  - history/adr/0002-a4-print-output-strategy.md
tests:
  - none (documentation artifacts; significance checklist applied to both ADRs — PASS)
---

## Prompt

/sp.adr cv-generator-client-architecture — Analyze planning artifacts and document architecturally significant decisions as ADRs.

## Response snapshot

Extracted decision clusters from plan.md/research.md; no existing ADRs (history/adr/ empty, no conflicts). No create-adr script exists — used adr-template.md agent-natively. Two clusters passed the 3-part significance test (impact, alternatives, cross-cutting):

- ADR-0001 Client-Only Application Architecture (Accepted): static export Next.js, zero runtime deps, single CVDocument via pure useReducer + one Context, single route with in-memory screen enum, beforeunload guard, canvas-downscaled base64 photo. Alternatives rejected: hybrid Next.js + localStorage drafts (privacy regression), Zustand/RHF/multi-route (dependency overhead, back-swipe conflicts), Vite SPA (constitution fixes stack).
- ADR-0002 A4 Print-to-PDF Output Strategy (Accepted): browser print dialog only, @page A4 margin 0 with mm-based template margins, .no-print isolation, break-inside: avoid pagination, page-1-only sidebar grid (mandatory early spike), CSS custom-property restyling, live scaled thumbnails. Alternatives rejected: jspdf/html2canvas (deps + fidelity drift), JS pagination (re-implements browser engine), repeating sidebar (rejected by clarification), static thumbnail images (drift).

Both ADRs cross-reference each other, plan.md key decisions, research records, and the spec.

## Outcome

- ✅ Impact: Both architecturally significant decision clusters permanently documented with alternatives and tradeoffs; ready for team review before /sp.tasks.
- 🧪 Tests: Significance checklist 3/3 for both; over-granularity check passed (clusters, not per-tech ADRs); each lists ≥3 alternatives with rationale.
- 📁 Files: history/adr/0001-client-only-application-architecture.md; history/adr/0002-a4-print-output-strategy.md
- 🔁 Next prompts: /sp.tasks to generate the dependency-ordered task list.
- 🧠 Reflection: The print strategy earned its own ADR because it can evolve independently of the state architecture (e.g., a future PDF library swap wouldn't touch ADR-0001).

## Evaluation notes (flywheel)

- Failure modes observed: create-adr.sh absent (as with create-phr.sh) — agent-native template fallback used; consider adding the script for parity with other SpecKit installs.
- Graders run and results (PASS/FAIL): PASS — clustered decisions, explicit alternatives, positive and negative consequences, references linked.
- Prompt variant (if applicable): n/a
- Next experiment (smallest change to try): n/a
