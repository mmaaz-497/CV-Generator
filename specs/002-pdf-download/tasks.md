---

description: "Task list for One-Tap PDF Download implementation"
---

# Tasks: One-Tap PDF Download

**Input**: Design documents from `/specs/002-pdf-download/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/pdf-export.md, quickstart.md

**Tests**: Minimal by design (constitution + feature-001 policy): Vitest for the pure
`pdfFilename` sanitiser ONLY. Fidelity/page-break/privacy are validated empirically via a
headless harness (raster PDFs have no text layer to unit-test). No other test infrastructure.

**Organization**: Tasks grouped by user story (spec priority order US1→US3) so each story is
an independently testable increment.

**Governance**: This feature exercises the constitution v1.1.0 scoped export-library exception
(Principle VI) recorded in ADR-0003. Principle II (nothing leaves the device) is non-negotiable
and is gated in T005, T018, and T019.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies on incomplete tasks)
- **[Story]**: US1–US3 (user story phases only)
- All paths relative to repository root

---

## Phase 1: Setup

**Purpose**: Add the export-path dependencies and module scaffolding without touching first paint.

- [x] T001 Install runtime deps for the export path: `npm i html-to-image jspdf`; confirm `npm run build` still produces a static export (`./out`) and that these libs are **not** referenced by any statically-imported module (they enter only via dynamic `import()` in later tasks)
- [x] T002 [P] Create the `src/lib/pdf/` module folder; confirm `vitest.config.ts` test scope (`src/lib/**/*.test.ts`) already covers `src/lib/pdf/` so the sanitiser tests are picked up

**Checkpoint**: Deps installed; `npm run build` green; no change to first-paint bundle yet.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: The pure filename logic + the risk-first spike that must pass before any generation
code or UI is built, plus the production generation module the spike validates.

⚠️ T005 (spike) MUST pass before T006/T007 and any UI task. If the rasteriser cannot reproduce
preview fidelity or the print page breaks, revisit plan.md / research R1 before proceeding.

- [x] T003 [P] Implement `src/lib/pdf/filename.ts` — `pdfFilename(fullName: string): string` per contract 1 and the data-model rules: trim → collapse whitespace → replace every non-`[A-Za-z0-9]` run with `-` → strip leading/trailing `-` → `CV.pdf` when empty/no-alphanumerics → truncate name to ≤60 chars → append `-CV.pdf`
- [x] T004 [P] Unit tests `src/lib/pdf/filename.test.ts` (Vitest): truth table — `"Ahmed Khan"`→`Ahmed-Khan-CV.pdf`, whitespace-collapse, unsafe chars (`"Fatima / Noor"`), `"M. A. Jinnah"`, empty/whitespace-only→`CV.pdf`, no-alphanumeric→`CV.pdf`, >60-char truncation
- [x] T005 **Spike (research R1/R4 — highest risk)**: create a throwaway harness (temporary `src/app/pdf-spike/page.tsx` route that renders a chosen template+dataset in the real `.a4`, driven headless) that dynamically loads `html-to-image` + `jspdf`, rasterises and assembles a real PDF for: **Elegant** (overflow, dark sidebar, accent, with photo), a **long single-column** CV (Classic/Minimal overflow), and **Classic short** (with + without photo). Verify with pdfjs + image inspection: (a) every page is A4; (b) page **count** equals the print path for the same CV; (c) no `.cv-entry` is split across a page; (d) accent tints / dark sidebar / photo render like the print output; (e) **zero** network requests fire during generation (Principle II). Record the outcome + final rasterise/paginate recipe in `specs/002-pdf-download/research.md` (R1/R4), then delete the spike route
- [x] T006 Implement the paginator in `src/lib/pdf/paginate.ts`: given the live `.a4` element, produce an ordered list of A4-page DOM containers per data-model — single page when content fits (~≤1123px @96dpi); sidebar templates reuse the R5 `.page1`(297mm) + packed `.rest`; single-column overflow greedily packs section/`.cv-entry`-atomic blocks into 297mm pages without splitting an entry
- [x] T007 Implement `generateCvPdf(a4El, filename)` in `src/lib/pdf/generate.ts` per contract 2: dynamic `import()` of `html-to-image` + `jspdf`; for each page container from T006 rasterise at `pixelRatio: 2`; assemble an A4 PDF (`addImage` at 210×297mm); `doc.save(filename)` (direct `<a download>`, no dialog); throw on failure with no partial file; make no network calls and write no storage

**Checkpoint**: `npm test` green (filename); spike PASS recorded; `generateCvPdf` callable. No UI yet.

---

## Phase 3: User Story 1 — One-tap save to phone (P1) 🎯 MVP

**Goal**: Tapping a single Download PDF action saves a correctly-named A4 PDF straight to the
phone, matching the preview — no print dialog.

**Independent Test**: On a 360px browser, open a completed CV preview, tap Download PDF once,
and confirm a correctly named A4 PDF downloads that opens and matches the on-screen preview.

- [x] T008 [US1] Create `src/components/preview/DownloadPdfButton.tsx`: a ≥44px "Download PDF" button that, on tap, calls `generateCvPdf(a4El, pdfFilename(cv.personalInfo.fullName))`; receives the live `.a4` element via prop; disables itself during the in-flight `await` (basic guard; full spinner/error UX arrives in US3); marked `.no-print`
- [x] T009 [US1] Wire into `src/screens/PreviewScreen.tsx`: pass the existing `a4Ref` element to `DownloadPdfButton` and place it in the preview header alongside the current print action (the existing `PdfButton` stays for now; the two-action consolidation is US2) (FR-002)
- [x] T010 [US1] **CHECKPOINT — MVP path proof**: at 360px in the real static build, tap Download PDF once → a correctly-named A4 PDF saves with no dialog and matches the preview for Classic + one accent template; verify filename `Ahmed-Khan-CV.pdf` and the `CV.pdf` fallback for a blank name (FR-002/FR-003). Fix before proceeding

**Checkpoint**: One-tap download works end-to-end in the real build — the MVP deliverable.

---

## Phase 4: User Story 2 — Print straight to a printer (P2)

**Goal**: Two clearly-labelled, distinct actions — Download PDF and Print — with Print keeping
today's device-print behaviour.

**Independent Test**: On the preview screen, both actions are clearly labelled; tapping Print
opens the device print flow showing the same A4 CV, unchanged from today.

- [ ] T011 [US2] Rename `src/components/preview/PdfButton.tsx` → `src/components/preview/PrintButton.tsx` (label "Print", still `window.print()`); update its import in `PreviewScreen.tsx`
- [ ] T012 [US2] Create `src/components/preview/ExportBar.tsx` composing `DownloadPdfButton` + `PrintButton` as two clearly-labelled, distinct ≥44px actions (both `.no-print`); replace the separate buttons in `src/screens/PreviewScreen.tsx` with `<ExportBar />`, passing the `.a4` element ref through (FR-001/FR-010)
- [ ] T013 [US2] Verify at 360px: Download PDF and Print are both labelled and distinguishable; Print opens the device print flow with the A4 CV unchanged; neither action (nor any control) appears in the downloaded PDF or printed output (FR-011)

**Checkpoint**: Two-action export bar complete; Print preserved as a separate path.

---

## Phase 5: User Story 3 — Clear feedback while saving, graceful failure (P3)

**Goal**: A visible loading state with a double-tap guard, and a graceful failure that points to
Print.

**Independent Test**: Trigger a download and confirm a spinner/disabled state during preparation;
simulate a failure and confirm an inline error suggesting Print appears and the button recovers.

- [ ] T014 [US3] Add the export state machine (`idle | working | error`) to `ExportBar`/`DownloadPdfButton` (data-model): on Download tap set `working` (spinner + disabled), `await` one animation frame so the spinner paints before the rasterise pass, run `generateCvPdf`, then `idle` on success; a second tap while `working` is a no-op (FR-007/FR-008)
- [ ] T015 [US3] Add failure handling: on `generateCvPdf` throw, transition to `error`, show an inline message that names Print as the fallback, and restore the button to a tappable state; Print stays always-enabled and independent of this state (FR-009/FR-010)
- [ ] T016 [US3] Verify: spinner shows during generation and a second tap does nothing; a forced failure shows the inline error naming Print, Print still produces the CV, and the Download button recovers to tappable (SC-008)

**Checkpoint**: All three user stories complete — one-tap download with feedback and a reliable fallback.

---

## Phase 6: Polish & Constitution Gates

**Purpose**: Mobile, privacy, fidelity, and bundle gates for the new export path.

- [ ] T017 [P] 360px audit of the preview export actions in all states (idle/working/error): both actions ≥44px, no horizontal scroll, spinner/error text don't clip or overlap (constitution I)
- [ ] T018 [P] Privacy + packaging gate (constitution II / v1.1.0 exception / SC-005): DevTools Network shows **zero** requests carrying CV text or the photo during a download; Application tab shows no new storage; confirm from the build output that `html-to-image`/`jspdf` are in a **lazy chunk** loaded only on Download, not in the first-paint bundle
- [ ] T019 [P] Fidelity + print-parity gate (SC-003/SC-004): all 5 templates × (with photo, without photo) × (short, 2-page) — downloaded PDF is A4, visually matches preview, page count + breaks equal the Print path, no split entries. Desktop-Chromium headless matrix; **residual**: a human visual pass on real Android Chrome (device silent-save + timing ~<5s + fidelity)
- [ ] T020 Final gate: `npm run build` static export succeeds; `npm test` (filename) green; walk `specs/002-pdf-download/quickstart.md` steps 1–8 end-to-end; record the export-chunk size and confirm first-paint bundle is unchanged from before this feature

---

## Dependencies

```text
Phase 1 (Setup) ──► Phase 2 (Foundational) ──► Phase 3 (US1/MVP) ──► Phase 4 (US2) ──► Phase 5 (US3)
                                                                              all ──► Phase 6 (Polish)
