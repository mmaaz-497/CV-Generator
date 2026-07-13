---
id: 0014
title: One-tap PDF download plan
stage: plan
date: 2026-07-13
surface: agent
model: claude-opus-4-8
feature: 002-pdf-download
branch: 002-pdf-download
user: Muhammad Maaz
command: /sp.plan
labels: ["plan", "pdf-download", "client-side-pdf", "constitution-exception", "print-fidelity"]
links:
  spec: specs/002-pdf-download/spec.md
  ticket: null
  adr: null
  pr: null
files:
  - specs/002-pdf-download/plan.md
  - specs/002-pdf-download/research.md
  - specs/002-pdf-download/data-model.md
  - specs/002-pdf-download/contracts/pdf-export.md
  - specs/002-pdf-download/quickstart.md
  - CLAUDE.md (agent context updated)
tests:
  - "Constitution Check: PASS with two documented deviations (V Simplicity, VI Tech Stack) → Complexity Tracking + amendment/ADR action"
---

## Prompt

/sp.plan (no additional arguments) — generate the implementation plan for the one-tap PDF download spec.

## Response snapshot

Planned a client-side PDF download that reuses the existing template DOM (no template rewrite, FR-013) and reproduces the print path's A4 page breaks.

**Approach (research R1)**: dynamically-imported `html-to-image` (SVG-foreignObject rasterisation → browser-native rendering, so `color-mix()` accents + fonts match the preview) + `jspdf` (assemble A4 page images → Blob → silent `<a download>` save, no print dialog). Rejected html2canvas (no `color-mix()` support → wrong accents; tall-canvas slicing splits entries), jsPDF.html (same), pdf-lib redraw (violates FR-013), Paged.js (heavier, diverges from Chrome). Tradeoff accepted: raster PDF (not selectable text) — fine for a shareable A4 image; DPI capped at 2× to bound size/memory.

**Pagination (R4)**: small custom paginator — one page when it fits; sidebar templates reuse the R5 `.page1`(297mm) + packed `.rest` structure; single-column overflow greedily packs entry-atomic blocks per 297mm page. Never splits a `.cv-entry` (FR-005/SC-004). Highest risk → early spike on Elegant overflow + a long single-column CV, mirroring feature 001's R5 print spike.

**Other decisions**: filename sanitiser `pdfFilename()` (pure, unit-tested — `<Name>-CV.pdf` / `CV.pdf` fallback); `ExportBar` state machine idle→working→(idle|error) with spinner, double-tap guard, inline error → Print fallback (R5); dynamic `import()` code-splits both libs out of first paint (R6); privacy upheld — on-device only, verified by network inspection (R7).

**Constitution Check**: PASS with two documented deviations — V (Simplicity) and VI (Fixed Tech Stack) — because two runtime libraries are added. Logged in Complexity Tracking with mitigations (dynamic import = export path only; templates stay source of truth; strictly on-device). Requires a constitution amendment (MINOR) + ADR before implementation; II (nothing transmitted) reaffirmed non-negotiable.

Artifacts: plan.md, research.md (R1–R7 + raster-verification note), data-model.md (export state machine + filename rules; no persistent entities), contracts/pdf-export.md (4 contracts, no network APIs), quickstart.md. CLAUDE.md agent context updated by the script.

## Outcome

- ✅ Impact: Implementation-ready plan that adds the capability while keeping templates untouched and privacy intact; the dependency exception is bounded and documented.
- 🧪 Tests: Constitution gate PASS-with-deviations; verification strategy defined (pure unit test for filename; headless A4/page-count/image-fidelity checks since raster PDFs have no text layer).
- 📁 Files: 5 spec artifacts + CLAUDE.md.
- 🔁 Next prompts: `/sp.adr client-side-pdf-generation` (+ constitution amendment), then `/sp.tasks`. Tasks must front-load the R1/R4 spike before building the UI.
- 🧠 Reflection: The fidelity trap is `color-mix()` — it silently eliminates the popular html2canvas recipe, which is why native-rendering `html-to-image` is the load-bearing choice. Reusing the R5 sidebar structure means the hardest pagination case is already solved by feature 001.

## Evaluation notes (flywheel)

- Failure modes observed: none blocking. `update-agent-context.ps1` succeeded this run (unlike `create-new-feature.ps1` earlier).
- Graders run and results (PASS/FAIL): PASS — plan has explicit Constitution Check, Complexity Tracking with alternatives, and a risk table with a first spike.
- Prompt variant (if applicable): n/a
- Next experiment (smallest change to try): in `/sp.tasks`, make T-spike generate a real PDF for Elegant-overflow and diff its page images against the print-path screenshots before any UI task — fail fast on fidelity/breaks.
