---
id: 0004
title: Plan CV Generator implementation
stage: plan
date: 2026-07-11
surface: agent
model: claude-fable-5
feature: 001-cv-generator
branch: 001-cv-generator
user: Muhammad Maaz
command: /sp.plan
labels: ["plan", "cv-generator", "nextjs", "static-export", "print-css", "usereducer"]
links:
  spec: specs/001-cv-generator/spec.md
  ticket: null
  adr: null
  pr: null
files:
  - specs/001-cv-generator/plan.md
  - specs/001-cv-generator/research.md
  - specs/001-cv-generator/data-model.md
  - specs/001-cv-generator/contracts/template-props.md
  - specs/001-cv-generator/quickstart.md
  - CLAUDE.md (agent context updated by script)
tests:
  - none (planning artifacts; constitution gate evaluated PASS pre- and post-design)
---

## Prompt

Create the implementation plan for the CV Generator spec using this technical approach:

## Stack (per constitution)
- Next.js 15+ (App Router), TypeScript, Tailwind CSS.
- 100% client components ("use client"). Configure for static export (output: 'export' in next.config) so it deploys as pure static files on Vercel free tier.
- Zero runtime dependencies beyond Next.js, React, and Tailwind. No UI kit, no form library, no state library, no PDF library. Icons as inline SVG.

## State Architecture
- One single source of truth: a CVDocument object matching the spec's Key Entities (personalInfo, photo, sections array with {id, defaultHeading, customHeading, order, content}, styleSelection {templateId, accentColor, fontSizeLevel}).
- Manage it with useReducer + React Context (one CVContext provider in the root layout of the app's client tree). Actions like UPDATE_FIELD, ADD_ENTRY, REMOVE_ENTRY, RENAME_SECTION, MOVE_SECTION, SET_TEMPLATE, RESET.
- Section order = array order of the sections array; move up/down swaps array positions.
- Photo stored as a base64 data URL in state via FileReader (input type="file" accept="image/*" capture-friendly). Never uploaded anywhere.
- A derived helper isSectionEmpty(section) centralizes the "empty sections never render" rule so all 5 templates share it.
- beforeunload listener armed only when hasAnyData(cvDocument) is true (FR-027).

## Routing / Screens
- Single-page app feel within App Router: one route (/) that renders one of three screens based on a screen state: 'gallery' | 'form' | 'preview'. No URL navigation between screens — this avoids losing in-memory state and keeps back-swipe behavior controlled by the leave-site warning.

## Template Architecture
- Each template = one React component receiving the full CVDocument. All 5 implement a shared TemplateProps interface.
- Templates render sections by iterating the ordered sections array and skipping empty ones — section order and custom headings work automatically in every template.
- Accent color and font size applied via CSS custom properties (--accent, --fs-base) set on the template root element; templates reference only these variables so switching is instant.
- Thumbnails in the gallery: render each real template component scaled down with CSS transform against small built-in sample data — no separate thumbnail images to maintain.

## Print / PDF Approach
- Browser print-to-PDF. The preview screen renders the CV inside an A4-proportioned container (210mm width basis).
- Global print CSS: @page { size: A4; margin: 0 } plus a .print-only / .no-print class system — on print, everything except the CV container is hidden.
- Page-break control: each section entry gets break-inside: avoid; section blocks use break-inside rules so no entry splits across pages (FR-023, SC-006).
- Sidebar templates: sidebar element uses a page-1-only strategy (fixed height A4 column with overflow content structured to continue full-width) — plan the exact CSS approach and note it as the highest-risk item to validate first with a spike task.

## Component Breakdown (suggested)
- screens/: GalleryScreen, FormScreen, PreviewScreen
- components/form/: SectionCard (collapsible, rename control, move controls, filled indicator), PersonalInfoSection, PhotoSection, ObjectiveSection, RepeatableSection (generic for education/experience/languages/certifications/references), SkillsChips, StickyActionBar
- components/preview/: TemplateSwitcher, ColorPalette, FontSizeToggle, PdfButton
- templates/: ClassicTemplate, ProfessionalTemplate, ModernTemplate, ElegantTemplate, MinimalTemplate + shared/ (SectionHeading, ContactLine, PhotoFrame)
- lib/: cv-types.ts, cv-reducer.ts, cv-context.tsx, empty-checks.ts, sample-data.ts (for thumbnails), constants.ts (palette, font levels, default sections)

## Testing / Validation approach
- Manual quality-gate checklist from the constitution as the primary gate (360px, print preview A4, refresh clears data).
- Keep automated testing minimal: unit tests only for pure logic (reducer, empty-checks) if the plan includes tests at all — no e2e infrastructure.

## Risks to address in plan
1. Sidebar page-1-only print behavior (highest risk — needs early spike).
2. Mobile Chrome print dialog fidelity vs on-screen preview.
3. Large base64 photos causing sluggish re-renders — plan a downscale-on-upload step (canvas resize to ~600px max dimension).

## Response snapshot

Produced full Phase 0–1 planning artifacts for 001-cv-generator. plan.md: technical context (Next.js 15+/TS/Tailwind, static export, zero extra runtime deps), constitution check PASS on all 6 principles (pre- and post-design, Complexity Tracking empty), src/ structure per suggested breakdown, 7 key decisions with rationale, internal TS contracts instead of network APIs, NFR budgets, top-3 risk table with sidebar-print spike as earliest task. research.md: 10 decision records (static export config with next/image caveat, useReducer+Context, single-route screens, A4 print CSS with @page margin 0, sidebar page-1-only grid strategy + spike protocol, live scaled thumbnails, canvas photo downscale ≤600px JPEG q0.85, beforeunload guard, CSS grid-rows collapse animation, minimal Vitest for pure logic only). data-model.md: CVDocument/PersonalInfo/Section/SectionContent variants/Entry/StyleSelection with field tables, emptiness rules, full reducer action table, silent no-op error policy. contracts/template-props.md: 5 internal contracts (TemplateProps obligations, CVAction guarantees, useCV, empty-checks as single emptiness authority, processPhoto). quickstart.md: setup, run, and constitution-gate verification steps. Agent context script updated CLAUDE.md successfully.

## Outcome

- ✅ Impact: Feature fully planned; ready for /sp.tasks. Highest-risk item (sidebar print CSS) isolated as a mandatory early spike.
- 🧪 Tests: Constitution gate PASS ×6 pre- and post-design; no violations to justify.
- 📁 Files: plan.md, research.md, data-model.md, contracts/template-props.md, quickstart.md, CLAUDE.md (script-updated)
- 🔁 Next prompts: /sp.tasks to generate the dependency-ordered task list.
- 🧠 Reflection: User supplied a near-complete technical design; planning work was formalizing contracts, emptiness rules, and the sidebar print spike protocol.

## Evaluation notes (flywheel)

- Failure modes observed: none — update-agent-context.ps1 ran clean (unlike create-new-feature.ps1 earlier).
- Graders run and results (PASS/FAIL): PASS — no NEEDS CLARIFICATION remained; all template placeholders resolved.
- Prompt variant (if applicable): n/a
- Next experiment (smallest change to try): n/a
