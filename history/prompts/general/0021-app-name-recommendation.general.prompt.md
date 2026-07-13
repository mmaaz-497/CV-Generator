---
id: 0021
title: App Name Recommendation
stage: general
date: 2026-07-13
surface: agent
model: claude-opus-4-8
feature: none
branch: 002-pdf-download
user: Muhammad Maaz
command: (freeform)
labels: ["naming", "branding", "product"]
links:
  spec: specs/001-cv-generator/spec.md
  ticket: null
  adr: null
  pr: null
files:
 - (none — advisory only)
tests:
 - (none)
---

## Prompt

Based on the project, what do you think I should name this app? Please analyze the project carefully and think deeply before suggesting a name.

## Response snapshot

Analyzed `.specify/memory/constitution.md`, `specs/001-cv-generator/spec.md`, `src/app/layout.tsx`,
`src/screens/GalleryScreen.tsx`, and `src/lib/pdf/filename.ts` to ground the naming in the actual
product rather than the category.

Four findings that constrain the name:
1. **The user is an operator, not a jobseeker.** The shopkeeper is the user; the walk-in customer is
   the beneficiary. This is a counter appliance (closer to a POS) than a consumer résumé SaaS.
2. **The output is unbranded.** `pdfFilename()` produces `Ahmed-Khan-CV.pdf` — the app name never
   appears on the artifact. There is no marketing/SEO surface, so the name serves the operator only:
   short, sayable aloud in a mixed Urdu/English shop, typeable in a phone URL bar, fits 360px.
3. **The market is Pakistani.** CNIC, marital status / religion / nationality fields, WhatsApp
   delivery, "composing shop" — these shops advertise themselves as *Composing & Printing*.
   "Compose" is the trade's own word for what this app does.
4. **Zero persistence is structural identity.** Every customer is a clean slate by design.

**Recommended: Compose** (`Compose CV` in the title bar). It is the shop's own vocabulary, one word,
unmistakable at the counter, and it describes the act rather than the category.

Alternates offered, each on a distinct strategy: **Kaghaz** (locally rooted, ownable, distinctive),
**CV Counter** (names the surface; literal and honest), **Clean Slate / FreshCV** (leans on the
zero-persistence guarantee — a sellable promise to the customer, but a virtue the operator does not
feel). Advised against jobseeker-SaaS-style names (Resumely, CVify) as audience-mismatched, and
against `Dukaan CV` (collides with the existing Dukaan.app brand).

Noted that domain and trademark availability could not be verified from this environment.

## Outcome

- ✅ Impact: Naming recommendation delivered with rationale; no code changed. If a name is chosen, the
  touch points are `metadata.title` in `src/app/layout.tsx:12` and the `<h1>` in
  `src/screens/GalleryScreen.tsx:19`.
- 🧪 Tests: none run (advisory response, no code change)
- 📁 Files: none modified
- 🔁 Next prompts: pick a name → apply to layout metadata + gallery header; optionally check domain
  availability.
- 🧠 Reflection: Reading `filename.ts` was the decisive step — discovering the PDF is unbranded
  reframed the problem from "market a CV product" to "name an operator's tool", which changed the
  recommendation.

## Evaluation notes (flywheel)

- Failure modes observed: none
- Graders run and results (PASS/FAIL): n/a
- Prompt variant (if applicable): n/a
- Next experiment (smallest change to try): n/a
