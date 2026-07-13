<!--
Sync Impact Report
==================
Version change: 1.0.0 → 1.1.0 (MINOR — scoped exception added to Principle VI)
Rationale (v1.1.0, 2026-07-13): Permit narrowly-scoped, dynamically-imported client-side
  libraries solely for on-device document export (feature 002-pdf-download; ADR-0003),
  without weakening Principle II (nothing is transmitted). Initial ratification (v1.0.0,
  2026-07-11) recorded below.

Modified principles (v1.1.0):
  VI. Fixed Tech Stack — added a scoped, on-device export-library exception; Principle II
      (Zero Backend, Zero Persistence) reaffirmed non-negotiable and unaffected.
Added guidance (v1.1.0):
  - Additional Constraints — "On-device export libraries" allowance pointing to Principle VI.

--- v1.0.0 (initial ratification) ---
Rationale: Initial ratification of the constitution from user-supplied principles.

Modified principles: N/A (initial adoption — all six principles newly defined)
  I. Mobile-First
  II. Zero Backend, Zero Persistence
  III. Print-Perfect Output
  IV. Speed of Use
  V. Simplicity Over Cleverness
  VI. Fixed Tech Stack

Added sections:
  - Core Principles (6 principles)
  - Additional Constraints
  - Development Workflow & Quality Gates
  - Governance

Removed sections: none (template placeholders replaced)

Templates requiring updates:
  ✅ .specify/templates/plan-template.md — Constitution Check gate is derived dynamically
     from this file at plan time; no static edits required.
  ✅ .specify/templates/spec-template.md — generic, per-feature template; aligned.
  ✅ .specify/templates/tasks-template.md — generic, per-feature template; aligned.

Follow-up TODOs: none
-->

# CV Generator Constitution

## Core Principles

### I. Mobile-First

Every screen MUST work perfectly on a 360px-wide mobile browser. The primary user is a
shopkeeper operating the app on a phone all day, so mobile is the default target, not a
responsive afterthought.

- All interactive touch targets MUST be at least 44px × 44px.
- Layouts MUST be designed at 360px width first and scale up, never designed at desktop
  width and squeezed down.
- No feature is complete until it has been verified at 360px viewport width with no
  horizontal scrolling, clipped controls, or overlapping elements.

### II. Zero Backend, Zero Persistence

The app is a pure client-side Next.js application. Customer data MUST never leave the
device.

- No database, no API routes, no server actions, no user accounts, and no analytics or
  third-party calls that transmit customer data.
- All state lives in React memory only. No localStorage, sessionStorage, cookies, or
  IndexedDB for customer data. A page refresh MUST yield a fresh start for the next
  customer.
- Rationale: walk-in customers hand over personal data (name, phone, history) for a
  one-off CV; the strongest privacy guarantee is that the data structurally cannot be
  stored or transmitted.

### III. Print-Perfect Output

Every CV template MUST render pixel-perfect on A4 size via the browser's print-to-PDF.

- `@media print` styles are a first-class requirement delivered with every template, not
  an afterthought or follow-up task.
- No cut-off content, no broken page margins, no browser headers/footers artifacts, and
  no interactive UI (buttons, nav, form chrome) appearing in printed output.
- A template change is not complete until verified via actual print preview / PDF export
  on A4.

### IV. Speed of Use

A complete CV MUST be creatable in under 5 minutes.

- Name and phone are the only mandatory fields; every other field and section is
  optional.
- No unnecessary steps: no confirmation screens, wizards, or settings that do not
  directly contribute to producing the CV.
- Empty sections MUST never render on the final CV — an unfilled section simply does not
  exist in the output.

### V. Simplicity Over Cleverness

The UI MUST be self-explanatory for a non-technical shopkeeper; no feature may require
documentation to use.

- Prefer plain React state (`useState`, lifting state, props) over state-management
  libraries; introduce a library only when plain state demonstrably fails.
- Prefer CSS solutions over JavaScript solutions (layout, print, visibility, transitions).
- Any proposal that adds a dependency, abstraction layer, or configuration surface MUST
  justify itself against the simpler alternative in the plan's Complexity Tracking table.

### VI. Fixed Tech Stack

The stack is Next.js (App Router) with TypeScript, Tailwind CSS, and client components
only.

- The app MUST remain static-friendly and deployable on the Vercel free tier (no
  server-side rendering requirements, no paid features, no serverless functions).
- All components are client components; nothing may depend on request-time server
  execution.
- Deviations from this stack are constitutional amendments, not implementation details.
- **Scoped exception (added v1.1.0)**: narrowly-scoped, dynamically-imported client-side
  libraries are permitted **solely for on-device document export** (e.g. generating a
  downloadable PDF). Any such library MUST (a) run entirely in the browser and transmit
  nothing — Principle II remains non-negotiable and is not weakened by this exception;
  (b) be loaded via dynamic `import()` so it never affects first paint; and (c) keep the
  existing HTML/CSS templates as the source of truth (no redraw). Each MUST be recorded in
  an ADR and justified in the plan's Complexity Tracking. This is the *only* permitted
  exception to the zero-runtime-dependency posture and does not license general dependency
  use.

## Additional Constraints

- **Privacy**: No telemetry, error reporters, fonts, or CDNs that transmit or expose
  customer-entered data. Third-party requests that include customer data are forbidden.
- **Offline tolerance**: After initial load, core CV creation and printing SHOULD work
  without further network access.
- **Output format**: A4 is the only supported page size. Templates are validated against
  A4 print-to-PDF in a mobile browser (Chrome on Android as the reference).
- **Accessibility of inputs**: Form fields MUST use appropriate input types (`tel`,
  `email`, etc.) so the phone keyboard matches the field.
- **On-device export libraries** (v1.1.0): a client-side library for producing a
  downloadable file is allowed only when it transmits nothing, loads on demand via dynamic
  `import()`, and reuses existing templates as the source of truth — see Principle VI's
  scoped exception; recorded in ADR-0003.

## Development Workflow & Quality Gates

Every feature MUST pass these gates before it is considered done:

- [ ] Renders and operates correctly at 360px viewport width; all touch targets ≥ 44px.
- [ ] No new API routes, server actions, storage APIs, or outbound data transmission.
- [ ] Page refresh clears all customer data (verified manually).
- [ ] Print preview on A4 shows no cut-off content, broken margins, or UI chrome
      (for any feature touching CV output).
- [ ] Name + phone alone produce a valid, printable CV; empty sections do not render.
- [ ] No new dependencies or abstractions without justification in Complexity Tracking.

Plans produced by `/sp.plan` MUST evaluate their Constitution Check gate against the six
principles above. Violations require an entry in the plan's Complexity Tracking table or
a redesign.

## Governance

- This constitution supersedes all other development practices for this project. Where a
  spec, plan, or task conflicts with a principle, the constitution wins.
- **Amendments**: Any change to principles or constraints requires updating this file,
  incrementing the version per the policy below, and recording the change in the Sync
  Impact Report comment. Significant architectural consequences SHOULD additionally be
  captured as an ADR under `history/adr/`.
- **Versioning policy** (semantic): MAJOR for removing or redefining a principle in a
  backward-incompatible way; MINOR for adding a principle or materially expanding
  guidance; PATCH for clarifications and wording fixes.
- **Compliance review**: Every plan's Constitution Check and every PR review MUST verify
  the quality gates above. Complexity MUST be justified, never assumed.

**Version**: 1.1.0 | **Ratified**: 2026-07-11 | **Last Amended**: 2026-07-13