```

- **T005 (spike) gates T006, T007, and every UI task.** Spike failure = stop and revise
  plan.md / research R1 (rasteriser or approach) before writing generation code.
- T003/T004 (filename) block T008 (button uses `pdfFilename`).
- T006 (paginator) blocks T007 (generate uses it); T007 blocks T008 (button calls it).
- US2 (T011–T013) depends on US1's `DownloadPdfButton` existing (ExportBar composes it).
- US3 (T014–T016) enhances the US2 `ExportBar` — sequential after US2.
- Polish (Phase 6) runs after US3; T017 ∥ T018 ∥ T019 (different concerns), T020 last.

## Parallel Execution Examples

- **Phase 2**: T003 ∥ T004 impl-then-test (test after impl), and T005 (spike) runs alongside the
  filename work (independent files/concerns).
- **Polish**: T017 ∥ T018 ∥ T019.

## Implementation Strategy

**MVP = Phase 1 + Phase 2 + Phase 3 (US1).** At T010 the shopkeeper can already save a CV as a
PDF in one tap. US2 restores Print as a clear second action; US3 adds the loading/failure polish.
Phase 6 is the constitution gate (privacy + fidelity + bundle) before calling it done.

**Total**: 20 tasks — Setup 2 · Foundational 5 · US1 3 · US2 3 · US3 3 · Polish 4.
