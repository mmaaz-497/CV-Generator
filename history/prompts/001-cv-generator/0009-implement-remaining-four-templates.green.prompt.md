---
id: 0009
title: Implement remaining four templates
stage: green
date: 2026-07-12
surface: agent
model: claude-opus-4-8
feature: 001-cv-generator
branch: 001-cv-generator
user: Muhammad Maaz
command: /sp.implement
labels: ["implement", "cv-generator", "us1", "templates", "print", "sidebar-page1"]
links:
  spec: specs/001-cv-generator/spec.md
  ticket: null
  adr: history/adr/0002-a4-print-output-strategy.md
  pr: null
files:
  - src/templates/shared/SectionBody.tsx (new — shared SectionBlock/SectionBody renderer)
  - src/templates/shared/SidebarMeta.tsx (new — labelled contact/personal meta lists)
  - src/templates/shared/regions.ts (new — planSidebarLayout, R5 two-region split)
  - src/templates/ProfessionalTemplate.tsx (new — T027)
  - src/templates/ModernTemplate.tsx (new — T028)
  - src/templates/ElegantTemplate.tsx (new — T029)
  - src/templates/MinimalTemplate.tsx (new — T030)
  - src/templates/registry.ts (all 5 templates registered)
  - specs/001-cv-generator/tasks.md (T027–T031 marked done)
tests:
  - "npm run build → static export + TypeScript pass"
  - "npm test → 25/25 pass (lib untouched)"
  - "T031 headless harness (puppeteer + pdfjs, temporary /verify route): 5 templates × {short, overflow} — all A4, name+experience present, no app chrome; Professional & Elegant overflow: 2+ pages, sidebar meta on page 1 only, overflow entry rendered full-width on continuation"
  - "Gallery at 360px: 5 live thumbnails (all .tpl-* roots present), 0 horizontal overflow"
---

## Prompt

Implement tasks T027 through T031 (remaining 4 templates).

## Response snapshot

Built the remaining four templates on the validated R5 recipe, plus three shared helpers to avoid repeating body/region logic across templates:

- **shared/SectionBody.tsx** — `SectionBlock` (heading + body) and `SectionBody` render a section by content variant (text/skills/entries/references, skipping empty entries and the references on-request line) using a neutral `.cv-*` class vocabulary each template styles from its own scoped root.
- **shared/SidebarMeta.tsx** — `MetaList` + `CONTACT_FIELDS`/`DETAIL_FIELDS` render labelled personal/contact lists for sidebar templates, rendering nothing when all fields blank.
- **shared/regions.ts** — `planSidebarLayout(visible)` implements the R5 sidebar page-1-only strategy: short CVs stay single-region (`.sheet` with `min-height:297mm`, no clipping); genuinely long CVs use two-region (`.page1` fixed 297mm grid + `break-after: page` + full-width `.rest`). Conservative line-estimate budget; falls back to single-region if nothing fits page 1 so content is never clipped and page 1 is never sidebar-only.

Templates: **Professional** (light accent sidebar via color-mix, two-region page-1-only), **Modern** (full-bleed accent header band + two-column body, no decorative full-height column so it flows safely to page 2), **Elegant** (dark full-height accent sidebar, serif main, two-region page-1-only, `print-color-adjust: exact` so the dark column + white text survive "Background graphics" off), **Minimal** (single column, thin dividers, tight density). All four use `usesAccent: true` and set `--accent`/`--fs-base` on the root; Classic stays `usesAccent: false`.

Verification via a temporary `/verify` client route (same throwaway pattern as the R5 spike, deleted after) driven headless: all 5 templates render true A4; sidebar templates confirmed page-1-only under an 11-entry overflow CV (sidebar meta on page 1 only, overflow entries continue full-width); no app chrome; gallery shows 5 live thumbnails at 360px with 0 horizontal overflow.

## Outcome

- ✅ Impact: All 5 template looks are now available end-to-end — US1 (T013–T031) complete. Sellable CVs in Classic, Professional, Modern, Elegant, Minimal.
- 🧪 Tests: build+typecheck OK; 25/25 unit; T031 print harness ALL PASS (A4, no split at page boundary via break-inside avoid, no chrome, sidebar page-1-only proven).
- 📁 Files: 7 new source files + registry + tasks.md.
- 🔁 Next prompts: US2 (T032–T034 rename/reorder), then US3/US4/US5, then Phase 8 constitution gates (incl. T044 real-Android print pass).
- 🧠 Reflection: One harness false-negative (uppercase name glyphs in Classic/Minimal PDFs failed an exact-case string check) — fixed the assertion, not the templates. The two-region split is deliberately conservative: under-fill (safe blank space) is preferred over over-fill (would clip inside the fixed-height page-1 grid).

## Evaluation notes (flywheel)

- Failure modes observed: harness case-sensitivity (fixed). No template defects.
- Graders run and results (PASS/FAIL): PASS — build, tests, and the T031 per-page print assertions all green across 5 templates × 2 content volumes.
- Prompt variant (if applicable): n/a
- Next experiment (smallest change to try): during Phase 8 T044, eyeball the two-region boundary on real Android Chrome and confirm the dark Elegant sidebar prints with "Background graphics" unchecked (the `print-color-adjust: exact` bet).
