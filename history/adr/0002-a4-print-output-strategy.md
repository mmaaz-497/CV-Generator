# ADR-0002: A4 Print-to-PDF Output Strategy

- **Status:** Accepted
- **Date:** 2026-07-11
- **Feature:** 001-cv-generator
- **Context:** The product's deliverable is a pixel-perfect A4 PDF produced on a
  phone and matching the on-screen preview exactly (constitution Principle III).
  Five visually distinct templates — including full-bleed designs (colored header
  band, dark full-height sidebar) — must share one output pipeline, support live
  restyling (template/accent/font-size switches), and paginate cleanly without
  splitting entries. A clarification fixed sidebar behavior: sidebar on page 1 only,
  full-width continuation on page 2.

## Decision

Browser print-to-PDF as the only output path, built on an integrated CSS strategy:

- **PDF generation**: the browser print dialog (`window.print()`); no PDF library.
- **Page geometry**: `@page { size: A4; margin: 0 }`; each template implements its
  own inner margins in mm, so full-bleed designs are possible and screen preview and
  print share identical mm-based geometry (preview container = 210mm basis).
- **Chrome isolation**: a global `.no-print` class system hides everything except
  the CV container in print media.
- **Pagination**: `break-inside: avoid` (+ legacy `page-break-inside`) on every
  repeatable entry and heading block — no entry ever splits across pages.
- **Sidebar templates (Professional, Elegant)**: page-1-only sidebar via a
  fixed-297mm two-column grid for page 1; overflow sections render in a follow-on
  full-width container that naturally lands on page 2. Flagged highest-risk; a
  throwaway spike must validate it in Chrome print preview (desktop + Android)
  before any of the five templates are built.
- **Live restyling**: templates read accent and font size only via CSS custom
  properties (`--accent`, `--fs-base`) set on the template root — instant restyle
  with no re-mount and no per-template theming logic.
- **Gallery thumbnails**: the real template components rendered against tiny sample
  data and scaled with `transform: scale()` — thumbnails can never drift from actual
  print output.

## Consequences

### Positive

- What you preview is what prints: one rendering pipeline (real DOM + print CSS)
  serves screen, thumbnail, and PDF, eliminating whole classes of fidelity drift.
- Zero dependencies added; PDF quality is Chromium's native print engine (vector
  text, selectable/searchable output) rather than a rasterizing JS library.
- Restyle switches are O(1 CSS variable write) — meets the "instant re-render"
  requirement on low-end phones.
- `margin: 0` on `@page` suppresses browser header/footer URL text in typical Chrome
  configurations without user fiddling.

### Negative

- Output fidelity is hostage to the browser's print engine; only Chrome on Android
  is the validated reference (constitution scopes this deliberately). Other
  browsers/paper sizes are unguaranteed.
- The page-1-only sidebar is genuinely hard in CSS — hence the mandatory early
  spike; fallback is constraining sidebar templates to one page of content.
- The shopkeeper's saved-PDF flow depends on the OS print dialog UX (destination
  "Save as PDF"), which the app cannot control or simplify.
- No programmatic control over the produced file (name, metadata, direct share) —
  acceptable because WhatsApp sharing happens outside the app by design.

## Alternatives Considered

- **Alternative A — Client-side PDF libraries (`jspdf` + `html2canvas`, or
  `react-pdf`)**: rejected. Adds dependencies (constitution Principle V/VI),
  rasterized or re-implemented layouts diverge from the on-screen preview (violates
  FR-021 "matches preview exactly"), large bundles hurt phone load times.
- **Alternative B — JS-driven pagination into explicit page `<div>`s**: rejected.
  Re-implements the browser's fragmentation engine, fragile under font-size levels
  and dynamic content; `break-inside: avoid` gives the same guarantee declaratively.
- **Alternative C — Repeating sidebar on every printed page** (`position: fixed`
  print trick): rejected by clarification (page 2 must be full-width) and unreliable
  across Chromium versions for backgrounds spanning page breaks.
- **Alternative D — Static thumbnail images for the gallery**: rejected. Asset
  maintenance burden and guaranteed drift from real template output as templates
  evolve.

## References

- Feature Spec: [specs/001-cv-generator/spec.md](../../specs/001-cv-generator/spec.md) (FR-016–FR-023, SC-005/SC-006, Clarifications session 2026-07-11)
- Implementation Plan: [specs/001-cv-generator/plan.md](../../specs/001-cv-generator/plan.md) (Key Decisions 3–6, Risk Analysis #1–2)
- Research: [specs/001-cv-generator/research.md](../../specs/001-cv-generator/research.md) (R4–R6)
- Related ADRs: [ADR-0001](./0001-client-only-application-architecture.md) (zero-dependency constraint this strategy honors)
- Evaluator Evidence: [history/prompts/001-cv-generator/0004-plan-cv-generator-implementation.plan.prompt.md](../prompts/001-cv-generator/0004-plan-cv-generator-implementation.plan.prompt.md)
