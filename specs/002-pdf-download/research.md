# Research: One-Tap PDF Download

**Feature**: 002-pdf-download | **Date**: 2026-07-13 | **Plan**: [plan.md](./plan.md)

All NEEDS CLARIFICATION from Technical Context are resolved below.

## R1. PDF generation approach (highest risk — spike first)

- **Decision**: Generate the PDF **client-side by rasterising the existing template DOM at
  A4**, using two dynamically-imported libraries:
  1. **`html-to-image`** — serialises the target DOM into an SVG `<foreignObject>` and paints
     it to a canvas, so it uses the **browser's own rendering engine**. This preserves
     `color-mix()` accent tints, flex/grid layout, borders in mm, and the loaded fonts —
     i.e. the snapshot looks like the on-screen preview.
  2. **`jspdf`** — places each A4 page image into an A4 PDF (`addImage` at 210×297mm) and
     saves the resulting Blob via a synthetic `<a download>` (`doc.save(filename)`) — a
     direct file save with **no print/destination dialog**.
- **Rationale**: The preview already renders each template at A4 width; reusing that DOM
  keeps the templates as the single source of truth (FR-013 — no redraw) and inherits their
  validated print structure. `html-to-image`'s native rendering is the only rasteriser that
  reproduces our `color-mix()`-based accents. jsPDF's Blob `save()` is the standard way to
  trigger a silent download on mobile Chrome. Everything runs on-device (FR-006).
- **Alternatives considered**:
  - **`html2canvas` + jsPDF** (the popular recipe): REJECTED. html2canvas reimplements CSS
    in JS and does **not** support `color-mix()` (used by Professional/Modern/Elegant/Minimal
    for accents) → wrong colours; and its single tall canvas sliced to page height cuts
    entries mid-block (violates FR-005).
  - **jsPDF `.html()`**: uses html2canvas internally → same failures.
  - **`pdf-lib` / redraw in a PDF DSL**: REJECTED — would rewrite all 5 templates in a PDF
    renderer (violates FR-013) and is far more work.
  - **Paged.js + rasterise**: REJECTED — heavier dependency; its pagination reflow can
    diverge from Chrome's and fights our fixed-height sidebar (`.page1`) recipe. A small
    custom paginator is simpler (Principle V) and predictable.
  - **Keep print-only / trigger `iframe.print()`**: REJECTED — still shows a dialog; the
    feature exists to remove it.
- **Tradeoff (accepted)**: the PDF is **raster** (image pages), so text is not selectable and
  file size is larger than a vector PDF. Acceptable — the deliverable is a faithful A4 image
  of the CV to share on WhatsApp/print; visual identity (FR-004) is what matters. DPI is
  capped (R6) to balance crispness vs size/memory.

## R2. Direct download without a dialog

- **Decision**: `jsPDF.save('<Name>-CV.pdf')` internally builds a `Blob`, creates an object
  URL, and clicks a hidden `<a download>` — on Android Chrome this saves straight to
  Downloads with no destination picker.
- **Rationale**: `<a download>` + Blob is the browser-native silent-save path; jsPDF wraps it
  reliably across browsers.
- **Alternatives**: manual `URL.createObjectURL(blob)` + `<a download>` (identical mechanism,
  more code); the File System Access API `showSaveFilePicker` (REJECTED — reintroduces a
  dialog and has poor Android support). The on-device behaviour is confirmed in the spike on
  a real phone (residual human check).

## R3. Filename derivation & sanitisation

- **Decision**: pure `pdfFilename(fullName: string): string`:
  - trim → collapse internal whitespace to single spaces;
  - if empty → `"CV.pdf"`;
  - else replace any character outside `[A-Za-z0-9]` (covers `/ \ : * ? " < > |`, control
    chars, punctuation, and spaces) with `-`, collapse repeated `-`, strip leading/trailing
    `-`;
  - truncate the name part to ≤60 chars; append `-CV.pdf`;
  - if sanitisation leaves the name empty → `"CV.pdf"`.
- **Rationale**: deterministic, filesystem-safe on Android/Windows/iOS, unit-testable.
  Examples: `"Ahmed Khan"` → `Ahmed-Khan-CV.pdf`; `"Fatima / Noor"` → `Fatima-Noor-CV.pdf`;
  `"   "` → `CV.pdf`.
- **Alternatives**: keep spaces/underscores (rejected — spaces are awkward in share flows;
  some filesystems dislike them); transliterate non-ASCII (out of scope — content is English
  per feature 001).

## R4. Page-break fidelity (reproduce the print path)

- **Decision**: a small **custom paginator** builds the PDF page list from the live template,
  reusing its existing structure so breaks match print (SC-004) and no `.cv-entry` splits:
  - **Common case (fits one A4 page)**: snapshot the whole `.a4` element as a single page.
    Detect by measuring rendered height ≤ one page (≈1123px @96dpi).
  - **Sidebar templates (Professional/Elegant) that overflow**: the R5 recipe already emits a
    fixed-297mm `.page1` block + a full-width `.rest`. Page 1 = the `.page1` block; the
    `.rest` content is packed into further 297mm pages.
  - **Single-column overflow (Classic/Modern/Minimal)**: walk the body's top-level blocks
    (section headings + `.cv-entry` units, treated as atomic) and greedily pack them into
    297mm page containers, never splitting a `.cv-entry`.
  Each page container is rasterised (R1) to one PDF page.
- **Rationale**: reuses the templates' own paginated structure and the `break-inside: avoid`
  contract, so the download reproduces Chrome's print breaks without a heavy pagination lib.
- **Alternatives**: rely on jsPDF auto-paging of one tall image (rejected — splits entries);
  Paged.js (rejected, R1).
