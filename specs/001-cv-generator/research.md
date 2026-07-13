# Phase 0 Research: CV Generator

**Date**: 2026-07-11 | **Plan**: [plan.md](./plan.md)

No `NEEDS CLARIFICATION` items remained in the Technical Context (the technical
approach was fully specified). Research below records the decisions, their
rationale, and alternatives considered.

## R1. Static export configuration

- **Decision**: `output: 'export'` in `next.config.ts`; all interactive code in
  client components under a single `"use client"` boundary at `app/page.tsx`.
- **Rationale**: Produces pure static files (no server), satisfying Principle II and
  free-tier Vercel deployment. App Router static export supports client-only apps
  cleanly; `next/font` still works at build time.
- **Alternatives**: Default hybrid output (rejected: invites server features that the
  constitution forbids); Vite + React SPA (rejected: constitution fixes Next.js).
- **Notes**: `next/image` requires a custom loader under static export — use plain
  `<img>` for the photo (it's a data URL anyway; `next/image` adds nothing).

## R2. State: useReducer + Context

- **Decision**: One `CVDocument` in a `useReducer` hook, exposed via `CVContext`
  provider; pure reducer in `lib/cv-reducer.ts`.
- **Rationale**: Zero dependencies, testable pure function, single source of truth;
  the entire app edits one object so granular stores add nothing (Principle V).
- **Alternatives**: Zustand/Jotai (rejected: dependency for no gain at this scale);
  multiple `useState` hooks spread across screens (rejected: reset/reorder/rename
  become scattered and error-prone).
- **Notes**: Context re-renders all consumers on every keystroke; acceptable at this
  scale (one visible form section expanded at a time). If typing ever lags, memoize
  section components on their slice — no architecture change needed.

## R3. Single route with in-memory screens

- **Decision**: One `/` route; `screen: 'gallery' | 'form' | 'preview'` in the
  reducer state drives which screen renders.
- **Rationale**: URL navigation could unmount the provider or let back-swipe skip the
  leave-site warning; a screen enum keeps state and navigation fully controlled
  (FR-026, FR-027).
- **Alternatives**: Routes per screen with a shared layout provider (rejected:
  Android back gesture would navigate between screens inconsistently with the
  data-loss guard); hash-based navigation (rejected: same back-button ambiguity).

## R4. Print CSS strategy (A4)

- **Decision**: `@page { size: A4; margin: 0 }`; inner CV container implements its
  own margins in mm; `.no-print` hides all app chrome during print; every repeatable
  entry and heading block carries `break-inside: avoid`.
- **Rationale**: `margin: 0` on `@page` suppresses browser header/footer URL text in
  most Chrome configurations and gives templates full-bleed control (needed for
  Modern's header band and Elegant's dark sidebar); mm-based inner spacing keeps
  screen preview and print geometrically identical (FR-021).
- **Alternatives**: JS pagination into explicit page divs (rejected: complex, fights
  the browser); `html2canvas`/`jspdf` (rejected: dependency + fidelity loss);
  `@page` margins with browser defaults (rejected: breaks full-bleed designs).
- **Notes**: Chrome on Android honors `size: A4` in the print dialog's PDF output.
  `break-inside: avoid` is well-supported in Chromium print; add legacy
  `page-break-inside: avoid` alongside for safety.

## R5. Sidebar page-1-only print behavior (highest risk — spike first)

- **Decision (to validate by spike)**: Sidebar templates render as a two-column CSS
  grid whose sidebar cell has an explicit A4-page height (`min(100%, 297mm)` box
  clipped to page 1); content that overflows the main column continues in a
  full-width block placed after the grid, which naturally lands on page 2.
  Concretely: page-1 grid = `[sidebar | main-part-1]` with fixed 297mm height and
  `overflow: hidden` on decoration only; remaining sections render in a follow-on
  `page-2-flow` container. Section-to-region assignment (which sections sit in the
  sidebar) is template-defined; the custom order applies within each region (per
  spec assumption).
- **Rationale**: Avoids relying on repeated backgrounds across page breaks (not
  reliably supported); produces the clarified behavior (sidebar page 1 only,
  full-width page 2) with plain CSS.
- **Alternatives**: `position: fixed` sidebar repeating on every printed page
  (rejected by clarification — page 2 must be full-width; also unreliable);
  background-gradient column trick (rejected: fragile with `@page` margins).
- **Spike task**: Build one throwaway Elegant-style page with deliberately
  overflowing content; verify in Chrome print preview (desktop + Android) that
  (a) sidebar paints fully on page 1, (b) nothing paints in the sidebar column on
  page 2, (c) no entry splits. Must pass before the 5 templates are built.

### R5 — Spike result (2026-07-11): ✅ PASS at A4 (with caveats)

Built `src/app/spike/page.tsx` (a sidebar CV: dark full-height sidebar with
contact/skills/languages; main column with header/objective/2 education entries;
9 overflowing experience entries in a full-width continuation region). Rendered
headless via Chrome and extracted per-page text with `pdfjs-dist` to see exactly
what landed on each page.

**Empirical outcome at true A4** (Chrome via puppeteer, `format: A4`,
`preferCSSPageSize: true`, margins 0):

- 2 pages, both A4 (595.9 × 841.9 pt).
- Page 1: sidebar + header + objective + both education entries; **no** experience
  entries. Sidebar confined to page 1.
- Page 2: continuation heading + all 9 experience entries, full-width; **no** sidebar
  markers, **no** blank page.

**Final CSS recipe (validated)** — a two-region stack, template assigns sections to
regions:

```css
.page1 {               /* exactly one A4 page */
  height: 297mm;
  display: grid;
  grid-template-columns: 62mm 1fr;   /* sidebar | main */
  overflow: hidden;                  /* clip accidental spill */
  break-after: page;                 /* push continuation to page 2 */
  page-break-after: always;          /* legacy alias */
}
.rest { /* full width, normal flow across page 2+ */ }
.cv-entry { break-inside: avoid; page-break-inside: avoid; }
```

Region assignment: sidebar holds the short meta sections (contact, skills,
languages); `.page1 .main` holds the header + the primary sections that fit beside
the sidebar; the bulk repeatable sections (experience, certifications) render in
`.rest` and flow full-width. Custom order applies within each region (spec
assumption).

**Caveat 1 (important) — paper size must be A4.** `@page { size: A4 }` alone does
NOT force A4 in Chrome's `--print-to-pdf` CLI, which defaults to US Letter (279mm
tall). On a Letter page the fixed 297mm `.page1` overflows and produces a spurious
blank page. In the real app this cannot happen through the CLI — printing goes
through the browser dialog where the user selects paper — but it means the print
UI must steer the user to A4 (constitution already scopes A4-only). Mitigation
options if Letter is ever selected: (a) instruct/confirm A4 in the PdfButton flow;
(b) set `.page1` height to `296mm` to tolerate rounding. Recipe is sound for A4.

