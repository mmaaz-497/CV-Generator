# Quickstart: One-Tap PDF Download

**Date**: 2026-07-13 | **Plan**: [plan.md](./plan.md)

## Prerequisites

- Feature 001 (CV Generator) working: gallery → form → preview.
- Node 20+, npm. A real Android phone (or DevTools 360px) for the mobile gates.

## Install (implementation phase)

```bash
npm i html-to-image jspdf     # runtime deps for the export path (dynamically imported)
```

These are the only new runtime dependencies and are code-split (loaded on the first Download
tap), so they don't affect first paint.

## Run

```bash
npm run dev        # http://localhost:3000
npm run build      # static export → ./out
npx vitest run     # includes the pdfFilename sanitiser tests
```

## Verify (spec success criteria + constitution gates)

1. **One tap (SC-001/SC-002)**: build a CV → preview → tap **Download PDF** once → a PDF
   saves to the phone's Downloads with **no print/destination dialog**.
2. **Filename (SC-006)**: name "Ahmed Khan" → file `Ahmed-Khan-CV.pdf`; a name with unsafe
   characters is sanitised; a blank name → `CV.pdf`.
3. **Fidelity (SC-003)**: for all 5 templates × (with photo, without photo), open the
   downloaded PDF beside the preview — A4 and visually identical (accents, dark Elegant
   sidebar, photo placement).
4. **Page breaks (SC-004)**: a 2-page CV downloads as a 2-page PDF with the same breaks as
   **Print**; no CV entry is split across the boundary. Compare Download vs Print for the
   Elegant overflow case (sidebar on page 1 only).
5. **Privacy (SC-005, constitution II)**: with DevTools Network open, tap Download — **no**
   request carries the CV text or photo; Application tab shows no new storage.
6. **Feedback + fallback (SC-007/SC-008)**: during generation a spinner shows and the button
   is disabled (a second tap does nothing); force a failure → an inline error appears
   suggesting **Print**, and Print still produces the CV.
7. **Print retained (FR-010)**: **Print** opens the device print flow with the A4 CV,
   unchanged from before.
8. **Mobile (constitution I)**: at 360px both actions are ≥44px, no horizontal scroll, no
   clipped controls.

## Key files (after implementation)

| Path | Purpose |
|------|---------|
| `src/lib/pdf/filename.ts` | `pdfFilename()` — safe filename derivation (unit-tested) |
| `src/lib/pdf/generate.ts` | `generateCvPdf()` — paginate → rasterise → save (dynamic import) |
| `src/components/preview/ExportBar.tsx` | Download PDF + Print, loading/error states |
| `src/screens/PreviewScreen.tsx` | Hosts `ExportBar`, passes the `.a4` element ref |

## Residual (human) checks

- On-device Android Chrome: the silent Blob save lands in Downloads; generation time feels
  immediate (~<5s) for a typical CV; fidelity holds on the reference phone.
