# Feature Specification: One-Tap PDF Download

**Feature Branch**: `002-pdf-download`  
**Created**: 2026-07-13  
**Status**: Draft  
**Input**: User description: "Replace the single Download PDF button (which opens the browser print dialog) with a direct one-tap client-side PDF download plus a separate Print action, so the shopkeeper can save a customer's CV to the phone and share it on WhatsApp immediately."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - One-tap save to phone (Priority: P1)

The shopkeeper finishes a customer's CV, taps **Download PDF** once, and an A4 PDF file
saves straight to the phone's downloads — no print dialog, no "Save as PDF" destination
step. The file is named after the customer (e.g. `Ahmed-Khan-CV.pdf`) so it is easy to
find and share on WhatsApp seconds later.

**Why this priority**: This is the entire point of the change. Today the print-dialog
route costs the shopkeeper several extra taps per customer and confuses a non-technical
user; the direct download removes that friction and is the primary value delivered.

**Independent Test**: On a phone, open a completed CV preview, tap Download PDF once, and
confirm a correctly named A4 PDF appears in the phone's downloads that opens and looks
exactly like the on-screen preview.

**Acceptance Scenarios**:

1. **Given** a preview of a CV for "Ahmed Khan", **When** the shopkeeper taps Download
   PDF, **Then** a file named `Ahmed-Khan-CV.pdf` downloads directly without any print or
   destination dialog appearing.
2. **Given** a CV whose customer name is blank, **When** the shopkeeper taps Download PDF,
   **Then** the file downloads with the fallback name `CV.pdf`.
3. **Given** any of the 5 templates, with or without a photo, **When** the PDF is
   generated, **Then** the downloaded pages are A4 and visually match the on-screen preview.
4. **Given** a CV whose content spans two pages, **When** the PDF is generated, **Then** the
   PDF has the same number of pages and the same page breaks as the Print path, with no CV
   entry split across a page boundary.

---

### User Story 2 - Print straight to a printer (Priority: P2)

For customers who want a printed copy on the spot, the shopkeeper taps a separate **Print**
action that opens the device print flow (the existing behaviour), sending the CV straight
to a connected/networked printer.

**Why this priority**: Printing remains a real need for a print/composing shop, but it is
now the secondary path; most customers want the shareable file first. Keeping Print as a
clearly separate, labelled action preserves the existing capability without cluttering the
primary flow.

**Independent Test**: On the preview screen, tap Print and confirm the device print flow
opens showing the same A4 CV, unchanged from today's behaviour.

**Acceptance Scenarios**:

1. **Given** a CV preview, **When** the shopkeeper taps Print, **Then** the device print
   flow opens with the CV rendered at A4, exactly as it does today.
2. **Given** the two actions on the preview screen, **When** the shopkeeper looks at them,
   **Then** Download PDF and Print are both clearly labelled and distinguishable, and
   neither appears on the printed/saved output itself.

---

### User Story 3 - Clear feedback while saving, graceful failure (Priority: P3)

While the PDF is being prepared, the shopkeeper sees a clear "preparing" indicator and the
button cannot be tapped again. If preparation fails, a short inline message explains the
problem and points them to the Print button as a reliable fallback.

**Why this priority**: Generating a file takes a moment on a phone; without feedback the
shopkeeper may tap repeatedly or think the app froze. A dependable fallback ensures a
customer is never left without a way to get their CV out.

**Independent Test**: Trigger a download and confirm a spinner/disabled state appears
during preparation; simulate a failure and confirm an inline error with a Print suggestion
appears and the button becomes tappable again.

**Acceptance Scenarios**:

1. **Given** the shopkeeper taps Download PDF, **When** preparation is in progress, **Then**
   the button shows a loading state and is disabled so a second tap does nothing.
2. **Given** preparation finishes, **When** the file has downloaded, **Then** the button
   returns to its normal, tappable state.
3. **Given** preparation fails, **When** the error occurs, **Then** an inline message
   explains it and suggests using Print, and the button becomes tappable again for a retry.

---

### Edge Cases

- **Name sanitisation**: names with spaces, slashes, punctuation, or other filesystem-unsafe
  characters (e.g. "Fatima / Noor") must still yield a safe filename (e.g. `Fatima-Noor-CV.pdf`).
- **Very long names**: an unusually long customer name must not produce an unusable filename;
  it is truncated to a reasonable length while keeping the `-CV.pdf` suffix.
- **Empty / whitespace-only name**: falls back to `CV.pdf`.
- **Rapid double-tap**: a second tap during preparation is ignored (button disabled).
- **Photo present**: a CV with a customer photo downloads with the photo rendered in place,
  identical to preview.
