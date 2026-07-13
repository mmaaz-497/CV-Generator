# Feature Specification: CV Generator

**Feature Branch**: `001-cv-generator`
**Created**: 2026-07-11
**Status**: Draft
**Input**: User description: "Build a CV Generator web app for a print/composing shop. A shopkeeper uses it on a mobile phone to create professional CVs for walk-in customers, then downloads a PDF to print or send via WhatsApp."

## Clarifications

### Session 2026-07-11

- Q: Should the app warn before close/refresh while a CV has unsaved data? → A: Yes — show the browser's native leave-site confirmation only when customer data has been entered; intentional resets still work with one extra tap.
- Q: After "New CV" is confirmed, where does the shopkeeper land? → A: The template gallery — full journey restart for the next customer.
- Q: How strictly are phone/email/CNIC validated? → A: Soft inline hints when a value looks off; never block preview or PDF. Only name + phone presence is enforced.
- Q: How do sidebar templates (Professional, Elegant) lay out page 2 on overflow? → A: Sidebar appears on page 1 only; overflow content flows into a clean full-width layout on page 2.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Create and Download a CV (Priority: P1)

A walk-in customer dictates their details. The shopkeeper opens the app on their phone,
taps one of the five template thumbnails on the gallery screen, fills in the customer's
name, phone, and whichever other sections the customer needs on a single scrollable form,
taps "Preview" to see the finished CV, and taps "Download PDF" to save an A4 PDF via the
browser's print dialog — ready to print or send via WhatsApp.

**Why this priority**: This is the entire reason the app exists. Without the
gallery → form → preview → PDF path, there is no product.

**Independent Test**: On a 360px-wide phone browser, select a template, enter only name
and phone, preview, and produce an A4 PDF. Delivers a complete, sellable CV.

**Acceptance Scenarios**:

1. **Given** the app has just loaded, **When** the shopkeeper views the first screen,
   **Then** five template thumbnails are visible and tappable, each showing a visual
   preview of its style.
2. **Given** a template is selected, **When** the form screen opens, **Then** all
   sections appear as collapsible cards on one scrollable page with no wizard or
   multi-step flow, and a sticky bottom bar keeps the "Preview" button reachable.
3. **Given** name and phone are filled, **When** the shopkeeper taps "Preview",
   **Then** the full CV renders in the chosen template exactly as it will print.
4. **Given** the preview is showing, **When** the shopkeeper taps "Download PDF",
   **Then** the browser print dialog opens with the CV laid out on A4, matching the
   on-screen preview exactly.
5. **Given** name or phone is empty, **When** the shopkeeper attempts to preview,
   **Then** the app indicates the missing required field(s) and does not proceed.

---

### User Story 2 - Skip, Rename, and Reorder Sections (Priority: P2)

Customers differ: a fresh graduate has no work experience; a laborer may want only
skills and references. The shopkeeper fills only the sections the customer needs,
renames headings to suit (e.g., "Career Objective" → "Profile Summary"), and reorders
sections so the most relevant appear first. The final CV shows exactly the filled
sections, in the chosen order, under the chosen headings — with no empty headings or
blank gaps.

**Why this priority**: Section flexibility is the critical differentiator named in the
brief; without it every CV looks half-empty or wrongly structured for the customer.

**Independent Test**: Fill only name, phone, and skills; rename the Skills heading;
move Skills above Education. Preview and PDF must show only Personal Info and the
renamed Skills section, in that order.

**Acceptance Scenarios**:

1. **Given** a section is left empty, **When** the CV is previewed or printed,
   **Then** that section does not appear at all — no heading, no gap.
2. **Given** the shopkeeper renames a section heading via the section's edit control,
   **When** the CV is previewed or printed, **Then** the custom heading appears
   exactly as typed.
3. **Given** the shopkeeper moves a section up or down using the controls on its card,
   **When** the CV is previewed or printed, **Then** sections appear in the custom
   order.
4. **Given** every optional section is skipped, **When** the CV is previewed,
   **Then** a clean, professional one-page CV with only personal details renders.

---

### User Story 3 - Restyle in Preview Without Losing Data (Priority: P3)

While looking at the preview with the customer, the shopkeeper switches between the
five templates, tries accent colors from the palette, and adjusts the font size level
until the customer is happy. Every change re-renders instantly and no entered data is
ever lost.

**Why this priority**: Restyling drives customer satisfaction, but a usable CV
can already be produced without it.

**Independent Test**: Enter a full CV, open preview, cycle through all five templates,
all accent colors, and all three font sizes; verify every field entered is still
present after each switch.

**Acceptance Scenarios**:

1. **Given** the preview is open, **When** the shopkeeper selects a different
   template, **Then** the same data re-renders in the new template with a subtle
   transition and nothing lost or misplaced.
2. **Given** the preview is open, **When** the shopkeeper picks an accent color from
   the predefined palette (5–6 colors), **Then** the template's accented elements
   update instantly.
3. **Given** the preview is open, **When** the shopkeeper changes the font size level
   (small / medium / large), **Then** the CV re-renders at that size level.
