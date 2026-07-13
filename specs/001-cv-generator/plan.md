# Implementation Plan: CV Generator

**Branch**: `001-cv-generator` | **Date**: 2026-07-11 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-cv-generator/spec.md`

## Summary

A pure client-side, mobile-first CV Generator: a shopkeeper picks one of 5 templates
from a gallery, fills a single scrollable form of collapsible section cards, previews
the CV in an A4-proportioned container, restyles it live (template / accent color /
font size), and produces an A4 PDF via the browser print dialog. All state is one
in-memory `CVDocument` managed by `useReducer` + React Context; empty sections never
render; sections are renamable and reorderable. No backend, no persistence, no
dependencies beyond Next.js, React, and Tailwind.

## Technical Context

**Language/Version**: TypeScript 5.x on Next.js 15+ (App Router), React 19
**Primary Dependencies**: Next.js, React, Tailwind CSS — nothing else at runtime
(no UI kit, no form/state/PDF libraries; icons are inline SVG)
**Storage**: None. All state in React memory only (constitution Principle II);
photo held as a downscaled base64 data URL in state
**Testing**: Manual constitution quality gates as primary gate; optional unit tests
for pure logic only (reducer, empty-checks) — no e2e infrastructure
**Target Platform**: Mobile browsers (Chrome on Android is the reference), 360px
viewport baseline; deployed as static files on Vercel free tier (`output: 'export'`)
**Project Type**: Single-page web app (one route, three in-memory screens)
**Performance Goals**: Instant (<100ms perceived) re-render on template/color/size
switch; snappy tap feedback; photo downscaled to ≤600px max dimension to keep
re-renders fluid
**Constraints**: A4 print-perfect output via `@media print`; 44px touch targets;
zero network calls carrying customer data; page refresh = fresh start
**Scale/Scope**: 3 screens, 9 form sections, 5 templates, 1 user at a time; CV data
of at most a few pages

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| # | Principle | Status | Evidence in this plan |
|---|-----------|--------|----------------------|
| I | Mobile-First | PASS | 360px-first layouts; 44px targets; sticky thumb-reachable action bar; gallery thumbnails sized for phone |
| II | Zero Backend, Zero Persistence | PASS | `output: 'export'` static build; no API routes/server actions; state in `useReducer` memory only; photo never leaves device; `beforeunload` guard doesn't persist anything |
| III | Print-Perfect Output | PASS | `@page { size: A4; margin: 0 }`; `.no-print` system; `break-inside: avoid` per entry; sidebar page-1-only strategy validated by earliest spike (highest risk item) |
| IV | Speed of Use | PASS | Single scrollable form, no wizard; only name+phone required; empty sections never render via shared `isSectionEmpty` |
| V | Simplicity Over Cleverness | PASS | Plain `useReducer`+Context; zero extra dependencies; CSS custom properties over JS theming; CSS transforms for thumbnails instead of image assets |
| VI | Fixed Tech Stack | PASS | Next.js App Router + TypeScript + Tailwind, client components only, Vercel free tier static export |

**Initial evaluation**: PASS — no violations, Complexity Tracking empty.
**Post-Phase-1 re-evaluation**: PASS — design artifacts introduce no new
dependencies, storage, or server elements.

## Project Structure

### Documentation (this feature)

```text
specs/001-cv-generator/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output (TypeScript interface contracts)
│   └── template-props.md
└── tasks.md             # Phase 2 output (/sp.tasks — NOT created by /sp.plan)
```

### Source Code (repository root)

```text
src/
├── app/
│   ├── layout.tsx           # Root layout, fonts, metadata
│   ├── page.tsx             # "use client" — CVProvider + screen switcher
│   └── globals.css          # Tailwind, print CSS (@page A4, .no-print), CSS vars
├── screens/
│   ├── GalleryScreen.tsx    # 5 template thumbnails (scaled live templates)
│   ├── FormScreen.tsx       # Section cards + StickyActionBar
│   └── PreviewScreen.tsx    # A4 container + restyle controls + PdfButton
├── components/
│   ├── form/
│   │   ├── SectionCard.tsx        # Collapse, rename, move up/down, filled badge
│   │   ├── PersonalInfoSection.tsx
│   │   ├── PhotoSection.tsx       # File input + canvas downscale to ≤600px
│   │   ├── ObjectiveSection.tsx
│   │   ├── RepeatableSection.tsx  # Generic: education/experience/languages/certs/references
│   │   ├── SkillsChips.tsx
│   │   └── StickyActionBar.tsx
│   └── preview/
│       ├── TemplateSwitcher.tsx
│       ├── ColorPalette.tsx
│       ├── FontSizeToggle.tsx
│       └── PdfButton.tsx
├── templates/
│   ├── ClassicTemplate.tsx
│   ├── ProfessionalTemplate.tsx
│   ├── ModernTemplate.tsx
│   ├── ElegantTemplate.tsx
│   ├── MinimalTemplate.tsx
│   └── shared/
│       ├── SectionHeading.tsx
│       ├── ContactLine.tsx
│       └── PhotoFrame.tsx
└── lib/
    ├── cv-types.ts        # CVDocument, Section, Entry, StyleSelection, TemplateProps
    ├── cv-reducer.ts      # All actions; pure function (unit-testable)
    ├── cv-context.tsx     # CVProvider + useCV hook
    ├── empty-checks.ts    # isSectionEmpty, isEntryEmpty, hasAnyData (unit-testable)
    ├── sample-data.ts     # Small sample CV for gallery thumbnails
    └── constants.ts       # Accent palette, font size levels, default sections, templates registry
