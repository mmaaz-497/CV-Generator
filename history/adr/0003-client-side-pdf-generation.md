# ADR-0003: Client-Side PDF Generation

- **Status:** Accepted (contingent on the constitution amendment noted below)
- **Date:** 2026-07-13
- **Feature:** 002-pdf-download
- **Context:** The shopkeeper's current "Download PDF" opens the browser print dialog,
  costing several taps to reach "Save as PDF" — friction for a non-technical user who
  just wants a file to share on WhatsApp. Feature 002 replaces it with a one-tap direct
  download plus a separate Print action. A silent file save cannot be produced by the
  print path, so a PDF must be generated in-app. This collides with two established
  constraints: ADR-0001 fixed "no PDF library … none at runtime beyond Next.js, React,
  Tailwind," and constitution Principles V (Simplicity) / VI (Fixed Tech Stack). The
  non-negotiable constraint is Principle II: customer data (text + photo) must never leave
  the device. The 5 HTML/CSS templates — several using `color-mix()` accents and a
  fixed-height sidebar (`.page1`) print recipe (feature 001 R5) — must remain the single
  source of truth (no rewrite).

## Decision

Adopt an integrated **client-side, DOM-rasterising PDF pipeline**, imported only on the
Download interaction:

- **Rendering:** `html-to-image` — serialises the existing `.a4` template DOM through an
  SVG `<foreignObject>` and paints it with the **browser's own engine**, so `color-mix()`
  accents, flex/grid, mm borders, and loaded fonts match the on-screen preview.
- **Assembly + download:** `jspdf` — places each A4 page image at 210×297mm and saves the
  resulting `Blob` via a synthetic `<a download>` (`doc.save(name)`) — a direct save with
  no print/destination dialog.
- **Pagination:** a small **custom paginator** that reuses the templates' existing print
  structure — one page when content fits; sidebar templates reuse the R5 `.page1`(297mm) +
  packed `.rest` layout; single-column overflow greedily packs entry-atomic blocks per
  297mm page. A `.cv-entry` is never split (FR-005), reproducing the print path's breaks.
- **Packaging:** both libraries are loaded via dynamic `import()` inside the export module,
  so Next.js code-splits them out of first paint (gallery/form/preview load unaffected).
  Rasterisation DPI is capped at ~2× CSS px to bound file size and low-end-phone memory.
- **Governance:** this is a **bounded, recorded exception** to the zero-dependency stance
  of ADR-0001 and constitution V/VI — scoped to on-device document export only. It
  **narrows ADR-0001's "no PDF library" clause**; it does **not** touch Principle II
  (nothing is transmitted) or the zero-backend/zero-persistence architecture, which remain
  in force. Requires a constitution amendment (MINOR) before implementation.

## Consequences

### Positive

- Delivers the actual user value: one tap → a correctly-named A4 PDF in the phone's
  Downloads, shareable immediately; Print retained for on-the-spot printing.
- Templates stay the single source of truth — zero template/reducer changes, and the
  download inherits the R5-validated page-break behaviour instead of re-deriving it.
- Native-engine rasterisation reproduces the preview faithfully, including the `color-mix()`
  accents that rule out the common html2canvas recipe.
- Privacy is preserved by construction: rasterisation and assembly are in-memory; the photo
  is already a local data URL; the output is a local Blob — nothing leaves the device.
- Dynamic import confines the cost to the export path, protecting first-paint speed
  (Principle IV) and keeping the app static-export-safe (Principle VI — code-split at build).

### Negative

- Two runtime dependencies enter the project (`html-to-image` ~15KB gz; `jspdf` ~100–130KB
  gz), adding a supply-chain surface that ADR-0001 deliberately avoided. Mitigated by
  pinning, export-path-only loading, and auditing that neither makes network calls.
- The PDF is **raster** (image pages): text is not selectable and files are larger than a
  vector PDF. Accepted — the deliverable is a faithful A4 image to share/print, not a
  document to copy text from; DPI cap balances crispness vs size.
- The custom paginator is new logic that must track the templates' print structure; if a
  future template changes its page composition, the paginator must be revisited.
- Requires amending the constitution and narrowing ADR-0001 — governance overhead, and a
  precedent that must be guarded so it does not erode into general dependency creep.

## Alternatives Considered

- **`html2canvas` + jsPDF (the popular recipe):** REJECTED. html2canvas reimplements CSS in
  JS and does **not** support `color-mix()` — 4 of 5 templates would render wrong accent
  colours; and slicing one tall canvas to page height cuts entries mid-block (violates
  FR-005). Pros: single well-known lib, wide examples. Cons: fails our two hardest
  requirements (accent fidelity, no split).
- **`jsPDF.html()`:** REJECTED — wraps html2canvas internally, inheriting both failures.
- **`pdf-lib` (redraw in a PDF DSL):** REJECTED. Pros: true vector, selectable text, small
  precise files. Cons: requires re-implementing all 5 template designs in PDF primitives —
  violates FR-013 (templates as source of truth), doubles the design surface, and drifts
  from the print output over time.
- **Paged.js + rasterise:** REJECTED. Pros: honours CSS paged-media/`break-inside`. Cons:
  heavier dependency; its reflow can diverge from Chrome's print and fights the fixed-height
  sidebar recipe; a small custom paginator is simpler (Principle V) and predictable.
- **Keep print-only (status quo) / trigger `iframe.print()`:** REJECTED. Pros: zero new
  deps, perfect fidelity. Cons: still shows a dialog — does not solve the reported problem.
- **Static (non-dynamic) import of the libs:** REJECTED. Pros: simpler code. Cons: bloats
  first paint for every user, penalising the common create-CV flow that may never download.

## References

- Feature Spec: [specs/002-pdf-download/spec.md](../../specs/002-pdf-download/spec.md)
- Implementation Plan: [specs/002-pdf-download/plan.md](../../specs/002-pdf-download/plan.md) (Constitution Check, Complexity Tracking, Risks)
- Research: [specs/002-pdf-download/research.md](../../specs/002-pdf-download/research.md) (R1, R4, R6, R7)
- Data Model / Contracts: [data-model.md](../../specs/002-pdf-download/data-model.md), [contracts/pdf-export.md](../../specs/002-pdf-download/contracts/pdf-export.md)
- Related ADRs: [ADR-0001](./0001-client-only-application-architecture.md) (**narrowed** by this ADR — its "no PDF library / zero runtime deps" clause now admits a scoped, on-device export exception; all other clauses stand), [ADR-0002](./0002-a4-print-output-strategy.md) (the print path this download must match)
- Evaluator Evidence: [history/prompts/002-pdf-download/0014-one-tap-pdf-download-plan.plan.prompt.md](../prompts/002-pdf-download/0014-one-tap-pdf-download-plan.plan.prompt.md)
- Governance: requires constitution amendment (v1.0.0 → v1.1.0, MINOR) permitting narrowly-scoped, dynamically-imported client-side libraries for on-device export; Principle II reaffirmed non-negotiable.