4. **Given** any restyle change, **When** the shopkeeper returns to the form,
   **Then** all previously entered data is intact.

---

### User Story 4 - Add a Customer Photo (Priority: P4)

Some customers want a photo CV. The shopkeeper uploads a photo from the phone's
gallery or takes one with the camera. Templates place the photo in their designated
spot; if no photo is provided, templates adapt so no empty photo box appears.

**Why this priority**: Photos are common on CVs in this market but a CV is complete
without one.

**Independent Test**: Create the same CV twice — once with a photo, once without —
and verify both render gracefully in all five templates.

**Acceptance Scenarios**:

1. **Given** the photo section, **When** the shopkeeper taps upload, **Then** they can
   choose an existing photo or capture one with the camera.
2. **Given** a photo is added, **When** any template renders, **Then** the photo
   appears in that template's designated position.
3. **Given** no photo is added, **When** any template renders, **Then** the layout
   adapts and shows no empty photo placeholder.
4. **Given** a photo is added, **When** the shopkeeper removes it, **Then** templates
   render in their no-photo layout.

---

### User Story 5 - Reset for the Next Customer (Priority: P5)

When one customer is done, the shopkeeper taps "New CV", confirms, and gets a
completely blank app for the next customer.

**Why this priority**: Needed for all-day shop use, but trivial in scope and a page
refresh achieves the same effect.

**Independent Test**: Fill a CV, tap "New CV", confirm, and verify every field,
photo, custom heading, custom order, and style choice has returned to defaults.

**Acceptance Scenarios**:

1. **Given** a filled CV, **When** the shopkeeper taps "New CV", **Then** a
   confirmation prompt appears before anything is cleared.
2. **Given** the confirmation is accepted, **Then** all data, photo, renamed
   headings, custom section order, and style selections reset to defaults, and the
   app returns to the template gallery.
3. **Given** the confirmation is declined, **Then** nothing changes.

---

### Edge Cases

- Very long content (e.g., 6 education entries + long objective): content flows to
  page 2 cleanly; no section entry is cut in half mid-entry across the page break.
- A repeatable entry is added but left completely blank: it is treated as empty and
  never renders.
- Skills/languages with many items (e.g., 20 skills): layout wraps gracefully on
  screen and in print.
- Accidental page refresh or back-swipe mid-entry: the browser's native leave-site
  warning appears (only when data has been entered); if the shopkeeper proceeds
  anyway, all data is gone by design and the app loads back to the gallery quickly.
- References section with the "available on request" toggle ON and named entries also
  present: named entries take precedence; the toggle is treated as off.
- Photo in unusual aspect ratio (tall/wide): displayed fitted/cropped in the
  template's photo frame without distortion.
- Template switch while content overflows one page: the new template repaginates
  cleanly by its own layout rules.
- Browser print dialog set to non-A4 paper: the CV is designed for A4; output at
  other sizes is not guaranteed.

## Requirements *(mandatory)*

### Functional Requirements

**Template gallery & selection**

- **FR-001**: The app MUST open on a template gallery showing all 5 templates as
  visual thumbnail previews of their actual style.
- **FR-002**: Tapping a thumbnail MUST select that template and open the form.

**Form**

- **FR-003**: The form MUST be a single scrollable page of collapsible section cards —
  no wizard or multi-step flow.
- **FR-004**: The form MUST contain these sections in default order: Personal Info,
  Photo, Career Objective, Education, Work Experience, Skills, Languages,
  Certifications/Courses, References.
- **FR-005**: Personal Info MUST offer: full name, phone, email, address, city, date
  of birth, CNIC number, marital status, nationality, religion. Only full name and
  phone are required, app-wide.
- **FR-006**: Education, Work Experience, Languages, Certifications/Courses, and named
  References MUST support repeatable entries with add/remove controls; all fields
  within an entry are optional.
- **FR-007**: Skills MUST be entered one at a time as removable tag/chip items.
- **FR-008**: References MUST offer either an "available on request" toggle or named
  entries (name, designation, contact); if both are provided, named entries win.
- **FR-009**: Photo MUST be uploadable from the phone gallery or camera, and
  removable. The photo never leaves the device.
- **FR-010**: Collapsed section cards MUST show a filled/summary indicator (e.g.,
  checkmark or count) so completion status is visible at a glance.
- **FR-011**: A sticky bottom action bar MUST keep "Preview" reachable at all times
  on the form page.
- **FR-012**: Preview MUST be blocked with a clear inline indication if name or phone
  is missing. No other input is ever blocking: phone, email, and CNIC show a soft
  inline hint when the value looks off (e.g., CNIC not 13 digits) but never prevent
  preview or PDF.

**Section flexibility**

- **FR-013**: Every section except Personal Info can be skipped; an empty section MUST
  NOT render on the CV — no heading, no gap.
- **FR-014**: Every section's heading MUST be renamable via an edit control on the
  section card; the custom heading appears verbatim on the CV.
- **FR-015**: Sections MUST be reorderable via move up/down controls on each card;
  the CV output follows the custom order. Personal Info (with photo) forms the CV
  header and is not reorderable.

**Templates & styling**