- **Long CV (2+ pages)**: page breaks match the Print path; no entry is cut in half.
- **Generation failure on an older/low-memory phone**: the user is shown the inline error and
  can still obtain the CV via Print.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The preview screen MUST present two distinct, clearly labelled actions —
  "Download PDF" and "Print" — replacing the single existing Download-PDF button.
- **FR-002**: "Download PDF" MUST produce an A4 PDF and trigger a direct file download to the
  device, without opening the browser print/destination dialog.
- **FR-003**: The downloaded file MUST be named from the customer's full name in the form
  `<First>-<Last>-CV.pdf`, sanitised to remove or replace filesystem-unsafe characters, and
  MUST fall back to `CV.pdf` when the name is empty or whitespace-only.
- **FR-004**: The generated PDF MUST be visually identical to the on-screen preview for all
  5 templates, both with and without a photo.
- **FR-005**: For CVs whose content exceeds one page, the PDF MUST be multi-page with the
  same page breaks as the Print path, and MUST NOT split a single CV entry across a page
  boundary.
- **FR-006**: PDF generation MUST occur entirely on the device; the CV content and photo
  MUST NOT be transmitted to any server or third party at any point (non-negotiable;
  constitution Principle II).
- **FR-007**: While a PDF is being generated, the Download PDF action MUST show a loading
  indicator and be disabled so repeated taps have no effect.
- **FR-008**: On successful download the Download PDF action MUST return to its normal,
  tappable state.
- **FR-009**: If generation fails, the system MUST show an inline error message that suggests
  using the Print action as a fallback, and MUST restore the button to a tappable state.
- **FR-010**: "Print" MUST preserve the existing device-print behaviour (A4 output matching
  preview) unchanged.
- **FR-011**: Neither action's on-screen controls (buttons, spinner, error text) may appear
  in the downloaded PDF or printed output.
- **FR-012**: Both actions MUST be usable on the shop's reference device (mobile Android
  Chrome), including touch targets that meet the existing mobile-first standard.
- **FR-013**: The existing HTML/CSS templates MUST remain the single source of truth for the
  CV's appearance; the download path MUST render from those templates rather than a separate,
  redrawn representation.

### Key Entities *(include if feature involves data)*

- **Generated PDF**: An A4, potentially multi-page document produced on-device from the
  current CV preview. Attributes: paper size (A4), page count, page-break positions
  (matching the print path), fidelity to the preview. Never leaves the device except as the
  user's own downloaded file.
- **Download filename**: A safe filename derived from the customer's full name
  (`<name>-CV.pdf`), with sanitisation rules and a `CV.pdf` fallback.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A completed CV can be saved as a PDF to the phone in a **single tap**, with no
  print or destination dialog appearing.
- **SC-002**: The number of taps to obtain a shareable PDF drops from the current
  multi-step print-dialog flow to exactly one.
- **SC-003**: For all 5 templates × (with photo, without photo), the downloaded PDF is A4 and
  visually matches the on-screen preview in a side-by-side check.
- **SC-004**: For a 2-page CV, the downloaded PDF has the same page count and page breaks as
  the Print output, with zero entries split across pages.
- **SC-005**: During generation, **zero** network requests carry CV content or the photo off
  the device (verifiable by inspecting network activity); no persisted storage of customer
  data is introduced.
- **SC-006**: The downloaded file is named correctly for representative inputs (normal name,
  name with unsafe characters, empty name → `CV.pdf`).
- **SC-007**: On the reference Android phone, a typical CV downloads in a time short enough
  that the shopkeeper perceives it as immediate (target: under ~5 seconds), with a loading
  indicator visible throughout.
- **SC-008**: When generation is made to fail, 100% of the time the shopkeeper sees an inline
  error pointing to Print and can still obtain the CV via Print.

## Assumptions & Dependencies

- **Constitutional exception (to be recorded)**: Direct client-side PDF generation requires
  adding a client-side rendering/PDF capability, which is an intentional exception to the
  project's zero-runtime-dependency stance (Principle V "Simplicity Over Cleverness" /
  Principle VI "Tech Stack"). The exception is justified by the user value and is bounded by
  FR-006 (nothing leaves the device) and FR-013 (existing templates stay the source of
  truth — no template rewrite). The constitution is to be amended, and the decision and its
  tradeoffs recorded, during planning (ADR).
- The on-screen preview already renders each template at A4 proportions; the download path
  reuses that rendered output as its source, so template designs are unchanged.
- The Print path (device print flow) already produces correct A4 output today and is retained
  as-is.
- The reference device is mobile Android Chrome; behaviour on that browser is the acceptance
  bar. Desktop behaviour is a convenience, not the target.

## Out of Scope

- Server-side or cloud PDF generation.
- Any change to the 5 template designs.
- Direct WhatsApp (or other app) share integration — the deliverable is a saved file the
  shopkeeper shares manually.
- Editable/tagged-PDF, password protection, or other document features beyond a faithful A4
  render of the CV.
