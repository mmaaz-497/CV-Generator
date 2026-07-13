---
id: 0006
title: Generate CV Generator task list
stage: tasks
date: 2026-07-11
surface: agent
model: claude-fable-5
feature: 001-cv-generator
branch: 001-cv-generator
user: Muhammad Maaz
command: /sp.tasks
labels: ["tasks", "cv-generator", "mvp", "print-spike", "user-stories"]
links:
  spec: specs/001-cv-generator/spec.md
  ticket: null
  adr: history/adr/0001-client-only-application-architecture.md
  pr: null
files:
  - specs/001-cv-generator/tasks.md
tests:
  - none (task-planning artifact; Vitest tasks T010/T011 scoped per plan R10)
---

## Prompt

Generate the task list. Keep these priorities in mind:

1. The sidebar page-1-only print spike (research R5) must be an early task, before any of the 5 templates are built — if the CSS approach fails, template architecture changes.
2. Keep the minimal Vitest setup for cv-reducer and empty-checks only, as recommended in the plan. No other test infrastructure.
3. Order user stories by spec priority: US1 (create + download) first as MVP, then US2 (skip/rename/reorder), US3 (restyle), US4 (photo), US5 (reset).
4. Within US1, build one template (Classic) end-to-end first so the full gallery → form → preview → PDF path works; the remaining 4 templates come after the path is proven.
5. Include a final polish phase covering the constitution quality gates: 360px verification, A4 print verification on mobile Chrome, refresh-clears-data check, and the leave-site warning behavior.

## Response snapshot

Wrote specs/001-cv-generator/tasks.md with 48 tasks in 8 phases honoring all 5 user priorities: Setup (T001–T004, incl. static export config, print CSS foundation, minimal Vitest); Foundational (T005–T012) with the R5 print spike as T005 explicitly gating all template tasks, full type/constants/empty-checks/reducer/context core, and unit tests limited to empty-checks + cv-reducer; US1/MVP (T013–T031) building Classic end-to-end with an explicit path-proof checkpoint (T026) before the remaining 4 templates run in parallel (T027–T030); US2 rename/reorder (T032–T034); US3 restyle controls (T035–T037); US4 photo pipeline (T038–T040); US5 reset (T041–T042); Polish (T043–T048) mapping directly to the constitution's six quality gates incl. 360px audit, Android Chrome print gate, zero-persistence + beforeunload checks, and SC-001 timing. Dependency graph, parallel bursts (form 5-way, templates 4-way), and MVP-first strategy documented. All tasks follow checkbox/ID/[P]/[Story]/file-path format.

## Outcome

- ✅ Impact: Feature is implementation-ready; /sp.implement can execute phase by phase with a shippable MVP at T031 (or T026 with one template).
- 🧪 Tests: Format validation — 48/48 tasks in checklist format with IDs and paths; story labels only in US phases; test tasks limited to T010/T011 per plan.
- 📁 Files: specs/001-cv-generator/tasks.md
- 🔁 Next prompts: /sp.implement to execute; optionally /sp.analyze first for cross-artifact consistency.
- 🧠 Reflection: The spike-gates-templates dependency and the T026 mid-story checkpoint encode the user's risk-first sequencing directly into the task graph.

## Evaluation notes (flywheel)

- Failure modes observed: none.
- Graders run and results (PASS/FAIL): PASS — user story organization, independent test criteria per story, dependency graph and parallel examples present.
- Prompt variant (if applicable): n/a
- Next experiment (smallest change to try): n/a