- **FR-016**: The app MUST provide exactly 5 templates: Classic (black & white,
  centered header), Professional (left sidebar + main column, subtle accent), Modern
  (colored header band, two-column body), Elegant (dark full-height sidebar), Minimal
  (single column, thin dividers, maximum text density).
- **FR-017**: All templates MUST render the same underlying data; switching templates
  MUST never lose data or reflow it incorrectly.
- **FR-018**: Each template MUST support an accent color chosen from one predefined
  palette of 5–6 colors, and three font size levels (small / medium / large).
- **FR-019**: Every template MUST handle both with-photo and without-photo states
  gracefully, with no empty photo box in the no-photo state.
- **FR-020**: From the preview screen, the shopkeeper MUST be able to switch template,
  accent color, and font size with instant re-render and no data loss.

**Output**

- **FR-021**: "Download PDF" MUST trigger the browser print dialog with the CV laid
  out for A4, matching the on-screen preview exactly.
- **FR-022**: Printed output MUST contain only the CV — no app UI, buttons, or
  navigation chrome.
- **FR-023**: Content preferring one page MUST flow to page 2 cleanly when it
  overflows, without splitting an individual entry across the page break. In sidebar
  templates (Professional, Elegant) the sidebar renders on page 1 only; overflow
  flows into a full-width layout on page 2.
- **FR-024**: CV content is English only; no multi-language output.

**Lifecycle & privacy**

- **FR-025**: A "New CV" action MUST clear all data, photo, custom headings, custom
  order, and style choices after an explicit confirmation, then return to the
  template gallery.
- **FR-026**: All data MUST live in memory only for the current page session: no
  accounts, no persistence, no transmission off the device. A page refresh yields a
  fresh start.
- **FR-027**: When any customer data has been entered, the app MUST arm the browser's
  native leave-site warning so an accidental refresh, tab close, or back navigation
  asks for confirmation before data is lost. The warning is not armed when the app
  is empty.

**Look & feel**

- **FR-028**: Section cards MUST expand/collapse smoothly; every tap gives instant
  visual feedback; template/color switches in preview use subtle transitions.
- **FR-029**: Every screen MUST work at 360px viewport width with touch targets of at
  least 44px (per constitution).

### Key Entities

- **CV Document**: The complete in-memory record for one customer: personal info,
  optional photo, all section content, per-section custom headings, custom section
  order, and style selections. Discarded on reset or refresh.
- **Section**: A named, orderable unit of CV content. Has a default heading, an
  optional custom heading, a position, and content. Empty sections are invisible in
  output. Content shapes: single text (Career Objective), repeatable entries
  (Education, Work Experience, Languages, Certifications, named References), tag list
  (Skills), toggle-or-entries (References).
- **Entry**: One item inside a repeatable section (e.g., one degree: title, institute,
  years, grade — all optional). An entry with no filled fields is treated as absent.
- **Template**: One of 5 visual layouts that renders a CV Document. Defines placement
  of header, photo, and sections; respects accent color and font size level; adapts
  to photo/no-photo states.
- **Style Selection**: The current template choice, accent color (from the predefined
  palette), and font size level (small/medium/large).

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A CV with name, phone, 2 education entries, and 3 skills can be created
  and previewed in under 3 minutes on a 360px-wide phone.
- **SC-002**: Skipping every optional section still yields a clean, professional
  one-page CV containing only the personal details provided.
- **SC-003**: A renamed section heading and a custom section order are reflected
  exactly in the downloaded PDF.
- **SC-004**: Switching between all 5 templates in preview keeps 100% of entered data
  intact, verified after each switch.
- **SC-005**: The PDF produced via the print dialog matches the on-screen preview on
  A4 with no cut-off content, no empty headings, and no app UI visible.
- **SC-006**: With overflow content, no individual section entry is split across the
  page 1 / page 2 boundary.
- **SC-007**: A non-technical user can complete the full journey (template → form →
  preview → PDF) on first attempt without instructions.
- **SC-008**: After "New CV" confirmation or a page refresh, zero customer data
  remains anywhere.

## Assumptions

- Personal Info (including the photo) renders as the CV header in every template and
  is therefore excluded from reordering; all other sections are reorderable.
- In sidebar templates (Professional, Elegant), certain sections are placed in the
  sidebar by the template's design; the custom section order applies within each
  layout region.
- Renamed headings and custom order last only for the current CV; "New CV" and page
  refresh restore defaults.
- If both the references toggle and named reference entries are set, named entries
  take precedence.
- The photo is displayed fitted/cropped to the template's frame; no in-app photo
  editing (crop/rotate) is provided.
- "Send via WhatsApp" happens outside the app with the saved PDF; the app's
  responsibility ends at the print dialog.
- The predefined accent palette is a single shared palette (5–6 colors) used by all
  templates; Classic may ignore accent color to stay black & white.
- Default font size level is medium; default accent color is the first in the palette.

## Out of Scope

- Saving/loading customer data, history, or drafts
- User accounts, authentication, payments

- Multi-language CV content (English only)
- AI text generation or content suggestions
- Cloud storage or any server-side processing
- In-app photo editing
- Direct WhatsApp/share integration
