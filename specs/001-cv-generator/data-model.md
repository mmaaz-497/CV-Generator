# Data Model: CV Generator

**Date**: 2026-07-11 | **Plan**: [plan.md](./plan.md)

All data is in-memory only (constitution Principle II). There is no storage schema;
this model is realized as TypeScript types in `src/lib/cv-types.ts` and one reducer
in `src/lib/cv-reducer.ts`.

## Entity: CVDocument (root, single instance)

| Field | Type | Notes |
|-------|------|-------|
| `personalInfo` | `PersonalInfo` | Always present; CV header in every template |
| `photo` | `string \| null` | Base64 JPEG data URL, ≤600px longest side; `null` = no-photo layouts |
| `sections` | `Section[]` | Ordered array — array index IS the display order (FR-015) |
| `style` | `StyleSelection` | Template, accent, font size |
| `screen` | `'gallery' \| 'form' \| 'preview'` | Current in-memory screen (R3) |

Lifecycle: created with defaults on load → mutated by reducer actions → discarded on
`RESET` (returns to defaults + gallery) or page unload. No other transitions.

## Entity: PersonalInfo

| Field | Type | Required | Input hint |
|-------|------|----------|------------|
| `fullName` | `string` | **Yes** (blocks preview when empty, FR-012) | text |
| `phone` | `string` | **Yes** (blocks preview when empty) | `inputmode="tel"`, soft hint only |
| `email` | `string` | No | `inputmode="email"`, soft format hint |
| `address` | `string` | No | text |
| `city` | `string` | No | text |
| `dateOfBirth` | `string` | No | free text (dictated formats vary) |
| `cnic` | `string` | No | `inputmode="numeric"`, soft hint if not 13 digits |
| `maritalStatus` | `string` | No | text |
| `nationality` | `string` | No | text |
| `religion` | `string` | No | text |

Validation rule (FR-012): presence-only enforcement for `fullName` and `phone`;
everything else renders soft, non-blocking hints.

## Entity: Section

| Field | Type | Notes |
|-------|------|-------|
| `id` | `SectionId` (union: `'objective' \| 'education' \| 'experience' \| 'skills' \| 'languages' \| 'certifications' \| 'references'`) | Stable identity for reducer targeting and template region mapping |
| `defaultHeading` | `string` | e.g. "Career Objective" |
| `customHeading` | `string \| null` | Verbatim on CV when set (FR-014) |
| `content` | `SectionContent` | Discriminated by shape (below) |

Personal Info and Photo are **not** `Section`s — they are fixed header data
(spec assumption: excluded from reordering).

Reordering (FR-015): `MOVE_SECTION` swaps adjacent array elements; no `order` field
needed — array order is the single source of truth (no drift possible).

Display heading = `customHeading ?? defaultHeading`.

## SectionContent variants

| Variant | Used by | Shape |
|---------|--------|-------|
| `TextContent` | objective | `{ kind: 'text'; text: string }` |
| `EntriesContent` | education, experience, languages, certifications | `{ kind: 'entries'; entries: Entry[] }` |
| `SkillsContent` | skills | `{ kind: 'skills'; items: string[] }` |
| `ReferencesContent` | references | `{ kind: 'references'; onRequest: boolean; entries: Entry[] }` |

## Entity: Entry

One shape shared by all repeatable sections; each section renders the fields it uses.
All fields optional strings (spec FR-006).

| Field | education | experience | languages | certifications | references |
|-------|-----------|------------|-----------|----------------|------------|
| `id` | unique key (crypto.randomUUID) for React lists and targeted updates |||||
| `title` | degree/certificate | job title | language name | course title | person name |
| `subtitle` | institute | company | proficiency | institute | designation |
| `period` | year(s) | duration | — | year | — |
| `detail` | grade/division | description | — | — | contact |

Emptiness rules (`src/lib/empty-checks.ts`, the shared "never render empty" logic —
FR-013, edge cases):

- `isEntryEmpty(e)`: every field blank after trim.
- `isSectionEmpty(s)`:
  - `text` → text blank after trim
  - `entries` → no entries, or all entries empty
  - `skills` → no items
  - `references` → `onRequest` false AND no non-empty entries; note: non-empty
    entries take precedence over `onRequest` at render time (FR-008)
- `hasAnyData(doc)`: any personal field non-blank, photo present, or any section
  non-empty — arms the `beforeunload` guard (FR-027).

## Entity: StyleSelection

| Field | Type | Default |
|-------|------|---------|
| `templateId` | `'classic' \| 'professional' \| 'modern' \| 'elegant' \| 'minimal'` | chosen in gallery |
| `accentColor` | one of the palette constants (5–6 hex values in `constants.ts`) | first palette color |
| `fontSizeLevel` | `'small' \| 'medium' \| 'large'` | `'medium'` |

Classic ignores `accentColor` at render (stays black & white, per spec assumption).

## Reducer actions (state transitions)

| Action | Payload | Effect |
|--------|---------|--------|
| `UPDATE_PERSONAL` | `field, value` | Set one PersonalInfo field |
| `SET_PHOTO` | `dataUrl \| null` | Set/remove photo |
| `UPDATE_TEXT` | `sectionId, text` | Objective text |
| `ADD_ENTRY` | `sectionId` | Append blank entry (with fresh id) |
| `UPDATE_ENTRY` | `sectionId, entryId, field, value` | Edit one entry field |
| `REMOVE_ENTRY` | `sectionId, entryId` | Delete entry |
| `ADD_SKILL` / `REMOVE_SKILL` | `value` / `index` | Skills chip list |
| `SET_REFERENCES_MODE` | `onRequest: boolean` | Toggle "available on request" |
| `RENAME_SECTION` | `sectionId, heading \| null` | Set/clear custom heading |
| `MOVE_SECTION` | `sectionId, direction` | Swap with neighbor; no-op at ends |
| `SET_TEMPLATE` / `SET_ACCENT` / `SET_FONT_SIZE` | value | Style changes (data untouched — FR-017/020) |
| `SET_SCREEN` | `screen` | Gallery/form/preview switching |
| `RESET` | — | Full defaults + `screen: 'gallery'` (FR-025) |

Error policy: actions referencing missing `sectionId`/`entryId` are silent no-ops —
the reducer never throws (contract in plan.md).
