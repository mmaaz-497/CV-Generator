import type { FontSizeLevel, Section, StyleSelection } from "./cv-types";

/** Shared accent palette (constitution / FR-018). Index 0 is the default. */
export const ACCENT_PALETTE = [
  "#1e3a5f", // navy
  "#0f766e", // teal
  "#7c2d12", // rust
  "#4338ca", // indigo
  "#9d174d", // magenta
  "#334155", // slate
] as const;

/** Base font size (maps to CSS var --fs-base on the template root). */
export const FONT_SIZE_BASE: Record<FontSizeLevel, string> = {
  small: "9.5pt",
  medium: "10.5pt",
  large: "11.5pt",
};

export const DEFAULT_STYLE: StyleSelection = {
  templateId: "classic",
  accentColor: ACCENT_PALETTE[0],
  fontSizeLevel: "medium",
};

/**
 * The 7 reorderable sections in spec default order (Personal Info and Photo are
 * fixed header data, not sections). Fresh copy each call so state never shares refs.
 */
export function createDefaultSections(): Section[] {
  return [
    {
      id: "objective",
      defaultHeading: "Career Objective",
      customHeading: null,
      content: { kind: "text", text: "" },
    },
    {
      id: "education",
      defaultHeading: "Education",
      customHeading: null,
      content: { kind: "entries", entries: [] },
    },
    {
      id: "experience",
      defaultHeading: "Work Experience",
      customHeading: null,
      content: { kind: "entries", entries: [] },
    },
    {
      id: "skills",
      defaultHeading: "Skills",
      customHeading: null,
      content: { kind: "skills", items: [] },
    },
    {
      id: "languages",
      defaultHeading: "Languages",
      customHeading: null,
      content: { kind: "entries", entries: [] },
    },
    {
      id: "certifications",
      defaultHeading: "Certifications & Courses",
      customHeading: null,
      content: { kind: "entries", entries: [] },
    },
    {
      id: "references",
      defaultHeading: "References",
      customHeading: null,
      content: { kind: "references", onRequest: false, entries: [] },
    },
  ];
}
