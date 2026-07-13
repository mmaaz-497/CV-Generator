# Internal Contracts: CV Generator

**Date**: 2026-07-11 | **Plan**: [../plan.md](../plan.md)

There are no network APIs (constitution Principle II). The binding contracts are
TypeScript interfaces — enforced by the compiler, realized in `src/lib/cv-types.ts`.

## Contract 1: TemplateProps (all 5 templates)

```ts
interface TemplateProps {
  /** The full document; templates read, never mutate. */
  cv: CVDocument;
}
```

Obligations every template MUST honor:

1. Render `personalInfo` (+ `photo` when present) as the header per its own design.
2. Iterate `cv.sections` in array order; render heading as
   `customHeading ?? defaultHeading`; **skip** any section where
   `isSectionEmpty(section)` is true (import from `lib/empty-checks`, never reimplement).
3. Adapt to `photo === null` with no empty photo frame (FR-019).
4. Read accent/font-size ONLY via CSS variables `--accent` and `--fs-base` set on the
   template root from `cv.style` (Classic may ignore `--accent`).
5. Contain print styling for its own layout: `break-inside: avoid` on each entry
   block; sidebar templates render sidebar on page 1 only with full-width overflow
   (FR-023).
6. Never read/write any state, storage, or network.

Registry contract (`lib/constants.ts`):

```ts
interface TemplateDefinition {
  id: TemplateId;                    // 'classic' | 'professional' | ...
  name: string;                      // Gallery label
  component: ComponentType<TemplateProps>;
  usesAccent: boolean;               // false for Classic
}
```

The gallery, switcher, and preview all consume this registry — adding/altering a
template touches exactly one registry entry plus its component.

## Contract 2: CVAction (reducer input)

Discriminated union (full table in [data-model.md](../data-model.md)). Guarantees:

- Pure: `(state, action) → state`, no side effects, no throwing.
- Unknown ids → returns state unchanged (silent no-op).
- `SET_TEMPLATE`/`SET_ACCENT`/`SET_FONT_SIZE` MUST NOT touch any content field
  (FR-017/FR-020 — verified by unit test).
- `RESET` returns the exact initial-state factory output (fresh object, no shared
  references) and `screen: 'gallery'` (FR-025).

## Contract 3: useCV hook

```ts
function useCV(): { cv: CVDocument; dispatch: Dispatch<CVAction> };
```

- Throws (dev-time) if used outside `CVProvider`.
- `CVProvider` owns the `beforeunload` guard: armed iff `hasAnyData(cv)` (FR-027).

## Contract 4: empty-checks (pure predicates)

```ts
function isEntryEmpty(entry: Entry): boolean;
function isSectionEmpty(section: Section): boolean;
function hasAnyData(cv: CVDocument): boolean;
```

- Whitespace-only strings count as empty (trim before judging).
- References: `isSectionEmpty` is false if `onRequest` is true OR any entry is
  non-empty; renderers give non-empty entries precedence over the toggle (FR-008).
- These three functions are the ONLY emptiness authority app-wide (form badges,
  templates, unload guard all import them).

## Contract 5: Photo pipeline

```ts
function processPhoto(file: File): Promise<string>; // data URL, longest side ≤600px, JPEG q0.85
```

- Rejects on decode failure; caller keeps prior state and shows inline retry message.
- Output is the only value ever stored in `cv.photo`.
