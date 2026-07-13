import type { ComponentType } from "react";

// ---------------------------------------------------------------------------
// Screens (single-route, in-memory navigation — plan R3)
// ---------------------------------------------------------------------------
export type Screen = "gallery" | "form" | "preview";

// ---------------------------------------------------------------------------
// Style
// ---------------------------------------------------------------------------
export type TemplateId =
  | "classic"
  | "professional"
  | "modern"
  | "elegant"
  | "minimal";

export type FontSizeLevel = "small" | "medium" | "large";

export interface StyleSelection {
  templateId: TemplateId;
  accentColor: string; // one of ACCENT_PALETTE
  fontSizeLevel: FontSizeLevel;
}

// ---------------------------------------------------------------------------
// Header data (Personal Info + Photo are NOT reorderable sections)
// ---------------------------------------------------------------------------
export interface PersonalInfo {
  fullName: string; // required (blocks preview when empty)
  phone: string; // required (blocks preview when empty)
  email: string;
  address: string;
  city: string;
  dateOfBirth: string;
  cnic: string;
  maritalStatus: string;
  nationality: string;
  religion: string;
}

// ---------------------------------------------------------------------------
// Sections
// ---------------------------------------------------------------------------
export type SectionId =
  | "objective"
  | "education"
  | "experience"
  | "skills"
  | "languages"
  | "certifications"
  | "references";

/** One item inside a repeatable section. All fields optional (FR-006). */
export interface Entry {
  id: string;
  title: string;
  subtitle: string;
  period: string;
  detail: string;
}

export interface TextContent {
  kind: "text";
  text: string;
}
export interface EntriesContent {
  kind: "entries";
  entries: Entry[];
}
export interface SkillsContent {
  kind: "skills";
  items: string[];
}
export interface ReferencesContent {
  kind: "references";
  onRequest: boolean;
  entries: Entry[];
}
export type SectionContent =
  | TextContent
  | EntriesContent
  | SkillsContent
  | ReferencesContent;

export interface Section {
  id: SectionId;
  defaultHeading: string;
  customHeading: string | null; // shown verbatim when set (FR-014)
  content: SectionContent;
}

// ---------------------------------------------------------------------------
// Root document (the single source of truth)
// ---------------------------------------------------------------------------
export interface CVDocument {
  personalInfo: PersonalInfo;
  photo: string | null; // base64 data URL, ≤600px longest side; never transmitted
  sections: Section[]; // array order IS the display order (FR-015)
  style: StyleSelection;
  screen: Screen;
}

// ---------------------------------------------------------------------------
// Template contract (contracts/template-props.md)
// ---------------------------------------------------------------------------
export interface TemplateProps {
  cv: CVDocument;
}

export interface TemplateDefinition {
  id: TemplateId;
  name: string;
  component: ComponentType<TemplateProps>;
  usesAccent: boolean; // false for Classic (stays black & white)
}

// ---------------------------------------------------------------------------
// Reducer action union (data-model.md action table)
// ---------------------------------------------------------------------------
export type CVAction =
  | { type: "UPDATE_PERSONAL"; field: keyof PersonalInfo; value: string }
  | { type: "SET_PHOTO"; dataUrl: string | null }
  | { type: "UPDATE_TEXT"; sectionId: SectionId; text: string }
  | { type: "ADD_ENTRY"; sectionId: SectionId }
  | {
      type: "UPDATE_ENTRY";
      sectionId: SectionId;
      entryId: string;
      field: keyof Omit<Entry, "id">;
      value: string;
    }
  | { type: "REMOVE_ENTRY"; sectionId: SectionId; entryId: string }
  | { type: "ADD_SKILL"; value: string }
  | { type: "REMOVE_SKILL"; index: number }
  | { type: "SET_REFERENCES_MODE"; onRequest: boolean }
  | { type: "RENAME_SECTION"; sectionId: SectionId; heading: string | null }
  | { type: "MOVE_SECTION"; sectionId: SectionId; direction: "up" | "down" }
  | { type: "SET_TEMPLATE"; templateId: TemplateId }
  | { type: "SET_ACCENT"; accentColor: string }
  | { type: "SET_FONT_SIZE"; fontSizeLevel: FontSizeLevel }
  | { type: "SET_SCREEN"; screen: Screen }
  | { type: "RESET" };
