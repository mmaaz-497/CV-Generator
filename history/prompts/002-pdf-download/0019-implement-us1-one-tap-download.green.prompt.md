---
id: 0019
title: Implement US1 one-tap download
stage: green
date: 2026-07-13
surface: agent
model: claude-opus-4-8
feature: 002-pdf-download
branch: 002-pdf-download
user: Muhammad Maaz
command: /sp.implement
labels: ["implement", "pdf-download", "us1", "mvp", "download"]
links:
  spec: specs/002-pdf-download/spec.md
  ticket: null
  adr: history/adr/0003-client-side-pdf-generation.md
  pr: null
files:
  - src/components/preview/DownloadPdfButton.tsx (new — US1)
  - src/lib/pdf/generate.ts (offscreen-clone render so the scaled preview doesn't shrink output)
  - src/screens/PreviewScreen.tsx (DownloadPdfButton wired; old print PdfButton removed per user)
  - specs/002-pdf-download/tasks.md (T008–T010 marked done)
tests:
  - "npm run build → static export + TypeScript pass; npm test → 34/34"
  - "T010 MVP headless @360px (real out/ build, actual download captured): 6/6 — download begins with NO dialog; filename Ahmed-Khan-CV.pdf and CV.pdf fallback correct; PDF is true A4 (offscreen clone un-scales the 360px-fit preview)"
---

## Prompt

Implement US1, tasks T008 through T010. (Mid-task the user reported two "Download PDF" buttons at the top and asked to remove the previous one.)

## Response snapshot

Built the one-tap download MVP:

- **DownloadPdfButton** (T008): ≥44px `.no-print` button; on tap calls `generateCvPdf(getA4(), pdfFilename(cv.personalInfo.fullName))`, disabling itself during the await (full spinner/error UX is US3). Statically imports `generateCvPdf`, whose heavy libs stay behind a dynamic `import()` — so first paint is untouched.
- **PreviewScreen wiring** (T009): passes the live `.a4` element via `getA4={() => a4Ref.current}`.
- **generate.ts correctness fix**: the real preview's `.a4` carries an on-screen `transform: scale(...)` (fit-to-360px) that the spike route lacked — it would shrink the raster and skew `computePages`. Fixed by rendering from an **off-screen clone at natural A4 size** (transform none, fixed off-screen), so output is full A4 and the visible preview never flickers.
- **Duplicate-button fix (user request)**: the header briefly showed two "Download PDF" buttons — the new one and the legacy `PdfButton` (which is actually the print path, still mislabelled "Download PDF"). Per the user, removed `PdfButton` from the preview header now; Print returns as a properly-labelled action in US2 (T011/ExportBar).

**T010 MVP checkpoint — 6/6** by capturing the actual generated Blob in headless (intercepting `URL.createObjectURL`, robust vs headless download-to-disk plumbing): the download **begins with no dialog**, filename is `Ahmed-Khan-CV.pdf` (and `CV.pdf` for a name that sanitises to empty, which still passes the name+phone preview gate), and the PDF is **true A4** — proving the offscreen clone produces full-size output from the scaled 360px preview.

## Outcome

- ✅ Impact: The MVP deliverable works — a shopkeeper taps once and gets a correctly-named A4 PDF, no print dialog. Fidelity was already proven in the T005 spike.
- 🧪 Tests: 34/34 unit; build+typecheck OK; T010 6/6 with the real download captured.
- 📁 Files: 1 new component + generate.ts clone fix + PreviewScreen wiring.
- 🔁 Next prompts: US2 (T011–T013) — rename PdfButton→PrintButton, ExportBar with two labelled actions; then US3 (spinner/error) and Phase 6 gates.
- 🧠 Reflection: The scale-transform trap was the real US1 risk — the spike route had no transform, so it wouldn't have surfaced it; catching it here (true-A4 assertion on the actual downloaded bytes) prevented shipping shrunken PDFs. The user's duplicate-button catch also confirmed the interim two-button state was worth collapsing early.

## Evaluation notes (flywheel)

- Failure modes observed: (1) on-screen `transform: scale` would shrink the capture — fixed via offscreen clone. (2) headless blob-download did not reliably reach disk (Page.setDownloadBehavior) — switched the harness to intercept `URL.createObjectURL` for the true bytes; also used Browser.downloadWillBegin to assert "no dialog + suggested filename".
- Graders run and results (PASS/FAIL): PASS — 34 unit + T010 6/6 (dialog-free download, filenames, true A4).
- Prompt variant (if applicable): n/a
- Next experiment (smallest change to try): in US2, keep the ExportBar labels unambiguous ("Download PDF" vs "Print") and re-run the download harness to ensure the selector still targets the right button after the rename.
