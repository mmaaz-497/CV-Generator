---

description: "Task list for CV Generator implementation"
---

# Tasks: CV Generator

**Input**: Design documents from `/specs/001-cv-generator/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/template-props.md, quickstart.md

**Tests**: Minimal by design (plan R10): Vitest for `cv-reducer` and `empty-checks` ONLY. No other test infrastructure. Constitution manual gates are the primary validation.

**Organization**: Tasks grouped by user story (spec priority order US1→US5) so each story is an independently testable increment.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies on incomplete tasks)
- **[Story]**: US1–US5 (user story phases only)
- All paths relative to repository root

---

## Phase 1: Setup


**Purpose**: Runnable, correctly configured Next.js skeleton

- [x] T001 Initialize Next.js 15+ project at repository root: `npx create-next-app@latest . --typescript --tailwind --app --src-dir --no-eslint --import-alias "@/*"`; remove boilerplate content from `src/app/page.tsx` and `src/app/globals.css`
- [x] T002 Configure static export (`output: 'export'`) in `next.config.ts`; set app metadata, mobile viewport, and self-hosted font via `next/font` in `src/app/layout.tsx`; verify `npm run build` emits `./out`
- [x] T003 [P] Add print CSS foundation to `src/app/globals.css`: `@page { size: A4; margin: 0 }`, `.no-print` (hidden in `@media print`), `.cv-entry` utility (`break-inside: avoid` + legacy `page-break-inside: avoid`), default `--accent`/`--fs-base` custom properties
- [x] T004 [P] Add dev-only Vitest: `npm i -D vitest`, create `vitest.config.ts` scoped to `src/lib`, add `"test": "vitest run"` script to `package.json`

**Checkpoint**: `npm run dev` serves an empty page; `npm run build` produces a static export.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Print-approach validation + the pure core every story depends on

⚠️ T005 (spike) MUST pass before ANY template task (T024, T027–T030). If the spike fails, revisit plan.md template architecture before proceeding.


acts/template-props.md: `CVDocument`, `PersonalInfo`, `Section`, `SectionId`, `SectionContent` variants (`text`/`entries`/`skills`/`references`), `Entry`, `StyleSelection`, `TemplateId`, `FontSizeLevel`, `Screen`, `TemplateProps`, `TemplateDefinition`, `CVAction` discriminated union
- [x] T007 Create `src/lib/constants.ts`: `ACCENT_PALETTE` (5–6 hex values), `FONT_SIZE_LEVELS` (small/medium/large → `--fs-base` mm/pt values), `createDefaultSections()` factory (7 sections in spec default order with default headings), `TEMPLATES` registry array (empty for now; templates register in later tasks)
- [x] T008 Implement `src/lib/empty-checks.ts`: `isEntryEmpty`, `isSectionEmpty` (per-variant rules incl. references `onRequest`/entries precedence), `hasAnyData` — trim whitespace before judging (contract 4)
- [x] T009 Implement `src/lib/cv-reducer.ts`: `createInitialState()` factory + pure reducer handling all actions from data-model.md (`UPDATE_PERSONAL`, `SET_PHOTO`, `UPDATE_TEXT`, `ADD_ENTRY`, `UPDATE_ENTRY`, `REMOVE_ENTRY`, `ADD_SKILL`, `REMOVE_SKILL`, `SET_REFERENCES_MODE`, `RENAME_SECTION`, `MOVE_SECTION`, `SET_TEMPLATE`, `SET_ACCENT`, `SET_FONT_SIZE`, `SET_SCREEN`, `RESET`); unknown ids = silent no-op; never throws
- [x] T010 [P] Unit tests in `src/lib/empty-checks.test.ts`: truth table per content variant, whitespace-only counts as empty, references toggle/entries precedence, `hasAnyData` over personal/photo/sections
- [x] T011 [P] Unit tests in `src/lib/cv-reducer.test.ts`: every action's effect; `SET_TEMPLATE`/`SET_ACCENT`/`SET_FONT_SIZE` leave all content untouched (FR-017/020); `MOVE_SECTION` swaps neighbors and no-ops at ends; `RESET` returns fresh defaults with `screen: 'gallery'` and no shared references; unknown ids no-op
- [x] T012 Implement `src/lib/cv-context.tsx`: `CVProvider` (owns `useReducer`), `useCV()` hook (throws outside provider), `beforeunload` effect armed only while `hasAnyData(cv)` is true (FR-027, contract 3)

**Checkpoint**: `npm test` green; spike outcome recorded; no UI yet.

---

## Phase 3: User Story 1 — Create and Download a CV (P1) 🎯 MVP

**Goal**: Full gallery → form → preview → A4 PDF path. Classic template proves the path end-to-end first; the other 4 templates follow.

**Independent Test**: On a 360px browser, select a template, enter only name + phone, preview, print-to-PDF on A4 — a complete, sellable CV.

- [x] T013 [US1] App shell in `src/app/page.tsx`: `"use client"`; wrap in `CVProvider`; render `GalleryScreen`/`FormScreen`/`PreviewScreen` from `cv.screen`
- [x] T014 [P] [US1] Create `src/lib/sample-data.ts`: small sample `CVDocument` (name, contact, 1 objective line, 2 education, 1 experience, 4 skills) for gallery thumbnails
- [x] T015 [US1] `src/screens/GalleryScreen.tsx`: registry-driven grid of template tiles; each tile renders the real template component with sample data scaled via `transform: scale(...)` (`transform-origin: top left`, wrapper `pointer-events-none` + `aria-hidden`); tap (≥44px card) dispatches `SET_TEMPLATE` + `SET_SCREEN 'form'` (FR-001/002)
- [x] T016 [P] [US1] `src/components/form/SectionCard.tsx`: collapsible card (CSS `grid-template-rows: 0fr→1fr` transition, R9), heading display (`customHeading ?? defaultHeading`), filled indicator (checkmark/count via `isSectionEmpty`), chevron; slots for children (rename/move controls arrive in US2)
- [x] T017 [P] [US1] `src/components/form/StickyActionBar.tsx`: fixed bottom bar with 44px+ "Preview" button (thumb-reachable, safe-area inset); on tap, if `fullName` or `phone` blank → inline missing-field message and stay (FR-012); else `SET_SCREEN 'preview'`
- [x] T018 [US1] `src/components/form/PersonalInfoSection.tsx`: 10 fields with proper `inputmode`/`type` (`tel`, `email`, `numeric` for CNIC); name+phone marked required; soft non-blocking hints for odd-looking phone/email/CNIC (FR-005, FR-012)
- [x] T019 [P] [US1] `src/components/form/ObjectiveSection.tsx`: single textarea dispatching `UPDATE_TEXT`
- [x] T020 [P] [US1] `src/components/form/RepeatableSection.tsx`: generic add/remove entry list driven by a per-section field config (education/experience/languages/certifications/references label sets from data-model Entry mapping); references variant also renders the "available on request" toggle (`SET_REFERENCES_MODE`, FR-006/008)
- [x] T021 [P] [US1] `src/components/form/SkillsChips.tsx`: text input + add button appending chips one by one; each chip removable (44px hit area) (FR-007)
- [x] T022 [US1] `src/screens/FormScreen.tsx`: PersonalInfo card + Photo placeholder card (upload arrives in US4) + section cards iterated in `cv.sections` array order, each wiring the right section component; `StickyActionBar` at bottom (FR-003/004)
- [x] T023 [P] [US1] Template shared pieces in `src/templates/shared/`: `SectionHeading.tsx` (accent-aware heading), `ContactLine.tsx` (phone/email/address row that skips blank fields), `PhotoFrame.tsx` (fitted/cropped `<img>` from data URL; renders nothing when photo is null)
- [x] T024 [US1] `src/templates/ClassicTemplate.tsx`: black & white centered header, traditional single-column layout; iterates ordered sections, skips `isSectionEmpty`, uses `customHeading ?? defaultHeading`, `.cv-entry` on every entry block; register in `TEMPLATES` in `src/lib/constants.ts` (FR-016 contract obligations 1–6)
- [x] T025 [US1] `src/screens/PreviewScreen.tsx` + `src/components/preview/PdfButton.tsx`: A4-proportioned container (210mm width basis) rendering the active template from the registry; all controls marked `.no-print`; "Download PDF" calls `window.print()`; back-to-form button (FR-021/022)
- [x] T026 [US1] **CHECKPOINT — MVP path proof**: at 360px, run gallery → form (name+phone only) → preview → Chrome print preview: A4 output matches preview, no app chrome, no empty headings. Fix before proceeding
- [x] T027 [P] [US1] `src/templates/ProfessionalTemplate.tsx`: left sidebar (contact/skills regions) + main column, subtle accent, sidebar page-1-only per validated spike recipe; register in `TEMPLATES`
- [x] T028 [P] [US1] `src/templates/ModernTemplate.tsx`: colored header band (full-bleed, accent) with name, clean two-column body; register in `TEMPLATES`
- [x] T029 [P] [US1] `src/templates/ElegantTemplate.tsx`: dark full-height sidebar (page-1-only per spike recipe), photo-forward design that still works photo-less; register in `TEMPLATES`
- [x] T030 [P] [US1] `src/templates/MinimalTemplate.tsx`: ultra-simple single column, thin dividers, maximum text density; register in `TEMPLATES`
- [x] T031 [US1] Verify all 5 registered: gallery shows 5 accurate live thumbnails; each template renders the same test CV and passes Chrome A4 print preview (no split entries, no chrome)

**Checkpoint**: US1 fully functional — sellable CVs from all 5 templates. MVP deliverable.

---

## Phase 4: User Story 2 — Skip, Rename, and Reorder Sections (P2)

**Goal**: Filled-sections-only output under custom headings in custom order.

**Independent Test**: Fill only name, phone, skills; rename Skills heading; move Skills above Education → preview/PDF shows only Personal Info + renamed Skills, in that order.

- [x] T032 [US2] Add rename control to `src/components/form/SectionCard.tsx`: edit (pencil) affordance → inline text input seeded with current heading; save dispatches `RENAME_SECTION` (clear restores default); custom heading shows on card and CV verbatim (FR-014)
- [x] T033 [US2] Add move up/down controls to `src/components/form/SectionCard.tsx`: 44px buttons dispatching `MOVE_SECTION`; disabled state at first/last position; form list order updates immediately (FR-015)
- [x] T034 [US2] Verify acceptance across templates: skills-only CV shows no empty headings/gaps in all 5 templates (screen + print); renamed heading and custom order appear exactly in the PDF (SC-002/SC-003); sidebar templates apply order within their layout regions

**Checkpoint**: Section flexibility complete and print-verified.

---

## Phase 5: User Story 3 — Restyle in Preview Without Losing Data (P3)

**Goal**: Instant template/accent/font-size switching in preview, zero data loss.

**Independent Test**: Full CV → cycle all 5 templates, all accents, 3 font sizes → every field still present after each switch.

- [x] T035 [P] [US3] `src/components/preview/TemplateSwitcher.tsx`: horizontal template picker (registry-driven, current highlighted) dispatching `SET_TEMPLATE`; subtle crossfade/transition on switch (FR-020, FR-028)
- [x] T036 [P] [US3] `src/components/preview/ColorPalette.tsx` (5–6 swatches → `SET_ACCENT`; hidden/disabled for Classic per `usesAccent: false`) and `src/components/preview/FontSizeToggle.tsx` (S/M/L → `SET_FONT_SIZE`); preview applies `--accent`/`--fs-base` on the template root from `cv.style` (FR-018)
- [x] T037 [US3] Wire restyle bar into `src/screens/PreviewScreen.tsx` (all `.no-print`); verify SC-004: cycle everything, return to form, all data intact; switches feel instant

**Checkpoint**: Live restyling complete.

---

## Phase 6: User Story 4 — Add a Customer Photo (P4)

**Goal**: Gallery/camera photo on the CV; graceful no-photo layouts.

**Independent Test**: Same CV with and without photo renders cleanly in all 5 templates.

- [x] T038 [US4] Implement `processPhoto(file)` in `src/lib/photo.ts`: decode → canvas downscale to ≤600px longest side → `toDataURL('image/jpeg', 0.85)`; rejects on decode failure (contract 5, R7)
- [x] T039 [US4] `src/components/form/PhotoSection.tsx` replacing the placeholder card in `src/screens/FormScreen.tsx`: `<input type="file" accept="image/*">` (Android offers camera/gallery), thumbnail preview, remove button, inline "Couldn't load photo, try another" on failure; dispatches `SET_PHOTO` (FR-009)
- [x] T040 [US4] Verify photo states in all 5 templates via `PhotoFrame`: photo shows in each template's designated spot (odd aspect ratios fitted/cropped, no distortion); `photo === null` leaves no empty frame; both states pass A4 print preview (FR-019)

**Checkpoint**: Photo flow complete.

---

## Phase 7: User Story 5 — Reset for the Next Customer (P5)

**Goal**: One confirmed tap → factory-fresh app at the gallery.

**Independent Test**: Fill everything, tap "New CV", confirm → all data/headings/order/style at defaults, app at gallery; decline → nothing changes.

- [x] T041 [US5] Add "New CV" button (form + preview screens, `.no-print`) with confirmation dialog (44px actions); confirm dispatches `RESET` (defaults + gallery, FR-025); decline is a pure no-op
- [x] T042 [US5] Verify acceptance: post-reset every field, photo, custom heading, custom order, style selection is default; `beforeunload` guard disarmed after reset (empty app closes silently)

**Checkpoint**: All 5 user stories complete.

---

## Phase 8: Polish & Constitution Quality Gates

**Purpose**: The constitution's six gates plus final feel/performance passes

- [x] T043 [P] 360px audit of all three screens in DevTools (360×800): no horizontal scroll, no clipped/overlapping controls, every touch target ≥44px (constitution I)
- [~] T044 [P] Print gate: all 5 templates × (with photo, without photo) × (short CV, overflowing 2-page CV) — no cut-off content, no split entries at the page boundary, no browser-chrome artifacts, output matches preview (constitution III, SC-005/SC-006). **Desktop-Chromium matrix (20/20) verified headless via puppeteer `page.pdf` + pdfjs: A4, no chrome, no split entries, sidebar page-1-only, photo renders. RESIDUAL: a human visual pass on real Android Chrome is still owed (R5 caveat 3 — cannot drive an Android device from here).**
- [x] T045 Zero-persistence + guard gate: DevTools Network shows no outbound customer data, Application tab shows no storage use; refresh mid-entry triggers leave-site warning, accepting it yields a fresh gallery; warning absent when app is empty (constitution II, FR-026/027, SC-008)
- [~] T046 [P] Feel pass: instant visual tap feedback everywhere, smooth card collapse, subtle template/color transitions in preview; no animation jank at 4x CPU throttle (FR-028). **Structural guarantees verified: CSS-only card collapse (grid-rows, no JS measurement), `.tpl-fade` 180ms transition on template switch, `active:` tap states throughout; the 4x-throttle typing test stayed responsive (Δ=~20 ms/char). RESIDUAL: subjective "feels pleasant/snappy" is a human judgement.**
- [x] T047 [P] Performance pass: typing latency with photo loaded + 20 skills + all sections filled on a throttled profile; if keystrokes lag, memoize section components on their state slice (plan R2 note) — no architecture change
- [x] T048 Final gate run: `npm run build` static export succeeds; walk `specs/001-cv-generator/quickstart.md` verification steps 1–7 end-to-end; time the SC-001 scenario (name + phone + 2 education + 3 skills → preview) under 3 minutes at 360px

---

## Dependencies

```text
Phase 1 (Setup) ──► Phase 2 (Foundational) ──► Phase 3 (US1/MVP) ──► Phase 4 (US2)
                                                                 ├──► Phase 5 (US3)
                                                                 ├──► Phase 6 (US4)
                                                                 └──► Phase 7 (US5)
                                                     all stories ──► Phase 8 (Polish)
