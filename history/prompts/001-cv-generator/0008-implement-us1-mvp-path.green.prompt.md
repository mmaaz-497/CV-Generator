---
id: 0008
title: Implement US1 MVP path
stage: green
date: 2026-07-12
surface: agent
model: claude-fable-5
feature: 001-cv-generator
branch: 001-cv-generator
user: Muhammad Maaz
command: /sp.implement
labels: ["implement", "cv-generator", "us1", "mvp", "classic-template", "print"]
links:
  spec: specs/001-cv-generator/spec.md
  ticket: null
  adr: history/adr/0002-a4-print-output-strategy.md
  pr: null
files:
  - src/app/page.tsx
  - src/lib/sample-data.ts
  - src/lib/constants.ts (removed TEMPLATES to avoid circular import)
  - src/app/globals.css (A4 preview/print rules)
  - src/templates/registry.ts
  - src/templates/ClassicTemplate.tsx
  - src/templates/shared/SectionHeading.tsx
  - src/templates/shared/ContactLine.tsx
  - src/templates/shared/PhotoFrame.tsx
  - src/screens/GalleryScreen.tsx
  - src/screens/FormScreen.tsx
  - src/screens/PreviewScreen.tsx
  - src/components/form/SectionCard.tsx
  - src/components/form/StickyActionBar.tsx
  - src/components/form/PersonalInfoSection.tsx
  - src/components/form/ObjectiveSection.tsx
  - src/components/form/RepeatableSection.tsx
  - src/components/form/SkillsChips.tsx
  - src/components/preview/PdfButton.tsx
  - specs/001-cv-generator/tasks.md (T013–T026 marked done)
tests:
  - "npm test → 25/25 pass"
  - "npm run build → static export + TypeScript pass"
  - "T026 MVP path (puppeteer @360px, real out/ build): gallery→form→preview→A4 PDF; PDF is 1-page A4, has name+phone, NO app chrome, NO empty headings; 0 horizontal overflow"
---

## Prompt

Implement Phase 3 (US1) tasks T013 through T026 only. Stop at the T026 MVP checkpoint and report.

## Response snapshot

Built the full US1 MVP path with the Classic template. Structural change vs the task text: moved the template registry from lib/constants.ts to src/templates/registry.ts because templates import FONT_SIZE_BASE from constants, so registering a template in constants would be a circular import; constants.TEMPLATES removed.

Files: app shell page.tsx (CVProvider + screen switch on cv.screen); sample-data.ts (full sample CV for thumbnails); three shared template pieces (SectionHeading, ContactLine skip-blank, PhotoFrame conditional); ClassicTemplate (B&W centered header, personal-details block, iterates ordered sections skipping isSectionEmpty, custom headings, per-entry cv-entry, scoped print CSS in mm, min-height 297mm); GalleryScreen (live scaled real-template thumbnails, tap → SET_TEMPLATE+SET_SCREEN form); form components (SectionCard collapsible via animated grid-rows + filled-check badge; StickyActionBar with name/phone gate FR-012; PersonalInfoSection 10 fields with inputmode + soft non-blocking hints; ObjectiveSection; generic RepeatableSection for education/experience/languages/certifications/references incl. references toggle; SkillsChips as ≥44px removable chips); FormScreen (personal + photo-placeholder + ordered section cards + sticky bar); PreviewScreen (A4 page scaled-to-fit on screen via ResizeObserver, transform reset in print) + PdfButton (window.print); globals A4 preview rules (.a4/.a4-scaler/.preview-surface, print resets transform, hide chrome).

Verification: 25/25 unit tests still green; static export + TS typecheck pass. T026 MVP checkpoint proven empirically by driving the REAL built app in headless Chrome at 360px viewport: gallery → tap Classic → fill only name+phone → Preview → print A4 PDF. pdfjs inspection: 1 page, true A4 (595×842pt), contains name+phone, ALL app-chrome strings absent (FR-022), ALL section headings absent since sections empty (FR-013/SC-002); form horizontal overflow at 360px = 0.

## Outcome

- ✅ Impact: MVP path works end-to-end in the real static build — a sellable CV from Classic. Gallery/form/preview/PDF proven at 360px.
- 🧪 Tests: 25/25 unit; build+typecheck OK; T026 print gate PASS (A4, no chrome, no empty headings, no h-scroll).
- 📁 Files: 18 new/changed source files + tasks.md checkboxes.
- 🔁 Next prompts: T027–T030 (Professional, Modern, Elegant, Minimal using the R5 recipe) + T031, then US2–US5 and Phase 8 gates.
- 🧠 Reflection: Driving the real out/ build headless (not just unit tests) caught the print path honestly; empty-section-never-renders verified in actual PDF output, not just the reducer.

## Evaluation notes (flywheel)

- Failure modes observed: none blocking. One design deviation (registry moved out of constants to break a circular import) — documented.
- Graders run and results (PASS/FAIL): PASS — build, tests, and the T026 print-gate assertions all green.
- Prompt variant (if applicable): n/a
- Next experiment (smallest change to try): when building sidebar templates (T027/T029), reuse the drive.mjs harness with an overflow CV to re-confirm the R5 two-region behavior in the real build.
