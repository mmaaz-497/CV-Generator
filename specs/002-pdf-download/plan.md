# Implementation Plan: One-Tap PDF Download

**Branch**: `002-pdf-download` | **Date**: 2026-07-13 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/002-pdf-download/spec.md`

## Summary

Replace the single print-dialog "Download PDF" button on the preview screen with two
labelled actions: a **Download PDF** that generates an A4 PDF entirely on-device and saves
it straight to the phone (no print dialog) with a customer-derived filename, and a **Print**
that keeps today's `window.print()` path. The PDF is produced by rasterising the *existing*
template DOM at A4 (browser-native rendering, so `color-mix` accents and fonts match the
preview exactly) and assembling A4 pages into a downloadable file — the templates stay the
single source of truth (no rewrite). Multi-page CVs are paginated by packing entry-atomic
blocks into 297mm pages, reproducing the print path's breaks with no entry split. Everything
runs client-side; nothing is transmitted. The two libraries are dynamically imported only
when the user taps Download, and the dependency is a recorded, bounded exception to the
zero-dependency principles (V/VI).

## Technical Context

**Language/Version**: TypeScript 5, React 19.2, Next.js 16.2 (App Router, `output: 'export'`)
**Primary Dependencies**: NEW (export path only, dynamically imported) — `html-to-image`
(SVG-foreignObject DOM rasterisation, browser-native CSS fidelity) + `jspdf` (assemble A4
image pages into a PDF Blob and trigger the direct download). Existing: React, Tailwind v4.
**Storage**: None. PDF is a transient in-memory Blob saved as the user's own file; no
customer data persisted or transmitted (constitution II, FR-006).
**Testing**: Vitest for the pure filename sanitiser (fits the minimal-testing policy);
headless Chrome (puppeteer) + pdfjs for empirical A4/page-count/fidelity verification.
**Target Platform**: Mobile Android Chrome (reference device); desktop is a convenience.
**Project Type**: Single-page web app (existing single Next.js project); this feature adds
`src/lib/pdf/*` and splits the preview export controls.
**Performance Goals**: Perceived-immediate download (~<5s on a mid-range phone for a typical
1-page CV); spinner visible within one frame of the tap.
**Constraints**: A4 only; output visually identical to preview for all 5 templates × photo
states; same page breaks as print with no entry split; on-device only; 44px touch targets;
static-export-safe (dynamic `import()` code-splits the libs out of first load).
**Scale/Scope**: One screen (preview) + one lib module + one pure sanitiser; 5 templates.

## Constitution Check

*GATE: evaluated against the six principles (v1.0.0). Re-checked after Phase 1 design.*

| # | Principle | Verdict | Notes |
|---|-----------|---------|-------|
| I | Mobile-First | ✅ PASS | Two 44px actions, verified at 360px; spinner/error inline. |
| II | Zero Backend, Zero Persistence | ✅ PASS (verify) | Generation is 100% client-side; no network, no storage. FR-006/SC-005 verified by network inspection in the spike. Libs must make no outbound calls. |
| III | Print-Perfect Output | ✅ PASS | Download is A4, matches preview, reproduces print page breaks (no entry split). Print path retained. Controls are `.no-print` and never in output. |
| IV | Speed of Use | ✅ PASS | One tap replaces the multi-step print-dialog flow; no new mandatory steps. |
| V | Simplicity Over Cleverness | ⚠️ EXCEPTION | Adds two runtime libraries + a small paginator. Justified in Complexity Tracking; bounded by dynamic-import (export path only) and templates-as-source-of-truth. |
| VI | Fixed Tech Stack | ⚠️ AMENDMENT | The stack's "zero runtime dependencies beyond Next/React/Tailwind" is loosened. Requires a constitution amendment (MINOR) + ADR before implementation. |

**Gate result**: PASS with two documented deviations (V, VI) → see Complexity Tracking and
the ADR/amendment action below. No unjustified violations.

**Action required before `/sp.implement`**: record the decision as an ADR
(`/sp.adr client-side-pdf-generation`) and amend the constitution to permit narrowly-scoped,
dynamically-imported client-side libraries for on-device document export (still no backend,
still nothing transmitted). The amendment must reaffirm II as non-negotiable.

## Project Structure

### Documentation (this feature)

```text
specs/002-pdf-download/
├── plan.md              # This file
├── research.md          # Phase 0 — approach, library choice, pagination, risks
├── data-model.md        # Phase 1 — export state machine + filename rules (no persistent entities)
├── quickstart.md        # Phase 1 — how to verify the feature
├── contracts/
│   └── pdf-export.md     # Phase 1 — module + component behaviour contracts
└── tasks.md             # Phase 2 (/sp.tasks — not created here)
```

### Source Code (repository root)

```text
src/
├── lib/
│   └── pdf/
│       ├── filename.ts        # pdfFilename(fullName): safe "<Name>-CV.pdf" / "CV.pdf"
│       ├── filename.test.ts   # Vitest — pure sanitiser truth table
│       └── generate.ts        # generateCvPdf(a4El, filename): dynamic-import html-to-image + jspdf,
│                              #   paginate → rasterise A4 pages → save Blob (no network)
├── components/
│   └── preview/
│       ├── ExportBar.tsx       # Download PDF + Print, loading/disabled/error states (replaces PdfButton)
│       ├── DownloadPdfButton.tsx
│       └── PrintButton.tsx     # existing window.print() path (renamed from PdfButton)
└── screens/
    └── PreviewScreen.tsx       # swap single PdfButton → <ExportBar/>; expose the .a4 element ref
```

**Structure Decision**: Extend the existing single Next.js project. All new logic is confined
to `src/lib/pdf/` and the preview export controls; no template or reducer changes. The two
libraries are imported dynamically inside `generate.ts` so Next code-splits them out of the
initial bundle — first paint, the gallery, and the form are unaffected.

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|--------------------------------------|
| Add `html-to-image` (runtime dep) | Rasterise the existing DOM with the browser's own renderer so `color-mix()` accents, flex/grid, and fonts match the preview exactly. | Pure-CSS/print can't produce a *silent* file download on Android Chrome (the whole problem). `html2canvas` has its own CSS engine that does **not** support `color-mix()` → 4/5 templates would render wrong accent colours. |
| Add `jspdf` (runtime dep) | Assemble A4 raster pages into a valid multi-page PDF Blob and trigger the direct `<a download>` save. | Hand-rolling a PDF writer is "clever" and risky (Principle V prefers the trodden path once a dep is justified); `pdf-lib` is equally heavy and no simpler for image-only pages. |
| Small custom paginator | Reproduce the print path's page breaks (pack `.cv-entry`-atomic blocks into 297mm pages; sidebar `.page1` is page 1) so no entry splits (FR-005/SC-004). | Naive tall-canvas slicing (the common html2canvas+jsPDF recipe) cuts entries mid-block. Paged.js is heavier and its reflow can diverge from Chrome and fights the fixed-height sidebar recipe. |

**Mitigations bounding the exception**: dynamic `import()` (libs load only on Download tap,
never in first paint); templates remain the single source of truth (FR-013 — no redraw);
strictly on-device (FR-006) — verified by network inspection; libraries pinned and audited
for zero outbound calls.

## Risks

| # | Risk | Mitigation | Fallback |
|---|------|------------|----------|
| 1 | Rasteriser doesn't reproduce preview fidelity (color-mix accents, dark Elegant sidebar, fonts) | **Earliest spike**: generate a PDF for Elegant + Professional (accent + dark sidebar) and Classic, compare page images to the print output before building the UI | Switch rasteriser (dom-to-image variants) or embed fonts explicitly; last resort keep print-only |
| 2 | Multi-page breaks differ from print / an entry splits | Custom paginator packs entry-atomic blocks per 297mm page; spike on Elegant overflow (the R5 two-region case) and a long single-column CV | Constrain to the print path for overflow CVs; surface "use Print for long CVs" |
| 3 | Android Chrome blocks/awkwardly handles the Blob `<a download>` save, or generation is slow/OOM on a low-end phone | Spike the actual save + timing on a real Android device; show spinner; keep Print as the guaranteed fallback (FR-009) | Print fallback always available; cap raster DPI to bound memory/time |

## Definition of Done

- Two labelled actions on preview; Download saves an A4 PDF directly (no dialog) named per
  FR-003; Print unchanged.
- Downloaded PDF is A4 and matches preview for all 5 templates × (photo, no photo); 2-page
  CV matches print breaks with no split entry.
- Zero network requests carry CV data during generation; no storage introduced.
- Spinner + disabled during work; inline error → Print fallback on failure.
- Constitution amended + ADR recorded; Complexity Tracking justified.
- `npm run build` static export succeeds; filename sanitiser unit-tested; export verified
  headless and (residual) on real Android Chrome.
```
