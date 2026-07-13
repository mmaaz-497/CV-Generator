---
id: 0011
title: Implement photo and reset
stage: green
date: 2026-07-12
surface: agent
model: claude-opus-4-8
feature: 001-cv-generator
branch: 001-cv-generator
user: Muhammad Maaz
command: /sp.implement
labels: ["implement", "cv-generator", "us4", "us5", "photo", "reset", "privacy"]
links:
  spec: specs/001-cv-generator/spec.md
  ticket: null
  adr: history/adr/0001-client-only-application-architecture.md
  pr: null
files:
  - src/lib/photo.ts (new — processPhoto canvas downscale, T038)
  - src/components/form/PhotoSection.tsx (new — file input, preview, remove, inline error, T039)
  - src/components/NewCvButton.tsx (new — confirmed RESET, T041)
  - src/screens/FormScreen.tsx (PhotoSection replaces placeholder; NewCvButton in header)
  - src/screens/PreviewScreen.tsx (NewCvButton in header)
  - src/templates/MinimalTemplate.tsx (added photo spot in header — T040 gap)
  - specs/001-cv-generator/tasks.md (T038–T042 marked done)
tests:
  - "npm run build → static export + TypeScript pass"
  - "npm test → 25/25 pass (lib logic untouched)"
  - "US4/US5 headless harness @360px (real out/ build, real image upload): 18/18 — processPhoto yields JPEG data URL <200KB; photo renders in all 5 templates; photo=null leaves NO empty frame in any template; 0 h-overflow with photo; New CV decline = no-op; confirm → gallery + name/phone/photo cleared + default section order restored"
---

## Prompt

Implement Phase 6 and Phase 7 (US4 and US5), tasks T038 through T042.

## Response snapshot

**US4 (T038–T040):** `processPhoto(file)` decodes via `Image`+`createObjectURL`, downscales on a canvas so the longest side ≤600px, returns `toDataURL('image/jpeg', 0.85)`; rejects on non-image or decode failure. All in-browser — the photo never leaves the device (constitution II). `PhotoSection` replaces the form's Photo placeholder: hidden `<input type="file" accept="image/*">` (Android offers camera/gallery), 80px thumbnail, Add/Change/Remove, "Loading…" state, and inline "Couldn't load photo, try another." on failure (keeps prior photo). Dispatches SET_PHOTO. `PhotoFrame` already returns null when photo is null, so no-photo layouts stay clean.

**US5 (T041–T042):** `NewCvButton` (in both form and preview headers, `.no-print`) opens a confirm dialog; "Start new" dispatches RESET (fresh defaults + gallery), Cancel is a pure no-op. Because the `beforeunload` guard in cv-context is armed only while `hasAnyData(cv)`, RESET (empty state) disarms it automatically.

Verified empirically at 360px on the real static build, uploading a real PNG through the file input: 18/18 checks. Found + fixed one gap — Minimal had no photo spot (built text-only); added a compact 22×26mm photo to its header (gracefully absent when no photo). All 5 templates now render the photo and, when photo=null, render no empty frame.

## Outcome

- ✅ Impact: US4 + US5 complete → all 5 user stories done. Photo capture (privacy-preserving) + one-tap confirmed reset for the next customer.
- 🧪 Tests: build+typecheck OK; 25/25 unit; 18/18 US4/US5 preview assertions.
- 📁 Files: 3 new (photo.ts, PhotoSection, NewCvButton) + Minimal photo spot + 2 screen headers.
- 🔁 Next prompts: Phase 8 constitution gates (T043–T048): 360px audit, real-Android A4 print (with/without photo, short/overflow), zero-persistence + leave-site guard, feel/perf passes, final quickstart run.
- 🧠 Reflection: Harness caught the Minimal no-photo omission — the "each template's designated spot" clause in T040 is exactly the kind of per-template gap unit tests can't see. Uploading a real image through the actual input (not a mocked data URL) exercised the true processPhoto → canvas → SET_PHOTO path.

## Evaluation notes (flywheel)

- Failure modes observed: Minimal template missing a photo spot (fixed). No other defects.
- Graders run and results (PASS/FAIL): PASS — build, unit, and 18 US4/US5 assertions all green.
- Prompt variant (if applicable): n/a
- Next experiment (smallest change to try): in the Phase 8 print gate (T044), confirm the photo prints crisply at A4 on real Android across all 5 spots (esp. Elegant's circular sidebar photo and Minimal's small header photo), with/without "Background graphics".
