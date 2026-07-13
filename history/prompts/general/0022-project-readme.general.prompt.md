---
id: 0022
title: Project README for GitHub
stage: general
date: 2026-07-13
surface: agent
model: claude-opus-4-8
feature: none
branch: 002-pdf-download
user: Muhammad Maaz
command: (direct request)
labels: ["documentation", "readme", "onboarding"]
links:
  spec: null
  ticket: null
  adr: null
  pr: null
files:
 - README.md (created)
 - history/prompts/general/0022-project-readme.general.prompt.md (created)
tests:
 - none (documentation-only change; no runtime surface)
---

## Prompt

Make a README file for this project so that anyone visiting the GitHub repository can easily understand it. Keep it well-structured, clean, and professionally organized.

## Response snapshot

Inspected `package.json`, `next.config.ts`, `.specify/memory/constitution.md`, `src/lib/cv-types.ts`,
`src/lib/constants.ts`, `src/templates/registry.ts`, `src/app/page.tsx`, `src/screens/PreviewScreen.tsx`,
and `specs/001-cv-generator/spec.md` to ground every claim in the actual codebase, then authored
`README.md` with these sections:

- Title + one-paragraph pitch (mobile-first, 100% client-side, A4 PDF, data never leaves the device)
- **Why it exists** — the print-shop use case and the privacy rationale
- **Features** — 5 templates, gallery→form→preview, 7 optional/renameable/reorderable sections,
  style controls, photo pipeline, A4 export + print fallback, leave-site guard, 360px/44px
- **Tech stack** table (Next.js 16 static export, React 19, TS 5, Tailwind v4, useReducer+Context,
  dynamically-imported `html-to-image`+`jspdf`, Vitest, Vercel free tier)
- **Getting started** — prerequisites, clone/install/dev, and a command table
- **Project structure** — annotated tree plus short "how state works" / "how the PDF is made" notes
- **Design constraints** — the six constitution principles restated as hard constraints, linked
- **Testing** — the deliberate minimal-Vitest + empirical-headless-browser policy
- **Status** — feature 001 complete, feature 002 in progress
- **Contributing** (spec-driven development) and **License** (unlicensed; add one before publishing)

No git remote is configured, so the clone URL is left as a `<your-fork-url>` placeholder.

## Outcome

- ✅ Impact: The repo now has a professional front door that explains the product, the privacy
  guarantee, the fixed stack, and the SDD workflow without a reader needing to open `specs/`.
- 🧪 Tests: None run — documentation-only change with no runtime surface.
- 📁 Files: `README.md` (new), this PHR (new).
- 🔁 Next prompts: Finish feature 002 (US2 `ExportBar`, US3 spinner/guard/error fallback, Phase 6
  gates); add a LICENSE file; set a git remote and replace the clone-URL placeholder.
- 🧠 Reflection: Grounding the README in the constitution rather than a generic Next.js template is
  what makes it useful — the zero-persistence guarantee and the fixed stack are the two things a
  visitor most needs to understand before touching the code.

## Evaluation notes (flywheel)

- Failure modes observed: none. Main risk avoided was overstating feature 002 as done — status
  table reflects it as in progress, matching `specs/002-pdf-download/tasks.md`.
- Graders run and results (PASS/FAIL): n/a
- Prompt variant (if applicable): n/a
- Next experiment (smallest change to try): add a screenshot / GIF of the gallery→preview flow once
  the export bar lands, since a visual would carry the mobile-first claim faster than prose.
