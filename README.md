<p align="center">
  <img src="public/logo.png" width="96" height="96" alt="CV Maker logo">
</p>

<h1 align="center">CV Maker — Resume Builder</h1>

<p align="center">
  Build a professional CV on your phone. Export a print-ready A4 PDF.<br>
  <strong>No sign-up. No server. Nothing ever leaves the device.</strong>
</p>

---

A mobile-first, **100% client-side** web app for a print/composing shop. A non-technical
shopkeeper opens it on a phone, picks a template, types a walk-in customer's details, and
exports a print-ready **A4 PDF** — to print in the shop or send over WhatsApp.

No accounts, no database, no server. **Customer data never leaves the device.**

---

## Why it exists

Print shops write CVs for walk-in customers all day, usually in a word processor on a
desktop. This app moves that job to the phone the shopkeeper already has in their hand and
makes it fast: a full CV in **under 5 minutes**, with only **name and phone** required.

Because customers hand over personal data (phone number, CNIC, employment history) for a
one-off document, the app is built so that the data *structurally cannot* be stored or
transmitted — everything lives in React memory and disappears on refresh.

---

## Features

- **5 CV templates** — Classic (black & white), Professional, Modern, Elegant, Minimal.
- **Template gallery → form → preview** in a single route, no page reloads.
- **One long form**, not a wizard: collapsible cards for every section, sticky action bar.
- **7 optional sections** — objective, education, experience, skills, languages,
  certifications, references — all renameable and reorderable. **Empty sections never
  render.**
- **Style controls** — accent color palette and three font sizes, applied live in preview.
- **Photo support** — downscaled to ≤600px and embedded as a JPEG data URL, in-browser.
- **A4 export** — one-tap PDF download, plus a print fallback via the browser's print dialog.
- **Leave-site guard** — warns before a refresh would discard entered customer data.
- **Mobile-first** — every screen works at **360px** with ≥44px touch targets.

---

## Tech stack

| Layer | Choice |
|---|---|
| Framework | Next.js 16 (App Router, `output: 'export'`) |
| UI | React 19, client components only |
| Language | TypeScript 5 |
| Styling | Tailwind CSS v4 + a first-class `@media print` layer |
| State | `useReducer` + Context — no state library |
| Export | `html-to-image` + `jspdf`, **dynamically imported**, run entirely on-device |
| Tests | Vitest (pure logic only) |
| Hosting | Static export; deployable on the Vercel free tier |

The stack is fixed by the project constitution. Adding a runtime dependency is a
constitutional amendment, not an implementation detail — the export libraries above are the
single, explicitly scoped exception.

---

## Getting started

**Prerequisites:** Node.js 20+ and npm.

```bash
git clone <your-fork-url> cv-generator
cd cv-generator
npm install
npm run dev          # http://localhost:3000
```

| Command | What it does |
|---|---|
| `npm run dev` | Start the dev server |
| `npm run build` | Type-check and produce a static export in `./out` |
| `npm test` | Run the Vitest suite (pure logic) |

Since `npm run build` emits a fully static site, `./out` can be served by any static host.

---

## Project structure

```
src/
  app/                  # Next.js App Router — single route, globals.css holds the print CSS
  screens/              # GalleryScreen, FormScreen, PreviewScreen
  components/
    form/               # Section cards, repeatable entries, skills chips, photo picker
    preview/            # Template switcher, color palette, font size, PDF/print buttons
  templates/            # The 5 CV templates + shared pieces and the template registry
  lib/
    cv-types.ts         # CVDocument, Section, Entry, CVAction — the data model
    cv-reducer.ts       # Pure reducer: never throws, unknown ids are silent no-ops
    cv-context.tsx      # CVProvider / useCV
    empty-checks.ts     # Single source of truth for "is this empty?"
    photo.ts            # Canvas downscale → JPEG data URL
    pdf/                # filename, pagination, and on-device PDF generation

specs/                  # Feature specs, plans, and tasks (spec-driven development)
history/                # Prompt History Records and Architecture Decision Records
.specify/memory/        # The project constitution
```

### How state works

The whole app is one `CVDocument` in memory, driven through a pure reducer. An in-memory
`screen` field (`gallery | form | preview`) drives navigation — there is no URL routing and
no persistence layer of any kind.

### How the PDF is made

The preview scales the A4 page down to fit the phone screen. For export, the app clones the
page **offscreen at natural A4 size**, rasterizes it with the browser's own renderer, and
assembles A4 pages with page breaks that match the print stylesheet. Nothing is uploaded;
the file is written straight to the device.

---

## Design constraints

The app is governed by [`.specify/memory/constitution.md`](.specify/memory/constitution.md).
Its six principles are hard constraints, not guidelines:

1. **Mobile-first** — 360px is the design target, not a responsive afterthought.
2. **Zero backend, zero persistence** — no API routes, no server actions, no
   localStorage/sessionStorage/cookies/IndexedDB, no outbound request carrying customer
   data. Refresh = fresh start.
3. **Print-perfect output** — `@media print` ships with every template; A4 only.
4. **Speed of use** — name + phone are the only required fields; empty sections never render.
5. **Simplicity over cleverness** — plain React state, CSS over JS, no unjustified abstractions.
6. **Fixed tech stack** — Next.js + TypeScript + Tailwind, client components, static export.

Every feature must pass the constitution's quality gates before it is considered done.

---

## Testing

Testing is **minimal by design**. Vitest covers pure logic only — the reducer, the emptiness
checks, and PDF filename generation. Everything visual or behavioural (360px layout, print
fidelity, PDF output, the privacy guarantee) is verified **empirically** against a real build
in a headless browser, because reasoning alone cannot prove print and raster correctness.

```bash
npm test
```

---

## Status

| Feature | State |
|---|---|
| `001-cv-generator` — gallery, form, preview, 5 templates, print | **Complete** |
| `002-pdf-download` — one-tap on-device PDF export | **In progress** |

---

## Contributing

This project follows spec-driven development: a feature starts as a spec in `specs/`, becomes
a plan and a task list, and only then becomes code. Before proposing a change, read the
constitution — a change that conflicts with a principle needs an amendment, not a workaround.

---

## License

Not currently licensed for redistribution. Add a license file before publishing or reusing.
