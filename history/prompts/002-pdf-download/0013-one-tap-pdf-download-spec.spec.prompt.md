---
id: 0013
title: One-tap PDF download spec
stage: spec
date: 2026-07-13
surface: agent
model: claude-opus-4-8
feature: 002-pdf-download
branch: 002-pdf-download
user: Muhammad Maaz
command: /sp.specify
labels: ["spec", "pdf-download", "preview", "privacy", "constitution-exception"]
links:
  spec: specs/002-pdf-download/spec.md
  ticket: null
  adr: null
  pr: null
files:
  - specs/002-pdf-download/spec.md (feature specification)
  - specs/002-pdf-download/checklists/requirements.md (quality checklist — all pass)
tests:
  - "Spec quality checklist: 16/16 items pass; 0 [NEEDS CLARIFICATION] markers"
---

## Prompt

The shopkeeper reports a UX problem: tapping "Download PDF" opens the browser print dialog, requiring extra taps to choose "Save as PDF". They want a single tap that saves the PDF directly to the phone, so it can be shared on WhatsApp immediately.

## Change
Replace the single "Download PDF" button on the preview screen with two clearly labeled actions:
1. "Download PDF" — generates an A4 PDF client-side and triggers a direct file download (no print dialog). Filename derived from the customer's name, e.g. "Ahmed-Khan-CV.pdf" (sanitized; fallback "CV.pdf").
2. "Print" — the existing window.print() path, kept for sending straight to a printer.

## Requirements
- The generated PDF MUST be A4 and visually identical to the on-screen preview, for all 5 templates, with and without photo.
- Multi-page CVs MUST produce a multi-page PDF with the same page breaks as the print path — no entry split across pages.
- Generation MUST happen entirely in the browser. The CV data and photo MUST NOT be sent to any server (constitution Principle II is non-negotiable).
- A loading/spinner state MUST show while the PDF is being generated, and the button disabled to prevent double taps.
- If generation fails, show an inline error and suggest the Print button as a fallback.
- Must work on mobile Android Chrome (the shop's actual device).

## Constitutional note
This requires adding a client-side PDF library, which conflicts with the zero-dependency stance of Principle V/VI. Treat this as a justified exception: evaluate the lightest option that keeps the existing HTML templates as the source of truth (i.e. render the existing DOM to PDF rather than rewriting all 5 templates in a PDF-specific renderer). Record the decision and its tradeoffs, and amend the constitution if needed. Do NOT rewrite the templates.

## Out of scope
- Server-side PDF generation
- Changing template designs
- Direct WhatsApp share integration

## Response snapshot

Created branch `002-pdf-download` and wrote the feature spec. Three prioritized, independently-testable user stories: US1 (P1) one-tap direct A4 download named `<First>-<Last>-CV.pdf` (fallback `CV.pdf`), US2 (P2) Print retained as a separate labelled action, US3 (P3) loading/disabled state + inline error with Print fallback. 13 functional requirements (FR-006 = nothing leaves the device, non-negotiable; FR-013 = existing templates stay the source of truth, no rewrite), 8 measurable success criteria (single tap, tap-count drop, 5-templates × photo fidelity, matching multi-page breaks / no split, zero data-carrying network requests, filename correctness, ~<5s perceived, guaranteed Print fallback on failure). Edge cases cover name sanitisation, long/empty names, double-tap, photo, 2-page CVs, low-memory failure.

The constitutional exception (adding a client-side PDF capability vs zero-dependency Principle V/VI) is recorded in Assumptions & Dependencies and deferred to planning (ADR + constitution amendment), bounded by FR-006 and FR-013. The spec names no specific library. No clarifications were needed — the request had sensible defaults throughout. Quality checklist: 16/16 pass.

## Outcome

- ✅ Impact: Spec ready for `/sp.plan`. Scope is a bounded change to the preview screen's export actions, with privacy and template-fidelity as hard constraints.
- 🧪 Tests: quality checklist 16/16; 0 clarification markers.
- 📁 Files: spec.md + checklists/requirements.md on branch 002-pdf-download.
- 🔁 Next prompts: `/sp.plan` — evaluate the lightest DOM-to-PDF approach (source of truth = existing templates), and `/sp.adr` for the constitution exception; the plan must preserve the validated print-path page-break behaviour (feature 001 R5).
- 🧠 Reflection: Kept the one hard technical constraint (on-device generation) framed as a privacy requirement, not an implementation choice, so the spec stays stakeholder-readable while making Principle II non-negotiable.

## Evaluation notes (flywheel)

- Failure modes observed: `create-new-feature.ps1` failed on PS 5.1 (positional-arg binding) but still created the branch + spec dir; completed the spec agent-natively.
- Graders run and results (PASS/FAIL): PASS — spec quality checklist 16/16, no unresolved markers.
- Prompt variant (if applicable): n/a
- Next experiment (smallest change to try): in `/sp.plan`, spike the chosen DOM-to-PDF library on one sidebar template (Elegant, overflow) early to confirm it reproduces the R5 two-region page breaks before committing — same risk-first approach as feature 001's print spike.
