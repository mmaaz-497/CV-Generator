import { createDefaultSections, DEFAULT_STYLE } from "./constants";
import type {
  CVAction,
  CVDocument,
  Entry,
  PersonalInfo,
  Section,
  SectionId,
} from "./cv-types";

const EMPTY_PERSONAL: PersonalInfo = {
  fullName: "",
  phone: "",
  email: "",
  address: "",
  city: "",
  dateOfBirth: "",
  cnic: "",
  maritalStatus: "",
  nationality: "",
  religion: "",
};

/** Fresh default document — no shared references between calls (RESET relies on this). */
export function createInitialState(): CVDocument {
  return {
    personalInfo: { ...EMPTY_PERSONAL },
    photo: null,
    sections: createDefaultSections(),
    style: { ...DEFAULT_STYLE },
    screen: "gallery",
  };
}

function newEntry(): Entry {
  return {
    id: crypto.randomUUID(),
    title: "",
    subtitle: "",
    period: "",
    detail: "",
  };
}

/** Immutably replace one section by id; unknown id → unchanged (silent no-op). */
function updateSection(
  state: CVDocument,
  id: SectionId,
  fn: (s: Section) => Section,
): CVDocument {
  return {
    ...state,
    sections: state.sections.map((s) => (s.id === id ? fn(s) : s)),
  };
}

/**
 * Pure reducer (contract 2). Never throws; actions on missing ids are no-ops;
 * style actions never touch content (FR-017/FR-020).
 */
export function cvReducer(state: CVDocument, action: CVAction): CVDocument {
  switch (action.type) {
    case "UPDATE_PERSONAL":
      return {
        ...state,
        personalInfo: { ...state.personalInfo, [action.field]: action.value },
      };

    case "SET_PHOTO":
      return { ...state, photo: action.dataUrl };

    case "UPDATE_TEXT":
      return updateSection(state, action.sectionId, (s) =>
        s.content.kind === "text"
          ? { ...s, content: { ...s.content, text: action.text } }
          : s,
      );

    case "ADD_ENTRY":
      return updateSection(state, action.sectionId, (s) => {
        if (s.content.kind === "entries" || s.content.kind === "references") {
          return {
            ...s,
            content: { ...s.content, entries: [...s.content.entries, newEntry()] },
          };
        }
        return s;
      });

    case "UPDATE_ENTRY":
      return updateSection(state, action.sectionId, (s) => {
        if (s.content.kind !== "entries" && s.content.kind !== "references") {
          return s;
        }
        return {
          ...s,
          content: {
            ...s.content,
            entries: s.content.entries.map((e) =>
              e.id === action.entryId
                ? { ...e, [action.field]: action.value }
                : e,
            ),
          },
        };
      });

    case "REMOVE_ENTRY":
      return updateSection(state, action.sectionId, (s) => {
        if (s.content.kind !== "entries" && s.content.kind !== "references") {
          return s;
        }
        return {
          ...s,
          content: {
            ...s.content,
            entries: s.content.entries.filter((e) => e.id !== action.entryId),
          },
        };
      });

    case "ADD_SKILL":
      return updateSection(state, "skills", (s) => {
        if (s.content.kind !== "skills") return s;
        const value = action.value.trim();
        if (!value) return s;
        return { ...s, content: { ...s.content, items: [...s.content.items, value] } };
      });

    case "REMOVE_SKILL":
      return updateSection(state, "skills", (s) =>
        s.content.kind === "skills"
          ? {
              ...s,
              content: {
                ...s.content,
                items: s.content.items.filter((_, i) => i !== action.index),
              },
            }
          : s,
      );

    case "SET_REFERENCES_MODE":
      return updateSection(state, "references", (s) =>
        s.content.kind === "references"
          ? { ...s, content: { ...s.content, onRequest: action.onRequest } }
          : s,
      );

    case "RENAME_SECTION":
      return updateSection(state, action.sectionId, (s) => ({
        ...s,
        customHeading:
          action.heading && action.heading.trim() ? action.heading : null,
      }));

    case "MOVE_SECTION": {
      const idx = state.sections.findIndex((s) => s.id === action.sectionId);
      if (idx === -1) return state;
      const target = action.direction === "up" ? idx - 1 : idx + 1;
      if (target < 0 || target >= state.sections.length) return state; // no-op at ends
      const sections = [...state.sections];
      [sections[idx], sections[target]] = [sections[target], sections[idx]];
      return { ...state, sections };
    }

    case "SET_TEMPLATE":
      return { ...state, style: { ...state.style, templateId: action.templateId } };

    case "SET_ACCENT":
      return { ...state, style: { ...state.style, accentColor: action.accentColor } };

    case "SET_FONT_SIZE":
      return {
        ...state,
        style: { ...state.style, fontSizeLevel: action.fontSizeLevel },
      };

    case "SET_SCREEN":
      return { ...state, screen: action.screen };

    case "RESET":
      return createInitialState();

    default:
      return state; // unknown action → unchanged
  }
}
