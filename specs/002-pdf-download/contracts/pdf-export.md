# Contracts: PDF Export

**Feature**: 002-pdf-download | **Date**: 2026-07-13

These are the internal module/component contracts for the download path. There are **no
network/API contracts** — everything is on-device (FR-006).

## Contract 1: `pdfFilename(fullName)` (pure)

```ts
function pdfFilename(fullName: string): string;
```

- Returns a filesystem-safe filename ending in `.pdf`.
- MUST return `"CV.pdf"` when `fullName` is empty, whitespace-only, or contains no
  alphanumeric characters.
- MUST return `"<sanitised-name>-CV.pdf"` otherwise, where the sanitised name matches
  `^[A-Za-z0-9]+(-[A-Za-z0-9]+)*$` and is ≤60 characters.
- MUST be pure and deterministic (no side effects) → unit-tested (`filename.test.ts`).

## Contract 2: `generateCvPdf(a4El, filename)`

```ts
function generateCvPdf(a4El: HTMLElement, filename: string): Promise<void>;
```

- Dynamically imports `html-to-image` and `jspdf` (code-split; loaded on first call only).
- Composes A4 pages from `a4El` per the paginator rules (data-model), rasterises each page
  with the browser's own renderer, assembles them into an A4 PDF, and saves it as `filename`
  via a direct `<a download>` (no print dialog).
- Page size MUST be A4 (210×297mm). Multi-page output MUST match the print path's page count
  and breaks; a single `.cv-entry` MUST NOT be split across pages.
- MUST make **no network requests** and MUST NOT write to any storage. The photo (a local
  data URL) and all text stay on-device.
- MUST reject (throw) on failure so the caller can show the inline error + Print fallback;
  MUST NOT leave a partial file.
- The active template/accent/font/photo already applied to `a4El` MUST be reflected verbatim
  (the download equals the current preview).

## Contract 3: `ExportBar` behaviour (component)

- Renders exactly two labelled actions: **Download PDF** and **Print**, both `.no-print`,
  both ≥44px touch targets, usable at 360px.
- Download tap: transitions `idle → working` (spinner + disabled), yields one animation frame
  so the spinner paints, then calls `generateCvPdf(a4El, pdfFilename(cv.personalInfo.fullName))`.
  - success → `idle`;
  - failure → `error` with an inline message that names Print as the fallback, then tappable
    again.
- A second tap while `working` MUST be a no-op (disabled).
- **Print** calls the existing `window.print()` path and is always enabled, independent of the
  Download state (FR-010). Its output is unchanged from today.
- Neither the buttons, the spinner, nor the error text may appear in the downloaded PDF or the
  printed output (they are `.no-print`, and the paginator rasterises only the `.a4` content).

## Contract 4: privacy invariant (constitution II, non-negotiable)

- Across the entire download interaction: **zero** outbound network requests carrying CV
  content or the photo; **zero** new persistent storage. Verified by network/Application
  inspection during a download (SC-005).
