---
id: 0003
title: Clarify CV Generator spec ambiguities
stage: spec
date: 2026-07-11
surface: agent
model: claude-fable-5
feature: 001-cv-generator
branch: 001-cv-generator
user: Muhammad Maaz
command: /sp.clarify
labels: ["clarify", "cv-generator", "ux", "print", "validation"]
links:
  spec: specs/001-cv-generator/spec.md
  ticket: null
  adr: null
  pr: null
files:
  - specs/001-cv-generator/spec.md
tests:
  - none (spec refinement; post-edit validation checks passed)
---

## Prompt

/sp.clarify (no arguments) — Detect and reduce ambiguity or missing decision points in the active feature specification and record the clarifications directly in the spec file.

## Response snapshot

Ran structured ambiguity scan across the taxonomy; most categories Clear. Four Partial areas asked as one interactive round (all recommended options accepted by user):

1. Data-loss guard → Browser's native leave-site warning, armed only when customer data has been entered (new FR-027; edge case updated; subsequent FRs renumbered to FR-028/FR-029).
2. "New CV" destination → Returns to template gallery after confirmation (FR-025 amended; User Story 5 acceptance scenario updated).
3. Validation strictness → Soft inline hints for phone/email/CNIC; never blocks preview/PDF; only name+phone presence enforced (FR-012 amended).
4. Page-2 overflow in sidebar templates → Sidebar on page 1 only; page 2 is full-width (FR-023 amended).

Added `## Clarifications › Session 2026-07-11` with all four Q→A bullets. Coverage: Functional/Data/NFR/Integration/Terminology/Completion all Clear; Interaction & Edge Cases now Resolved; nothing Deferred or Outstanding.

## Outcome

- ✅ Impact: Four UX/print/validation decisions locked in; spec ready for /sp.plan with no outstanding ambiguities.
- 🧪 Tests: Post-integration validation — one bullet per answer, no contradictions left, heading structure intact.
- 📁 Files: specs/001-cv-generator/spec.md (Clarifications section + FR-012, FR-023, FR-025, FR-027–029, US5, edge cases)
- 🔁 Next prompts: /sp.plan to generate the implementation plan.
- 🧠 Reflection: All four recommendations accepted as-is; batching related questions in one round kept the session fast.

## Evaluation notes (flywheel)

- Failure modes observed: none.
- Graders run and results (PASS/FAIL): PASS — 4/4 clarifications integrated, ≤5 question quota respected.
- Prompt variant (if applicable): n/a
- Next experiment (smallest change to try): n/a
