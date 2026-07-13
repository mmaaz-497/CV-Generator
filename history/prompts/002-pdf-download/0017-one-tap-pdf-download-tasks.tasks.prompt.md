---
id: 0017
title: One-tap PDF download tasks
stage: tasks
date: 2026-07-13
surface: agent
model: claude-opus-4-8
feature: 002-pdf-download
branch: 002-pdf-download
user: Muhammad Maaz
command: /sp.tasks
labels: ["tasks", "pdf-download", "spike-first", "constitution-v1.1.0"]
links:
  spec: specs/002-pdf-download/spec.md
  ticket: null
  adr: history/adr/0003-client-side-pdf-generation.md
  pr: null
files:
  - specs/002-pdf-download/tasks.md
tests:
  - "Format validation: all 20 tasks follow `- [ ] Trun [P?] [Story?] desc + file path`; story labels on US phases only"
---

## Prompt

/sp.tasks (no additional arguments) — generate the task breakdown for the one-tap PDF download feature.

## Response snapshot

Generated `specs/002-pdf-download/tasks.md` — 20 tasks across 6 phases, organised by the spec's 3 user stories.

- **Phase 1 Setup (2)**: install `html-to-image` + `jspdf`; confirm they are NOT statically imported (dynamic-import-only) and the static export still builds.
- **Phase 2 Foundational (5)**: pure `pdfFilename` + Vitest truth table; **T005 the risk-first spike** (rasterise+assemble a real PDF for Elegant-overflow/dark-sidebar/photo, a long single-column CV, and Classic short ± photo; verify A4 + page-count==print + no split + accent/photo fidelity + zero network calls; record recipe in research; then delete the spike route) — gates T006 paginator + T007 `generateCvPdf`.
- **Phase 3 US1 (P1, MVP, 3)**: `DownloadPdfButton` → wire into `PreviewScreen` via the existing `a4Ref` → T010 MVP checkpoint (one-tap named A4 download, `CV.pdf` fallback).
- **Phase 4 US2 (P2, 3)**: rename `PdfButton`→`PrintButton`; `ExportBar` composing the two labelled actions; verify Print unchanged and controls never in output.
- **Phase 5 US3 (P3, 3)**: export state machine (spinner + double-tap guard) + inline error→Print fallback + verification.
- **Phase 6 Polish (4)**: 360px audit, privacy+packaging gate (zero data-carrying requests; libs in a lazy chunk), fidelity/print-parity matrix (5 templates × photo × short/2-page; residual Android human pass), final build/quickstart/bundle gate.

Spike-first ordering mirrors feature 001's R5 print spike: T005 gates all generation + UI. Testing stays minimal (filename unit test only; fidelity is empirical since raster PDFs have no text layer). Governance threaded through: Principle II gated in T005/T018/T019; the v1.1.0 export-library exception (ADR-0003) noted at the top.

## Outcome

- ✅ Impact: Immediately executable, story-sliced plan with the highest risk (fidelity + page breaks) forced to the front and the privacy invariant gated at three points.
- 🧪 Tests: format validated — every task has checkbox + ID + (story on US phases) + file path; MVP is US1 alone.
- 📁 Files: tasks.md (20 tasks).
- 🔁 Next prompts: `/sp.implement` starting with Phase 1–2 (stop after the T005 spike and report, as in feature 001).
- 🧠 Reflection: Split US1 (happy-path one-tap download) from US3 (spinner/failure UX) so the MVP is a genuine independently-testable slice, rather than bundling all export polish into one story.

## Evaluation notes (flywheel)

- Failure modes observed: none. Kept the spike a throwaway route (deleted after) consistent with the established print-spike pattern.
- Graders run and results (PASS/FAIL): PASS — tasks are story-organised, spike-gated, each with a concrete file path; dependencies + parallel examples + MVP strategy included.
- Prompt variant (if applicable): n/a
- Next experiment (smallest change to try): during `/sp.implement`, have the T005 spike emit a side-by-side page-image diff (download vs print screenshot) so fidelity regressions are visible, not just asserted.
