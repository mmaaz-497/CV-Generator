---
id: 0016
title: Amend constitution v1.1.0
stage: constitution
date: 2026-07-13
surface: agent
model: claude-opus-4-8
feature: 002-pdf-download
branch: 002-pdf-download
user: Muhammad Maaz
command: /sp.adr (follow-up amendment)
labels: ["constitution", "amendment", "v1.1.0", "dependency-exception", "governance"]
links:
  spec: specs/002-pdf-download/spec.md
  ticket: null
  adr: history/adr/0003-client-side-pdf-generation.md
  pr: null
files:
  - .specify/memory/constitution.md (v1.0.0 → v1.1.0)
tests:
  - "Amendment anchors verified: version line 1.1.0, Principle VI scoped exception, Additional Constraints bullet, ADR-0003 references, Last Amended 2026-07-13"
---

## Prompt

yes, amend the constitution to v1.1.0

## Response snapshot

Amended `.specify/memory/constitution.md` from v1.0.0 → **v1.1.0** (MINOR — expanded guidance, no principle removed/redefined) to admit the ADR-0003 exception:

- **Principle VI (Fixed Tech Stack)**: added a *scoped exception* bullet — narrowly-scoped, dynamically-imported client-side libraries are permitted **solely for on-device document export**, provided they (a) transmit nothing (Principle II remains non-negotiable and unweakened), (b) load via dynamic `import()` so first paint is unaffected, and (c) keep existing templates as the source of truth. Each must be recorded in an ADR and justified in Complexity Tracking. Stated as the *only* exception to the zero-runtime-dependency posture — not a licence for general dependency use.
- **Additional Constraints**: added an "On-device export libraries" bullet pointing to Principle VI and ADR-0003 (so reviewers see the boundary without reading the ADR).
- **Sync Impact Report** (top comment): recorded the 1.0.0 → 1.1.0 change + rationale, preserving the original v1.0.0 ratification notes.
- **Governance line**: Version 1.1.0, Last Amended 2026-07-13 (Ratified date unchanged).

Principles II (Zero Backend, Zero Persistence) and III/IV and the quality gates are untouched; the "no new outbound data transmission" and "justify dependencies in Complexity Tracking" gates still bind the exception.

## Outcome

- ✅ Impact: The client-side PDF library exception is now constitutionally sanctioned and bounded; the plan's Constitution Check gate (V/VI deviations) is satisfied, unblocking `/sp.tasks` and `/sp.implement` for feature 002.
- 🧪 Tests: amendment anchors verified via grep (version, exception clause, constraint bullet, ADR refs, dates).
- 📁 Files: constitution.md only.
- 🔁 Next prompts: `/sp.tasks` for 002-pdf-download — front-load the R1/R4 fidelity + page-break spike before UI.
- 🧠 Reflection: MINOR was the correct bump — the amendment *adds* bounded guidance without removing or redefining any principle. Kept Principle II explicitly reaffirmed inside the exception so the privacy guarantee can't be read as softened.

## Evaluation notes (flywheel)

- Failure modes observed: none. Preserved v1.0.0 history in the Sync Impact Report rather than overwriting it.
- Graders run and results (PASS/FAIL): PASS — semantic-versioning rule applied correctly (MINOR); no unexplained bracket tokens; dates ISO; exception is testable and bounded.
- Prompt variant (if applicable): n/a
- Next experiment (smallest change to try): during `/sp.implement`, add a build-time check (or lint note) that the export libs appear only behind a dynamic import, enforcing exception condition (b) automatically.
---

## Amendment summary

- **Version**: 1.0.0 → 1.1.0 (MINOR)
- **Ratified**: 2026-07-11 (unchanged) | **Last Amended**: 2026-07-13
- **Files flagged for manual follow-up**: none (plan/spec/tasks templates derive the
  Constitution Check dynamically; no static edits needed).
- **Suggested commit message**: `docs: amend constitution to v1.1.0 (scoped on-device export-library exception)`
