---
id: 0015
title: ADR client-side PDF generation
stage: misc
date: 2026-07-13
surface: agent
model: claude-opus-4-8
feature: 002-pdf-download
branch: 002-pdf-download
user: Muhammad Maaz
command: /sp.adr
labels: ["adr", "pdf-download", "dependency-exception", "governance", "conflict-flagged"]
links:
  spec: specs/002-pdf-download/spec.md
  ticket: null
  adr: history/adr/0003-client-side-pdf-generation.md
  pr: null
files:
  - history/adr/0003-client-side-pdf-generation.md (new — Accepted)
  - history/adr/0001-client-only-application-architecture.md (narrowing cross-ref added)
tests:
  - "ADR significance test: PASS (impact/alternatives/scope all true)"
  - "ADR quality grader: PASS (clustered decision, 5 alternatives with pros/cons, positive+negative consequences, references)"
---

## Prompt

/sp.adr (no additional title argument) — analyze the 002-pdf-download plan and record architecturally significant decisions as ADRs.

## Response snapshot

Extracted exactly one significant decision cluster from the plan — **Client-Side PDF Generation** — and recorded it as ADR-0003 (Accepted). Clustered: rendering (`html-to-image`, SVG-foreignObject native rasterisation for `color-mix()` fidelity) + assembly/download (`jspdf` A4 image pages → Blob → silent `<a download>`) + a custom entry-atomic paginator reusing the R5 print structure + dynamic-`import()` packaging + the governance exception. These change together, so one ADR, not per-library ADRs.

Significance test PASSED on all three axes (impacts dependency policy long-term; 5 alternatives with tradeoffs; cross-cutting across bundle/privacy/export). Alternatives documented with pros+cons: html2canvas+jsPDF (no `color-mix()`, splits entries), jsPDF.html (same), pdf-lib (violates FR-013), Paged.js (heavy/divergent), print-only (still shows dialog), static import (bloats first paint).

**Conflict flagged & resolved:** ADR-0001 fixed "no PDF library / zero runtime deps." ADR-0003 **narrows** that one clause (scoped to on-device export) while leaving zero-backend/zero-persistence/nothing-transmitted fully in force. Added a "Narrowed by ADR-0003" cross-reference note into ADR-0001's dependency line rather than rewriting its history; ADR-0001 stays Accepted.

Flagged the required governance follow-up: a constitution amendment (v1.0.0 → v1.1.0, MINOR) permitting narrowly-scoped, dynamically-imported client-side libs for on-device export, with Principle II reaffirmed non-negotiable. (Did NOT auto-edit the constitution — that is the `/sp.constitution` governance flow and needs consent.)

## Outcome

- ✅ Impact: The dependency exception is now a permanent, reviewable record with explicit tradeoffs and a clear boundary; ADR-0001's conflict is reconciled, not silently overwritten.
- 🧪 Tests: significance test PASS; ADR quality grader PASS (clustered, alternatives+tradeoffs, both-sided consequences, linked references).
- 📁 Files: ADR-0003 (new) + ADR-0001 (narrowing note).
- 🔁 Next prompts: amend the constitution (`/sp.constitution` — permit the scoped export-lib exception, bump to v1.1.0), then `/sp.tasks`. Tasks must front-load the R1/R4 fidelity+breaks spike.
- 🧠 Reflection: The honest move was flagging that ADR-0003 conflicts with ADR-0001 and narrowing it via cross-reference — an ADR that silently contradicted an earlier accepted one would rot the record. Kept it a single ADR to avoid the over-granular per-library trap.

## Evaluation notes (flywheel)

- Failure modes observed: no `create-adr.sh`/`.ps1` script present — authored the ADR agent-natively from the template (same as feature 001).
- Graders run and results (PASS/FAIL): PASS — significance (3/3) and ADR checklist (clustered decision, ≥1 alternative with rationale, pros/cons, concise-but-sufficient).
- Prompt variant (if applicable): n/a
- Next experiment (smallest change to try): when amending the constitution, add an explicit "export-only client libs" allowance under Additional Constraints so future reviewers see the boundary without reading the ADR.
