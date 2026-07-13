---
id: 0002
title: Specify CV Generator feature
stage: spec
date: 2026-07-11
surface: agent
model: claude-fable-5
feature: 001-cv-generator
branch: 001-cv-generator
user: Muhammad Maaz
command: /sp.specify
labels: ["spec", "cv-generator", "mobile-first", "templates", "pdf"]
links:
  spec: specs/001-cv-generator/spec.md
  ticket: null
  adr: null
  pr: null
files:
  - specs/001-cv-generator/spec.md
  - specs/001-cv-generator/checklists/requirements.md
tests:
  - none (specification artifact; checklist validation run manually — all items pass)
---

## Prompt

Build a CV Generator web app for a print/composing shop. A shopkeeper uses it on a mobile phone to create professional CVs for walk-in customers, then downloads a PDF to print or send via WhatsApp.

## Users
- Primary: shopkeeper (non-technical, uses phone all day, needs speed)
- The customer dictates details verbally; the shopkeeper types them in.

## User Journey
1. App opens on a template gallery screen showing 5 CV templates as visual thumbnail previews. Shopkeeper taps one to select it.
2. App shows a single scrollable form page with all sections visible (collapsible cards, one after another). No wizard, no multi-step flow.
3. Shopkeeper fills in whatever sections the customer needs and skips the rest entirely.
4. Shopkeeper taps a "Preview" button to see the full CV rendered in the chosen template.
5. From the preview screen, shopkeeper can still switch templates, change accent color, and adjust font size — the entered data stays intact and re-renders instantly in the new look.
6. Shopkeeper taps "Download PDF" which triggers the browser print dialog for saving as PDF (A4).
7. For the next customer, a "New CV" button (with confirmation) clears everything.

## Form Sections (in default order)
1. Personal Info: full name (required), phone (required), email, address, city, date of birth, CNIC number, marital status, nationality, religion — all optional except name and phone.
2. Photo: optional upload from gallery or camera. If no photo, templates adapt their layout so no empty photo box appears.
3. Career Objective: single free-text field.
4. Education: repeatable entries — degree/certificate title, institute, year(s), grade/division (all fields optional within an entry). Add/remove entries.
5. Work Experience: repeatable entries — job title, company, duration, short description. Add/remove entries.
6. Skills: list of short skill items, added one by one as tags/chips, removable.
7. Languages: repeatable entries — language name + proficiency level.
8. Certifications/Courses: repeatable entries — title, institute, year.
9. References: either a "References available on request" toggle OR repeatable named reference entries (name, designation, contact).

## Section Flexibility (critical feature)
- Every section except Personal Info can be skipped. A skipped/empty section must NOT appear on the CV at all — no empty headings, no blank gaps.
- The shopkeeper can rename any section's heading (e.g., change "Career Objective" to "Profile Summary") via an edit control on the section.
- The shopkeeper can reorder sections (move up/down controls on each section card). The CV output follows this custom order.

## The 5 Templates (mixed styles)
1. Classic: black & white, centered header, traditional layout for government jobs.
2. Professional: left sidebar (photo, contact, skills) with main column (objective, education, experience), subtle single accent color.
3. Modern: colored header band with name and photo, clean two-column body.
4. Elegant: dark full-height sidebar, best suited when a photo is provided.
5. Minimal: ultra-simple single column, thin dividers, fits maximum text.
- All templates render the same data; switching templates never loses or reflows data incorrectly.
- Each template supports an accent color chosen from a small palette (5–6 predefined colors) and three font size levels (small/medium/large).
- Templates must handle both with-photo and without-photo states gracefully.

## Interactivity & Feel
- The UI should feel snappy and pleasant: smooth expand/collapse of section cards, instant visual feedback on every tap, subtle transitions when switching templates or colors in preview.
- Clear visual states: filled sections show a summary/checkmark on their collapsed card so the shopkeeper sees at a glance what's done.
- Sticky bottom action bar on the form page: "Preview" button always reachable with a thumb.

## Output Requirements
- CV content is English only.
- Final output: A4 PDF via browser print dialog, matching the on-screen preview exactly.
- One page preferred; if content overflows, it flows to page 2 cleanly without cutting a section in half mid-entry.

## Out of Scope
- Saving/loading customer data, accounts, history, payments, multi-language CVs, AI text generation, cloud storage.

## Success Criteria
- A CV with name, phone, 2 education entries, and 3 skills can be created and previewed in under 3 minutes on a 360px phone.
- Skipping every optional section still yields a clean, professional one-page CV.
- Renaming a section heading and reordering sections is reflected exactly in the PDF.
- Switching between all 5 templates in preview keeps all data intact.

## Response snapshot

Created feature branch `001-cv-generator` and wrote `specs/001-cv-generator/spec.md`. Spec contains 5 prioritized user stories (P1 create & download CV; P2 skip/rename/reorder sections; P3 restyle in preview without data loss; P4 photo handling; P5 New CV reset), 8 edge cases, 28 functional requirements grouped by area (gallery, form, section flexibility, templates & styling, output, lifecycle & privacy, look & feel), 5 key entities (CV Document, Section, Entry, Template, Style Selection), 8 measurable success criteria, documented assumptions (Personal Info fixed as header, sidebar region ordering, references toggle precedence, no photo editing), and out-of-scope list. Quality checklist at `specs/001-cv-generator/checklists/requirements.md` — all items pass, zero [NEEDS CLARIFICATION] markers (description was complete; remaining ambiguities resolved via documented Assumptions). The create-new-feature.ps1 script partially failed (PS 5.1 Join-Path multi-arg incompatibility) after branch creation; missing directories created manually.

## Outcome

- ✅ Impact: Feature spec ready for `/sp.clarify` or `/sp.plan`; branch 001-cv-generator checked out.
- 🧪 Tests: Spec quality checklist — 16/16 items pass, first iteration.
- 📁 Files: specs/001-cv-generator/spec.md; specs/001-cv-generator/checklists/requirements.md
- 🔁 Next prompts: /sp.plan to produce the implementation plan (or /sp.clarify if further refinement wanted).
- 🧠 Reflection: Exceptionally complete brief; informed defaults documented in Assumptions instead of clarification markers.

## Evaluation notes (flywheel)

- Failure modes observed: create-new-feature.ps1 crashed on PowerShell 5.1 (`Join-Path` with multiple child paths at line 267) after branch checkout; recovered by creating `history/prompts/001-cv-generator/` and `specs/001-cv-generator/checklists/` manually.
- Graders run and results (PASS/FAIL): PASS — checklist 16/16.
- Prompt variant (if applicable): n/a
- Next experiment (smallest change to try): Fix create-new-feature.ps1 line 267 for PS 5.1 compatibility (`Join-Path (Join-Path $repoRoot 'history') 'prompts'`).