```

**Structure Decision**: Single Next.js app under `src/` with the user-approved
breakdown: `screens/` for the three in-memory screens, `components/form|preview/`
for controls, `templates/` for the five CV renderers plus shared pieces, `lib/` for
all pure logic. No `tests/` tree unless the optional reducer/empty-checks unit tests
are included at task time.

## Key Decisions and Rationale

1. **`useReducer` + Context as the only state layer** — one `CVDocument` source of
   truth; actions: `UPDATE_FIELD`, `UPDATE_PERSONAL`, `SET_PHOTO`, `ADD_ENTRY`,
   `UPDATE_ENTRY`, `REMOVE_ENTRY`, `ADD_SKILL`, `REMOVE_SKILL`, `RENAME_SECTION`,
   `MOVE_SECTION`, `SET_TEMPLATE`, `SET_ACCENT`, `SET_FONT_SIZE`, `SET_SCREEN`,
   `RESET`. Simplest React-native mechanism that supports a pure, testable reducer
   (Principle V). Alternatives (Zustand, Jotai, RHF) rejected: dependency + concept
   overhead for a single-object app.
2. **One route, three in-memory screens** — `screen: 'gallery' | 'form' | 'preview'`
   in state; no URL navigation. Guarantees state survives screen changes and keeps
   back-swipe under the `beforeunload` guard (FR-027). Alternative (multi-route)
   rejected: unmount/remount risk to in-memory state and uncontrolled back behavior.
3. **Templates as plain components over a shared `TemplateProps` contract** —
   each iterates the ordered `sections` array and skips `isSectionEmpty` ones, so
   reorder/rename/skip work identically in all 5 with zero per-template logic.
4. **Styling via CSS custom properties** (`--accent`, `--fs-base` on template root) —
   instant restyle without re-mounting; templates only reference the variables.
5. **Live scaled thumbnails** — gallery renders the real template components with
   `transform: scale()` against `sample-data.ts`; zero thumbnail assets to maintain
   and thumbnails can never drift from actual output.
6. **Print via browser dialog only** — `@page { size: A4; margin: 0 }`, `.no-print`
   on all chrome, `break-inside: avoid` on entries. A PDF library would violate the
   zero-dependency rule and double the print-fidelity surface.
7. **Photo pipeline** — `<input type="file" accept="image/*">` (camera-capable on
   Android) → canvas downscale to ≤600px max dimension → base64 data URL in state.
   Caps memory and re-render cost (Risk 3).

## Interfaces & Contracts

No network APIs exist (Principle II). The internal contracts are TypeScript
interfaces, specified in [contracts/template-props.md](./contracts/template-props.md):

- `CVDocument`, `Section`, `SectionContent` variants, `Entry`, `StyleSelection`
- `TemplateProps` — the single contract all 5 templates implement
- `CVAction` — the reducer's action union (exhaustive, discriminated)
- Error paths: reducer actions on missing ids are no-ops (never throw); photo
  decode failure leaves state unchanged and shows an inline retry message.

## Non-Functional Requirements & Budgets

- **Performance**: restyle actions re-render one template subtree only; photo capped
  at ≤600px/base64 (~<200KB); no layout thrash on collapse animations
  (CSS `grid-template-rows` / `max-height` transitions, not JS measurement).
- **Reliability**: refresh recovery is instant by design (fresh start); `beforeunload`
  armed only when `hasAnyData` is true so empty-state navigation is frictionless.
- **Security/Privacy**: no outbound requests with customer data; fonts self-hosted via
  `next/font` (no runtime Google Fonts fetch); photo and all fields die with the tab.
- **Cost**: Vercel free tier static hosting; zero server cost by construction.

## Risk Analysis (top 3)

| # | Risk | Mitigation | Kill switch / fallback |
|---|------|------------|------------------------|
| 1 | Sidebar page-1-only print CSS (Professional/Elegant) misbehaves across page breaks | **Earliest spike task**: build a throwaway overflow CV and validate the chosen CSS (fixed-height A4 sidebar column + full-width continuation block) in Chrome print preview before building all templates | Fall back to constraining sidebar templates to single-page content, or a full-width footer band variant on page 2 |
| 2 | Mobile Chrome print dialog output differs from on-screen preview | Preview container built on the same mm-based box used in print; validate on real Android Chrome at each template milestone (constitution gate) | Adjust preview to match print (print is the source of truth) |
| 3 | Large photos make re-renders sluggish | Canvas downscale to ≤600px max dimension on upload before storing | Hard-reject images that still exceed a size threshold after downscale |

## Evaluation & Definition of Done

- All 6 constitution quality gates pass (360px + 44px, no persistence/transmission,
  refresh clears, A4 print preview clean, name+phone-only CV valid, no unjustified
  complexity).
- Spec success criteria SC-001…SC-008 verified manually on a 360px Android Chrome.
- Optional unit tests (if included in tasks): `cv-reducer` action behaviors and
  `empty-checks` truth table pass.

## Complexity Tracking

> No constitution violations — table intentionally empty.
