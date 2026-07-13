import { describe, expect, it } from "vitest";
import { createInitialState, cvReducer } from "./cv-reducer";
import type { CVAction, CVDocument, EntriesContent } from "./cv-types";

const init = () => createInitialState();
const sectionIds = (cv: CVDocument) => cv.sections.map((s) => s.id);

describe("createInitialState", () => {
  it("starts on the gallery with 7 default sections and no data", () => {
    const cv = init();
    expect(cv.screen).toBe("gallery");
    expect(cv.sections).toHaveLength(7);
    expect(cv.photo).toBeNull();
    expect(cv.personalInfo.fullName).toBe("");
  });
  it("returns independent copies (no shared references)", () => {
    const a = init();
    const b = init();
    expect(a).not.toBe(b);
    expect(a.sections).not.toBe(b.sections);
    expect(a.style).not.toBe(b.style);
  });
});

describe("personal + photo", () => {
  it("UPDATE_PERSONAL sets one field", () => {
    const cv = cvReducer(init(), {
      type: "UPDATE_PERSONAL",
      field: "phone",
      value: "0300-1234567",
    });
    expect(cv.personalInfo.phone).toBe("0300-1234567");
  });
  it("SET_PHOTO sets and clears", () => {
    let cv = cvReducer(init(), { type: "SET_PHOTO", dataUrl: "data:x" });
    expect(cv.photo).toBe("data:x");
    cv = cvReducer(cv, { type: "SET_PHOTO", dataUrl: null });
    expect(cv.photo).toBeNull();
  });
});

describe("entries", () => {
  it("ADD/UPDATE/REMOVE_ENTRY round-trip", () => {
    let cv = cvReducer(init(), { type: "ADD_ENTRY", sectionId: "education" });
    const edu = () => cv.sections.find((s) => s.id === "education")!.content as EntriesContent;
    expect(edu().entries).toHaveLength(1);
    const id = edu().entries[0].id;

    cv = cvReducer(cv, {
      type: "UPDATE_ENTRY",
      sectionId: "education",
      entryId: id,
      field: "title",
      value: "BSc Computer Science",
    });
    expect(edu().entries[0].title).toBe("BSc Computer Science");

    cv = cvReducer(cv, { type: "REMOVE_ENTRY", sectionId: "education", entryId: id });
    expect(edu().entries).toHaveLength(0);
  });
});

describe("skills", () => {
  it("ADD_SKILL trims and ignores blanks; REMOVE_SKILL by index", () => {
    let cv = cvReducer(init(), { type: "ADD_SKILL", value: "  Typing  " });
    cv = cvReducer(cv, { type: "ADD_SKILL", value: "   " }); // ignored
    cv = cvReducer(cv, { type: "ADD_SKILL", value: "Excel" });
    const skills = () => cv.sections.find((s) => s.id === "skills")!.content;
    expect(skills().kind === "skills" && skills().kind).toBeTruthy();
    if (skills().kind === "skills") {
      // @ts-expect-error narrowed at runtime
      expect(skills().items).toEqual(["Typing", "Excel"]);
    }
    cv = cvReducer(cv, { type: "REMOVE_SKILL", index: 0 });
    const after = cv.sections.find((s) => s.id === "skills")!.content;
    if (after.kind === "skills") expect(after.items).toEqual(["Excel"]);
  });
});

describe("references mode", () => {
  it("SET_REFERENCES_MODE toggles onRequest", () => {
    const cv = cvReducer(init(), { type: "SET_REFERENCES_MODE", onRequest: true });
    const ref = cv.sections.find((s) => s.id === "references")!.content;
    expect(ref.kind === "references" && ref.onRequest).toBe(true);
  });
});

describe("rename", () => {
  it("sets custom heading and clears on blank", () => {
    let cv = cvReducer(init(), {
      type: "RENAME_SECTION",
      sectionId: "objective",
      heading: "Profile Summary",
    });
    expect(cv.sections.find((s) => s.id === "objective")!.customHeading).toBe("Profile Summary");
    cv = cvReducer(cv, { type: "RENAME_SECTION", sectionId: "objective", heading: "  " });
    expect(cv.sections.find((s) => s.id === "objective")!.customHeading).toBeNull();
  });
});

describe("MOVE_SECTION", () => {
  it("swaps neighbors and no-ops at the ends", () => {
    const cv0 = init();
    const first = cv0.sections[0].id;
    const second = cv0.sections[1].id;

    const down = cvReducer(cv0, { type: "MOVE_SECTION", sectionId: first, direction: "down" });
    expect(sectionIds(down).slice(0, 2)).toEqual([second, first]);

    const upAtTop = cvReducer(cv0, { type: "MOVE_SECTION", sectionId: first, direction: "up" });
    expect(sectionIds(upAtTop)).toEqual(sectionIds(cv0)); // unchanged

    const last = cv0.sections[cv0.sections.length - 1].id;
    const downAtBottom = cvReducer(cv0, { type: "MOVE_SECTION", sectionId: last, direction: "down" });
    expect(sectionIds(downAtBottom)).toEqual(sectionIds(cv0)); // unchanged
  });
});

describe("style actions never touch content (FR-017/FR-020)", () => {
  it("SET_TEMPLATE / SET_ACCENT / SET_FONT_SIZE leave sections and personal intact", () => {
    let cv = cvReducer(init(), {
      type: "UPDATE_PERSONAL",
      field: "fullName",
      value: "Sara",
    });
    cv = cvReducer(cv, { type: "ADD_SKILL", value: "Design" });
    const before = JSON.stringify({ personalInfo: cv.personalInfo, sections: cv.sections });

    cv = cvReducer(cv, { type: "SET_TEMPLATE", templateId: "modern" });
    cv = cvReducer(cv, { type: "SET_ACCENT", accentColor: "#0f766e" });
    cv = cvReducer(cv, { type: "SET_FONT_SIZE", fontSizeLevel: "large" });

    expect(cv.style).toEqual({
      templateId: "modern",
      accentColor: "#0f766e",
      fontSizeLevel: "large",
    });
    expect(JSON.stringify({ personalInfo: cv.personalInfo, sections: cv.sections })).toBe(before);
  });
});

describe("screen + reset", () => {
  it("SET_SCREEN switches screens", () => {
    expect(cvReducer(init(), { type: "SET_SCREEN", screen: "preview" }).screen).toBe("preview");
  });
  it("RESET returns fresh defaults on the gallery", () => {
    let cv = cvReducer(init(), { type: "UPDATE_PERSONAL", field: "fullName", value: "Ali" });
    cv = cvReducer(cv, { type: "SET_TEMPLATE", templateId: "elegant" });
    cv = cvReducer(cv, { type: "SET_SCREEN", screen: "form" });
    const reset = cvReducer(cv, { type: "RESET" });
    expect(reset).toEqual(init());
    expect(reset.screen).toBe("gallery");
  });
});

describe("unknown / missing ids are silent no-ops", () => {
  it("unknown action type leaves state unchanged", () => {
    const cv = init();
    const after = cvReducer(cv, { type: "NOPE" } as unknown as CVAction);
    expect(after).toBe(cv);
  });
  it("UPDATE_ENTRY on a missing entry id changes nothing", () => {
    const cv = cvReducer(init(), { type: "ADD_ENTRY", sectionId: "education" });
    const after = cvReducer(cv, {
      type: "UPDATE_ENTRY",
      sectionId: "education",
      entryId: "does-not-exist",
      field: "title",
      value: "X",
    });
    const edu = after.sections.find((s) => s.id === "education")!.content as EntriesContent;
    expect(edu.entries.every((e) => e.title === "")).toBe(true);
  });
});
