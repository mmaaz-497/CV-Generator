---
id: 0018
title: Implement PDF foundation and spike
stage: green
date: 2026-07-13
surface: agent
model: claude-opus-4-8
feature: 002-pdf-download
branch: 002-pdf-download
user: Muhammad Maaz
command: /sp.implement
labels: ["implement", "pdf-download", "spike", "html-to-image", "jspdf", "pagination"]
links:
  spec: specs/002-pdf-download/spec.md
  ticket: null
  adr: history/adr/0003-client-side-pdf-generation.md
  pr: null
files:
  - package.json (added html-to-image ^1.11.13, jspdf ^4.2.1)
  - src/lib/pdf/filename.ts (pdfFilename — pure)
  - src/lib/pdf/filename.test.ts (9 Vitest cases)
  - src/lib/pdf/paginate.ts (computePages — print-matching page bands)
  - src/lib/pdf/generate.ts (generateCvPdf — dynamic import, rasterise, assemble, save)
  - specs/002-pdf-download/research.md (R1/R4 spike result recorded)
  - specs/002-pdf-download/tasks.md (T001–T007 marked done)
tests:
  - "npm test → 34/34 (9 new filename + 25 existing)"
  - "npm run build → static export + TypeScript pass; export libs dynamic-import-only (not in first paint)"
  - "T005 spike headless (real out/ build): 41/41 across 7 template/photo/overflow cases — A4, page-count parity vs print, fidelity (color-mix accents + dark Elegant sidebar + photo), zero external network during generation"
---

## Prompt

/sp.implement (no args) — implement the PDF download feature. Followed the feature-001 cadence: Phase 1 + Phase 2 (through the T005 spike + production module), stop before US1 UI and report the spike.

## Response snapshot

**Phase 1 (T001–T002)**: installed `html-to-image@^1.11.13` + `jspdf@^4.2.1`; confirmed static export still builds and neither lib is statically imported. (2 moderate npm advisories are pre-existing PostCSS-via-Next transitives, unrelated — not "fixed" since that downgrades Next.)

**Phase 2 (T003–T007)**:
- `pdfFilename` (pure) + 9 Vitest cases (unsafe chars, empty→`CV.pdf`, no-alphanumeric→`CV.pdf`, >60 truncation, null-tolerant).
- **T005 spike** — throwaway `/pdf-spike` route rendering a template in the real `.a4` and exposing an in-page prototype (html-to-image `toCanvas` → paginator → jsPDF). Drove it headless over 7 cases; **41/41 pass**.
- Productionised the validated logic: `paginate.ts` (`computePages`) + `generate.ts` (`generateCvPdf`, libraries behind dynamic `import()` — export-path-only per ADR-0003 / constitution v1.1.0). Deleted the spike route.

**Spike findings (recorded in research R1/R4):**
1. **Fidelity CONFIRMED** — a captured PNG shows Elegant's dark-teal `color-mix()` sidebar, white text, and accent headings reproduced faithfully; html-to-image uses the browser's own engine (SVG foreignObject), so `color-mix()`/`color(srgb …)` render — the exact thing that rules out html2canvas.
2. **Paginator bug caught + fixed** — the first "break when the next entry exceeds the limit" left the final page unbounded; Professional overflow's `.rest` is 1292px, so the tail overflowed one page, **clipping content and under-counting (2 vs 3)**. Fixed: cut at the largest `.cv-entry` top ≤ (pageStart + A4 height); + a band clamp. Now every page ≤ A4, no entry split, page counts equal print for all cases (Professional/Elegant overflow both 3/3).
3. **Privacy** — the only "request" during generation is html-to-image's in-memory `data:image/svg+xml` URI (which contains the CV inline but never leaves the device); zero real network requests. Two test-threshold false alarms (dark-teal luminance ≈71 vs my <70 cutoff; Minimal's faint hairline accent) were corrected in the harness, not the code.

## Outcome

- ✅ Impact: The highest-risk part (fidelity + print-parity pagination, on-device) is proven before any UI. `generateCvPdf(a4El, filename)` is callable and dynamic-import-packaged.
- 🧪 Tests: 34/34 unit; build+typecheck OK; spike 41/41.
- 📁 Files: 2 deps + 4 new lib files + research/tasks updates.
- 🔁 Next prompts: US1 (T008–T010) — `DownloadPdfButton` wired into `PreviewScreen`, then the MVP one-tap checkpoint; then US2/US3 and the Polish gates.
- 🧠 Reflection: The spike earned its keep twice — it visually proved `color-mix()` fidelity (the make-or-break for this approach) and caught a content-clipping pagination bug on Professional that unit tests never could. Same risk-first payoff as feature 001's R5 print spike.

## Evaluation notes (flywheel)

- Failure modes observed: (1) naive paginator clipped/under-counted sidebar overflow — fixed. (2) network-privacy assertion false-flagged html-to-image's in-memory `data:` URI — corrected to count only http(s) schemes. (3) over-strict pixel thresholds — corrected.
- Graders run and results (PASS/FAIL): PASS — 34 unit, build, and 41/41 spike assertions all green; spike recipe recorded in research.
- Prompt variant (if applicable): n/a
- Next experiment (smallest change to try): in US1, add a headless check that `generateCvPdf` produces the same page count as the spike for one template, guarding against regressions in the production paginator vs the prototype.
