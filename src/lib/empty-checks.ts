import type { CVDocument, Entry, Section } from "./cv-types";

/** Whitespace-only counts as blank (data-model.md emptiness rules). */
const blank = (s: string): boolean => s.trim().length === 0;

/** An entry with no filled fields is treated as absent (FR-006, edge cases). */
export function isEntryEmpty(entry: Entry): boolean {
  return (
    blank(entry.title) &&
    blank(entry.subtitle) &&
    blank(entry.period) &&
    blank(entry.detail)
  );
}

/**
 * The single authority for "empty sections never render" (FR-013).
 * References: non-empty if the on-request toggle is set OR any entry is filled
 * (FR-008 — entries take precedence at render time).
 */
export function isSectionEmpty(section: Section): boolean {
  const c = section.content;
  switch (c.kind) {
    case "text":
      return blank(c.text);
    case "entries":
      return c.entries.every(isEntryEmpty); // [] → true (empty)
    case "skills":
      return c.items.every(blank); // [] → true (empty)
    case "references":
      return !c.onRequest && c.entries.every(isEntryEmpty);
  }
}

/** Arms the beforeunload guard (FR-027): any personal field, a photo, or any
 *  non-empty section means there is data worth protecting. */
export function hasAnyData(cv: CVDocument): boolean {
  if (Object.values(cv.personalInfo).some((v) => !blank(v))) return true;
  if (cv.photo) return true;
  return cv.sections.some((s) => !isSectionEmpty(s));
}
