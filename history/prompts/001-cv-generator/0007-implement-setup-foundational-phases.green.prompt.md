---
id: 0007
title: Implement setup and foundational phases
stage: green
date: 2026-07-11
surface: agent
model: claude-fable-5
feature: 001-cv-generator
branch: 001-cv-generator
user: Muhammad Maaz
command: /sp.implement
labels: ["implement", "cv-generator", "setup", "foundational", "print-spike", "vitest"]
links:
  spec: specs/001-cv-generator/spec.md
  ticket: null
  adr: history/adr/0002-a4-print-output-strategy.md
  pr: null
files:
  - next.config.ts
  - src/app/layout.tsx
  - src/app/globals.css
  - src/app/page.tsx
  - vitest.config.ts
  - package.json
  - src/lib/cv-types.ts
  - src/lib/constants.ts
  - src/lib/empty-checks.ts
  - src/lib/cv-reducer.ts
  - src/lib/empty-checks.test.ts
  - src/lib/cv-reducer.test.ts
  - src/lib/cv-context.tsx
  - specs/001-cv-generator/research.md (R5 spike result)
  - specs/001-cv-generator/tasks.md (T001–T012 marked done)
tests:
  - "npm test → 2 files, 25 tests passed (empty-checks + cv-reducer)"
  - "npm run build → static export succeeds, TypeScript passes, out/ emitted"
  - "T005 print spike → headless Chrome + pdfjs per-page verification, PASS at A4"
---

## Prompt

Implement Phase 1 (Setup) and Phase 2 (Foundational) only — tasks T001 through T012. Stop after Phase 2 and report the spike (T005) outcome in detail before proceeding to any template work.

## Response snapshot

Implemented T001–T012 and stopped before template work as instructed.

Setup (T001–T004): create-next-app refused the non-empty repo root, so scaffolded in a temp subfolder and moved project files up (preserving SDD dirs and the root CLAUDE.md; skipped the scaffold's own CLAUDE.md/AGENTS.md/README). Got Next.js 16.2.10 + React 19.2 + Tailwind v4 (satisfies "15+"). Configured `output: 'export'` + `images.unoptimized` in next.config.ts; set metadata + mobile viewport + self-hosted Geist in layout.tsx; cleaned page.tsx to a placeholder. Added print foundation to globals.css (`@page A4 margin 0`, `.no-print`, `.cv-entry` break rules, `--accent`/`--fs-base` defaults). Installed Vitest, vitest.config.ts scoped to src/lib, `test` script; renamed package to cv-generator.

Foundational (T006–T012): full type system (cv-types.ts), constants + default sections factory + empty TEMPLATES registry, empty-checks (single emptiness authority), pure cvReducer (all 16 action types, silent no-ops, style actions never touch content), CVProvider/useCV with beforeunload guard armed only when hasAnyData, and 25 unit tests. `npm test` green (25/25); `npm run build` compiles with TypeScript passing and emits static ./out.

T005 print spike: built a throwaway sidebar CV with 9 overflowing experience entries; rendered headless and extracted per-page text via pdfjs-dist. First pass showed 3 pages incl. a blank one — traced to Chrome's `--print-to-pdf` CLI defaulting to US Letter (297mm block overflows a 279mm page). Re-rendered at true A4 via puppeteer-core (format A4, preferCSSPageSize): exactly 2 A4 pages — page 1 = sidebar + header + objective + both education entries (no experience); page 2 = full-width continuation with all 9 experience entries, no sidebar bleed, no blank page. Recipe validated and recorded in research.md R5 with three caveats (paper must be A4; short-CV single-region fallback; Android visual pass still owed at T044). Spike route deleted; project rebuilt clean.

## Outcome

- ✅ Impact: Phases 1–2 done and verified; template architecture unblocked (spike PASS at A4). Foundation (types/reducer/context/empty-checks) ready for US1.
- 🧪 Tests: 25/25 unit tests pass; static export build passes with TS typecheck; spike verified empirically via headless print-to-PDF.
- 📁 Files: 13 source/config files + research.md R5 update + tasks.md checkboxes.
- 🔁 Next prompts: /sp.implement Phase 3 (US1/MVP) — Classic template end-to-end first (T013–T026), then remaining templates using the R5 two-region recipe.
- 🧠 Reflection: Empirical spike (Chrome CLI vs puppeteer A4) caught a Letter-vs-A4 artifact that pure reasoning would have mis-attributed to the CSS; the recipe itself was correct.

## Evaluation notes (flywheel)

- Failure modes observed: (1) create-next-app can't init in a non-empty SDD repo — temp-scaffold-and-move workaround. (2) Chrome `--print-to-pdf` ignores `@page size`, defaults to Letter — must force A4 via CDP/puppeteer or the real print dialog. Both documented.
- Graders run and results (PASS/FAIL): PASS — tests 25/25, build+typecheck OK, spike PASS at A4.
- Prompt variant (if applicable): n/a
- Next experiment (smallest change to try): in PdfButton (US1), add explicit A4 guidance/confirmation so the Letter-blank-page artifact can't reach the shopkeeper.
