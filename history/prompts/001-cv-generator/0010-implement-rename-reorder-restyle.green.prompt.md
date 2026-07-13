---
id: 0010
title: Implement rename reorder restyle
stage: green
date: 2026-07-12
surface: agent
model: claude-opus-4-8
feature: 001-cv-generator
branch: 001-cv-generator
user: Muhammad Maaz
command: /sp.implement
labels: ["implement", "cv-generator", "us2", "us3", "rename", "reorder", "restyle"]
links:
  spec: specs/001-cv-generator/spec.md
  ticket: null
  adr: history/adr/0001-client-only-application-architecture.md
  pr: null
files:
  - src/components/form/SectionCard.tsx (rename inline-edit + move up/down controls, IconButton)
  - src/screens/FormScreen.tsx (wire rename/reorder props for the 7 sections)
  - src/components/preview/TemplateSwitcher.tsx (new — T035)
  - src/components/preview/ColorPalette.tsx (new — T036; hidden for Classic; stacked+wrap for 360px)
  - src/components/preview/FontSizeToggle.tsx (new — T036)
  - src/screens/PreviewScreen.tsx (restyle bar wired, keyed .tpl-fade on template switch)
  - src/app/globals.css (tplFade keyframe, disabled in print)
  - specs/001-cv-generator/tasks.md (T032–T037 marked done)
tests:
  - "npm run build → static export + TypeScript pass"
  - "npm test → 25/25 pass (lib untouched)"
  - "US2/US3 headless harness @360px (real out/ build): 23/23 — rename shows on form+PDF; reorder moves Key Skills above Objective (verified in output for single-column templates); empty sections never render in all 5; Classic hides accent palette; Professional shows 6 swatches; data intact after cycling all accents + font sizes; 0 horizontal overflow on preview"
---

## Prompt

Implement Phase 4 and Phase 5 (US2 and US3), tasks T032 through T037.

## Response snapshot

Pure UI wiring — every reducer action already existed and is unit-tested, so no lib changes.

**US2 (T032–T034):** SectionCard gains optional `rename` and `reorder` props. Rename = pencil affordance → inline text input seeded with the current custom heading (Save/Cancel; Enter/Escape; clearing restores the default via RENAME_SECTION heading=null). Reorder = 44px up/down IconButtons dispatching MOVE_SECTION, disabled at first/last. FormScreen passes these for the 7 reorderable sections only (Personal Info and Photo stay fixed).

**US3 (T035–T037):** TemplateSwitcher (registry-driven chips, current highlighted, SET_TEMPLATE), ColorPalette (6 swatches → SET_ACCENT, returns null for `usesAccent:false` so Classic hides it), FontSizeToggle (S/M/L → SET_FONT_SIZE). Templates already read `--accent`/`--fs-base` from cv.style on their root (T027–T030), so accent/font changes are instant CSS-var updates with no remount. Restyle bar wired into PreviewScreen (all `.no-print`); template switch plays a subtle 180ms keyed `.tpl-fade` (added to globals, disabled in print).

Verified empirically at 360px by driving the real static build headless: filled name+phone+objective+one skill, renamed Skills→"Key Skills", moved it up 3×, then in preview cycled all 5 templates, all 6 accents, all 3 font sizes. 23/23 checks pass.

## Outcome

- ✅ Impact: US2 (section flexibility — the critical differentiator) and US3 (live restyle) complete. Shopkeeper can rename/reorder sections and restyle in preview with zero data loss.
- 🧪 Tests: build+typecheck OK; 25/25 unit; 23/23 US2/US3 print/preview assertions.
- 📁 Files: 3 new preview components + SectionCard/FormScreen/PreviewScreen/globals edits.
- 🔁 Next prompts: US4 (T038–T040 photo), US5 (T041–T042 reset), then Phase 8 constitution gates.
- 🧠 Reflection: Two harness findings — (1) a real 360px overflow bug: ColorPalette's 6×44px swatches + inline label exceeded 360px; fixed by stacking the label above a flex-wrap swatch row. (2) Modern places Skills in a trailing side column, so cross-region text order differs from section order — that's the documented "order within region" behavior; single-column Classic/Minimal prove reorder in output directly.

## Evaluation notes (flywheel)

- Failure modes observed: puppeteer `pg.click(selector)` does a coordinate TAP under `isMobile/hasTouch` and mis-fired onto the sticky "Preview CV" bar, navigating away mid-fill; switching to `pg.type(selector, …)` (JS focus, no tap) fixed it. Real product overflow bug caught and fixed.
- Graders run and results (PASS/FAIL): PASS — build, unit, and the 23 US2/US3 assertions all green.
- Prompt variant (if applicable): n/a
- Next experiment (smallest change to try): in the Phase 8 feel pass (T046), confirm the `.tpl-fade` is subtle (not janky) on a throttled profile, and that accent/font changes stay instant (no remount) as designed.
