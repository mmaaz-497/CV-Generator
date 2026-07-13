---
id: 0020
title: Update CLAUDE.md project context
stage: general
date: 2026-07-13
surface: agent
model: claude-opus-4-8
feature: none
branch: 002-pdf-download
user: Muhammad Maaz
command: (freeform)
labels: ["docs", "claude-md", "onboarding", "project-context"]
links:
  spec: null
  ticket: null
  adr: null
  pr: null
files:
  - CLAUDE.md (added "# Project: CV Generator" context block near the top)
tests:
  - "n/a (documentation only)"
---

## Prompt

Please update the claude.md file according to this project so that the context can be understood in a new session.

## Response snapshot

CLAUDE.md was the generic SpecKit Plus SDD workflow rules with no project-specific context. Inserted a prominent, comment-delimited **"# Project: CV Generator"** block right after the intro (before the generic SDD rules, which are left intact) so a fresh session sees it first. It covers:

- What the app is (mobile-first, 100% client-side CV generator → A4 PDF) and that it's governed by constitution v1.1.0.
- The six non-negotiable constitution constraints, incl. the v1.1.0 on-device export-library exception (ADR-0003).
- Tech stack + concrete file map: state (useReducer+Context, pure reducer), emptiness authority, templates + registry (and the circular-import reason it lives in `templates/registry.ts`), screens, print CSS, photo pipeline, and the `src/lib/pdf/` download module.
- Status: feature 001 COMPLETE (48 tasks; residual human-only T044/T046); feature 002 IN PROGRESS (Phase 1–2 + US1 done; US2/US3/Phase 6 remaining).
- Build/test commands + the minimal-testing policy (Vitest for pure logic only; everything visual/print/PDF verified via headless puppeteer + pdfjs harnesses against the real `out/` build).
- Environment gotchas: PS 5.1 script failures + absent create-adr/create-phr scripts (author agent-natively); `color-mix()` requires a native renderer (html-to-image, not html2canvas); preview `.a4` transform → capture from an offscreen clone; Classic/Minimal uppercase the name (case-insensitive assertions); the npm-audit PostCSS-via-Next advisories are pre-existing (don't "fix").

## Outcome

- ✅ Impact: A new session can understand the project, its hard constraints, current status, and the non-obvious traps without re-deriving them.
- 🧪 Tests: n/a (docs).
- 📁 Files: CLAUDE.md.
- 🔁 Next prompts: continue feature 002 — US2 (T011–T013).
- 🧠 Reflection: Front-loaded the constraints + gotchas (color-mix, transform-scale, uppercase-name, PS 5.1) because those are the things a cold session would otherwise rediscover the hard way.

## Evaluation notes (flywheel)

- Failure modes observed: none.
- Graders run and results (PASS/FAIL): PASS — context block is accurate to the current tree and status.
- Prompt variant (if applicable): n/a
- Next experiment (smallest change to try): keep the Status section current as feature 002 progresses (update after US2/US3/Phase 6).