```

- **T005 (spike) gates T024, T027–T030** (all template components). Spike failure = stop and revise plan.md template architecture.
- T006 (types) gates T007–T012 and everything after.
- T026 (MVP path checkpoint) gates T027–T030 (remaining templates) per user priority #4.
- US2 (T032–T033) touches `SectionCard.tsx` — serialize after T016, not parallel with other SectionCard edits.
- US3/US4/US5 are mutually independent after US1; they may be built in any order or in parallel by different contributors (different files).

## Parallel Execution Examples

- **Phase 2**: T005 (spike) ∥ T006 (types); then T010 ∥ T011 (tests) after T008/T009.
- **US1 form burst**: after T016+T018, run T019 ∥ T020 ∥ T021 ∥ T023 ∥ T014 (five different files).
- **US1 template burst**: after T026 passes, run T027 ∥ T028 ∥ T029 ∥ T030 (four template files).
- **US3**: T035 ∥ T036.
- **Polish**: T043 ∥ T044 ∥ T046 ∥ T047.

## Implementation Strategy

**MVP = Phase 1 + Phase 2 + Phase 3 (US1).** At T026 the product already sells CVs with the Classic template; at T031 all five looks are available. Ship/checkpoint there.

Each later phase is an independent increment in spec priority order: US2 (flexibility — the critical differentiator), US3 (restyle), US4 (photo), US5 (reset). Any of US3–US5 can be pulled earlier without breaking anything; Phase 8 runs last as the constitution gate before calling the feature done.

**Total**: 48 tasks — Setup 4 · Foundational 8 · US1 19 · US2 3 · US3 3 · US4 3 · US5 2 · Polish 6.
