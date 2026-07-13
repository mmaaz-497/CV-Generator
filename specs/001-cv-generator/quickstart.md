# Quickstart: CV Generator

**Date**: 2026-07-11 | **Plan**: [plan.md](./plan.md)

## Prerequisites

- Node.js 20+ and npm
- A phone (or DevTools device emulation at 360px) for the constitution gates

## Setup

```bash
npx create-next-app@latest . --typescript --tailwind --app --src-dir --no-eslint --import-alias "@/*"
```

Then set static export in `next.config.ts`:

```ts
const nextConfig = { output: 'export' };
```

No further dependencies are installed at runtime. Optional dev-only: `vitest` for
reducer/empty-checks unit tests.

## Run

```bash
npm run dev        # http://localhost:3000
npm run build      # static export → ./out (deployable to Vercel free tier)
npx vitest run     # optional: pure-logic unit tests
```

## Verify (constitution gates + spec success criteria)

1. **Mobile**: DevTools → 360×800 viewport. Whole journey works; no horizontal
   scroll; all touch targets ≥44px.
2. **Zero persistence**: fill the form, refresh — everything is gone and the app is
   back at the gallery; DevTools Network tab shows zero outbound requests carrying
   entered data; Application tab shows no storage use.
3. **Data-loss guard**: type anything, try closing the tab — browser asks to confirm.
   Reset the app — closing is silent again.
4. **Print**: Preview → Download PDF → destination "Save as PDF", paper A4. Output
   matches preview; no app chrome; empty sections absent; overflow lands cleanly on
   a full-width page 2 (sidebar templates: sidebar on page 1 only).
5. **Speed**: name + phone + 2 education entries + 3 skills → preview in <3 minutes
   (SC-001).
6. **Flexibility**: rename a heading, reorder sections, skip sections — PDF reflects
   all of it exactly (SC-002/SC-003).
7. **Restyle**: cycle all 5 templates, all accents, 3 font sizes in preview — data
   intact after every switch (SC-004).

## Key files

| Path | Purpose |
|------|---------|
| `src/app/page.tsx` | Client boundary: `CVProvider` + screen switcher |
| `src/app/globals.css` | Tailwind + print CSS (`@page` A4, `.no-print`) |
| `src/lib/cv-reducer.ts` | All state transitions (pure) |
| `src/lib/empty-checks.ts` | The single emptiness authority |
| `src/templates/*` | The 5 template components (TemplateProps contract) |
| `specs/001-cv-generator/contracts/template-props.md` | Interface contracts |
