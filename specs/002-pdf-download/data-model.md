# Data Model: One-Tap PDF Download

**Feature**: 002-pdf-download | **Date**: 2026-07-13

This feature introduces **no persistent entities and no additions to `CVDocument`**. It reads
the existing CV state and the rendered preview DOM, and produces a transient file. The
"model" here is the export interaction's state machine and the filename derivation rules.

## Transient values (not stored)

| Value | Type | Meaning | Lifetime |
|-------|------|---------|----------|
| Export status | `'idle' \| 'working' \| 'error'` | Drives the Download button's spinner/disabled/error UI | Local `useState` in `ExportBar`; reset per interaction |
| Download filename | `string` | Safe `"<Name>-CV.pdf"` / `"CV.pdf"` derived from `cv.personalInfo.fullName` | Computed at generation time; not stored |
| Generated PDF | `Blob` (in memory) | A4 raster PDF handed to the browser's download | Created, saved as the user's file, then released; never persisted or transmitted |

## Export state machine (`ExportBar`)

```text
        tap Download
 idle ─────────────────► working ──success──► idle
  ▲                         │
  │                         └──failure──► error ──(auto, tappable again)──► idle on next tap
  └──────────────────────────────────────────────┘

Invariants:
- In `working`: Download button is disabled → a second tap is a no-op (FR-007).
- `success`: file has been saved; button returns to normal (FR-008).
- `error`: inline message shown suggesting Print; button tappable for retry (FR-009).
- Print button is always enabled and independent of this state machine (FR-010).
```

## Filename derivation rules (`pdfFilename(fullName)`)

| Input `fullName` | Output |
|------------------|--------|
| `"Ahmed Khan"` | `Ahmed-Khan-CV.pdf` |
| `"  Ayesha   Noor  "` | `Ayesha-Noor-CV.pdf` |
| `"Fatima / Noor"` | `Fatima-Noor-CV.pdf` |
| `"M. A. Jinnah"` | `M-A-Jinnah-CV.pdf` |
| `""` / `"   "` | `CV.pdf` |
| `"!!!"` (no alphanumerics) | `CV.pdf` |
| very long name (>60 chars) | truncated name + `-CV.pdf` |

Rules: trim → collapse whitespace → replace every non-`[A-Za-z0-9]` run with a single `-` →
strip leading/trailing `-` → if empty, `CV.pdf` → truncate name to ≤60 chars → append
`-CV.pdf`. Pure, deterministic, unit-tested.

## Inputs consumed (read-only)

- `cv.personalInfo.fullName` — source of the filename.
- The rendered `.a4` preview element (the active template with current data, accent, font
  size, photo) — source DOM for rasterisation. The download reflects exactly what is on
  screen at tap time (template/accent/font are already applied to that DOM).

## Page-composition model (paginator)

- A **page** is a DOM container sized to A4 content (≈794×1123px @96dpi, i.e. 210×297mm).
- The active template DOM is decomposed into pages by the rules in research R4:
  one page when it fits; sidebar `.page1` + packed `.rest` pages for overflowing sidebar
  templates; entry-atomic greedy packing for overflowing single-column templates.
- Each page container maps 1:1 to one A4 page image in the output PDF. A `.cv-entry` is
  **atomic** — never divided across pages (FR-005).