**Caveat 2 — page-1 main space.** Because `break-after: page` always sends `.rest`
to page 2, the page-1 main column can look under-filled when a CV is short but still
has continuation content. For short/one-page CVs the template should render
single-region (put everything in `.page1`, omit `.rest` and the forced break); the
two-region path is for genuine overflow. Templates decide this by content volume
(e.g., number of experience entries) at render time — no measurement needed, a
simple threshold.

**Caveat 3 — device coverage.** Verified on desktop Chromium (Chrome 141 via
puppeteer). Mobile Chrome on Android (the constitution's reference device) still
needs a human visual pass during the Phase 8 print gate (T044); I cannot drive an
Android device from here. `break-inside: avoid` prevented any split in this test
(all 9 entries stayed intact on page 2); a boundary-spanning split should be
eyeballed once on device.

**Verdict**: template architecture is unblocked — proceed to build the 5 templates
using this recipe; sidebar templates (Professional, Elegant) implement the
two-region path with a content-volume threshold and A4 guidance in the print flow.

## R6. Live scaled gallery thumbnails

- **Decision**: Render each real template component with `sample-data.ts` inside a
  fixed-size tile, scaled via `transform: scale(~0.28)` with `transform-origin:
  top left`; wrapper is `pointer-events: none` and `aria-hidden`, with the tappable
  card handling selection.
- **Rationale**: Thumbnails can never drift from real output; no image assets to
  maintain; scales correctly at any DPR.
- **Alternatives**: Static PNG thumbnails (rejected: drift + asset maintenance);
  simplified mini-mockups (rejected: extra components that lie about the product).
- **Notes**: 5 scaled templates mount at once on the gallery; sample data is tiny so
  render cost is negligible on mid-range phones.

## R7. Photo capture & downscale

- **Decision**: `<input type="file" accept="image/*">` (Android offers camera or
  gallery) → `createImageBitmap`/`Image` → canvas resize so the longest side is
  ≤600px → `canvas.toDataURL('image/jpeg', 0.85)` stored in state.
- **Rationale**: Caps state size (~≤200KB) so keystroke re-renders stay fluid
  (Risk 3); JPEG at 0.85 is visually fine at CV photo sizes; no EXIF concerns since
  modern Chromium applies EXIF orientation automatically (`image-orientation:
  from-image` is default).
- **Alternatives**: Store original file/object URL (rejected: multi-MB base64 in
  state, sluggish); `capture="user"` attribute (rejected: forces camera, blocking
  gallery choice).
- **Error path**: decode/resize failure → state unchanged, inline "Couldn't load
  photo, try another" message (no crash, no partial state).

## R8. beforeunload data-loss guard

- **Decision**: One `useEffect` in the provider registers `beforeunload` returning
  the standard prevention only while `hasAnyData(cvDocument)` is true; listener
  removed when data is empty or after `RESET`.
- **Rationale**: FR-027 — protects against accidental refresh/back/close, stays
  silent on an empty app; no persistence involved so Principle II holds.
- **Alternatives**: History-API trap for back gesture (rejected: fights the browser,
  inconsistent on Android); silent loss (rejected by clarification).
- **Notes**: Modern browsers show a generic message; custom text is ignored — fine.

## R9. Collapse/expand animation approach

- **Decision**: CSS-only collapse via `grid-template-rows: 0fr → 1fr` transition on a
  grid wrapper (content in a `min-height: 0` cell); chevron rotation via transform.
- **Rationale**: Smooth at any content height without JS measurement (Principle V:
  CSS over JS); GPU-friendly on low-end phones.
- **Alternatives**: `max-height` hack (rejected: janky with dynamic content);
  JS height measurement libs (rejected: dependency/complexity).

## R10. Testing posture

- **Decision**: Constitution manual gates are the primary validation. Include a small
  Vitest setup only for `cv-reducer.ts` and `empty-checks.ts` (pure functions, no DOM).
- **Rationale**: The riskiest logic (reducer transitions, emptiness rules powering
  "never render empty sections") is pure and cheap to test; UI/print fidelity is
  inherently manual (print dialog can't be e2e'd meaningfully without heavy infra).
- **Alternatives**: No tests at all (acceptable per user input, but reducer bugs are
  silent data-loss bugs — cheap insurance); Playwright e2e (rejected: infrastructure
  the project explicitly avoids).