- **Spike obligation**: validate on **Elegant (overflow, dark sidebar, accent)** and a long
  single-column CV before building the UI — the same risk-first approach as feature 001's R5
  print spike. Verify page count and break positions equal the print output.

### R1/R4 — Spike result (2026-07-13): ✅ PASS (41/41)

Built a throwaway `src/app/pdf-spike/page.tsx` that renders a template in the real `.a4` and
exposes an in-page prototype of the pipeline (html-to-image `toCanvas` → paginator → jsPDF).
Drove it headless across 7 cases (Classic short ±photo, Classic/Minimal overflow, Professional
overflow+photo, Elegant overflow+photo, Elegant short) and checked each generated PDF with
pdfjs + in-page pixel sampling.

**Empirical outcome:**

- **Fidelity CONFIRMED** — a rendered PNG of Elegant shows the dark-teal `color-mix()` sidebar,
  white sidebar text, accent headings, and layout reproduced faithfully. html-to-image uses the
  browser's own engine (SVG `<foreignObject>`), so `color-mix()`/`color(srgb …)` values render
  correctly — the exact thing html2canvas cannot do. Accent renders for Professional (2%),
  Elegant (32%), and even Minimal's faint hairline accent (0.12%); the Elegant sidebar samples
  92–95% dark in its left column.
- **A4 + direct assembly** — every generated PDF is true A4 (595×842pt); jsPDF assembles pages
  and `doc.save()` triggers a dialog-free `<a download>`.
- **Page-break parity** — after correcting the paginator (see below), page counts equal the
  print path for all cases: Classic 1/1 & 2/2, Minimal 2/2, Professional **3/3**, Elegant 1/1 &
  **3/3**.
- **Privacy** — zero external-host network requests during generation; the only "request" is an
  in-memory `data:image/svg+xml` URI (that is *how* html-to-image serialises the DOM — it never
  leaves the device). Confirms Principle II holds.

**Paginator correction (important, folds into T006):** the first attempt broke "when the next
entry top exceeds the page limit," which left the final page unbounded — for Professional
overflow the `.rest` region is 1292px (>1123), so the tail overflowed one page, **clipping
content and under-counting (2 vs 3 pages)**. Fixed algorithm: while the remaining height exceeds
one A4 page, cut at the **largest `.cv-entry` top ≤ (pageStart + 1123px)** (falling back to the
raw limit only when no entry boundary exists there). This keeps every page ≤ A4, never splits a
`.cv-entry`, and reproduces Chrome's page counts. A band-height clamp to the page canvas is kept
as a belt-and-braces guard against clipping.

**Caveat (device):** desktop-Chromium only; the real-Android silent-save, timing (~<5s), and a
side-by-side visual pass remain a human check (T019). Raster fidelity + break parity are proven
on desktop.

**Verdict**: approach unblocked — productionise the validated `computePages` + rasterise/assemble
into `src/lib/pdf/` (T006/T007) with the libraries behind a dynamic `import()`.

## R5. Loading, disabled, and error UX

- **Decision**: `ExportBar` holds local `status: 'idle' | 'working' | 'error'`. On Download
  tap: set `working` (button shows a spinner + disabled → double-tap is a no-op), then
  `await` one animation frame so the spinner paints **before** the synchronous-heavy
  rasterisation starts, then run `generateCvPdf`. On success → `idle`. On throw → `error` with
  an inline message suggesting Print, then back to a tappable state (FR-007/008/009).
- **Rationale**: satisfies the feedback + double-tap-guard + graceful-failure requirements
  with plain component state (Principle V). Yielding a frame first is necessary because the
  rasterise pass blocks the main thread briefly.
- **Alternatives**: a global overlay/spinner (heavier, unnecessary); a web worker for
  generation (rejected — html-to-image needs the DOM/main thread; overkill).

## R6. Bundle size & dependency footprint (Principles V/VI)

- **Decision**: import `html-to-image` and `jspdf` with **dynamic `import()` inside
  `generate.ts`**, so Next.js code-splits them into a chunk fetched only when the user first
  taps Download. First paint, gallery, and form bundles are unchanged. Cap the rasterisation
  DPI at ~2× CSS px (`pixelRatio: 2`, ≈192dpi) to balance crispness against file size and
  low-end-phone memory.
- **Rationale**: confines the constitutional exception to the export path; keeps the app
  fast to load (Principle IV) and static-export-safe (Principle VI — code-splitting is
  build-time, no server).
- **Sizes (approx, gzipped)**: `html-to-image` ~15KB; `jspdf` core ~100–130KB. Only paid on
  the Download interaction. Recorded in Complexity Tracking.
- **Alternatives**: static import (rejected — bloats first load, penalises the common
  create-CV flow that may never download).

## R7. Privacy verification (Principle II, non-negotiable)

- **Decision**: both libraries operate purely on in-memory DOM/canvas; the photo is already a
  local data URL; the output is a local Blob. No network calls are made during generation.
  Verified by inspecting network activity during a download in the spike (SC-005): zero
  requests carrying CV content, zero new external hosts. Libraries are pinned and their
  network behaviour audited (they make none by default).
- **Rationale**: upholds the strongest privacy guarantee — data structurally cannot leave the
  device — while adding the capability.
- **Alternatives**: none acceptable; any server round-trip is out of scope and forbidden.

## Verification method note

Because the PDF is raster, page **text extraction won't work** for headless assertions.
Verification instead checks: (a) page dimensions = A4 (595×842pt), (b) page **count** equals
the print path for the same CV, (c) each page image is non-blank and, for fidelity, is
compared against a screenshot of the corresponding print page (structural/near-pixel
similarity). The filename sanitiser is covered by pure Vitest unit tests.
