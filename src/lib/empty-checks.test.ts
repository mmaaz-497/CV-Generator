import { describe, expect, it } from "vitest";
import { hasAnyData, isEntryEmpty, isSectionEmpty } from "./empty-checks";
import { createInitialState } from "./cv-reducer";
import type { Entry, Section } from "./cv-types";

const entry = (over: Partial<Entry> = {}): Entry => ({
  id: "x",
  title: "",
  subtitle: "",
  period: "",
  detail: "",
  ...over,
});

describe("isEntryEmpty", () => {
  it("is empty when all fields blank", () => {
    expect(isEntryEmpty(entry())).toBe(true);
  });
  it("treats whitespace-only as blank", () => {
    expect(isEntryEmpty(entry({ title: "   ", detail: "\t\n" }))).toBe(true);
  });
  it("is non-empty when any field is filled", () => {
    expect(isEntryEmpty(entry({ subtitle: "Acme Ltd" }))).toBe(false);
  });
});

describe("isSectionEmpty", () => {
  const textSection = (text: string): Section => ({
    id: "objective",
    defaultHeading: "Career Objective",
    customHeading: null,
    content: { kind: "text", text },
  });

  it("text: blank vs filled", () => {
    expect(isSectionEmpty(textSection("   "))).toBe(true);
    expect(isSectionEmpty(textSection("Motivated worker"))).toBe(false);
  });

  it("entries: empty array and all-empty entries are empty", () => {
    const base: Section = {
      id: "education",
      defaultHeading: "Education",
      customHeading: null,
      content: { kind: "entries", entries: [] },
    };
    expect(isSectionEmpty(base)).toBe(true);
    expect(
      isSectionEmpty({
        ...base,
        content: { kind: "entries", entries: [entry(), entry()] },
      }),
    ).toBe(true);
    expect(
      isSectionEmpty({
        ...base,
        content: { kind: "entries", entries: [entry(), entry({ title: "BSc" })] },
      }),
    ).toBe(false);
  });

  it("skills: empty vs some non-blank item", () => {
    const base: Section = {
      id: "skills",
      defaultHeading: "Skills",
      customHeading: null,
      content: { kind: "skills", items: [] },
    };
    expect(isSectionEmpty(base)).toBe(true);
    expect(isSectionEmpty({ ...base, content: { kind: "skills", items: ["  "] } })).toBe(true);
    expect(isSectionEmpty({ ...base, content: { kind: "skills", items: ["Excel"] } })).toBe(false);
  });

  it("references: onRequest OR any filled entry makes it non-empty (FR-008)", () => {
    const base: Section = {
      id: "references",
      defaultHeading: "References",
      customHeading: null,
      content: { kind: "references", onRequest: false, entries: [] },
    };
    expect(isSectionEmpty(base)).toBe(true);
    expect(
      isSectionEmpty({
        ...base,
        content: { kind: "references", onRequest: true, entries: [] },
      }),
    ).toBe(false);
    expect(
      isSectionEmpty({
        ...base,
        content: {
          kind: "references",
          onRequest: false,
          entries: [entry({ title: "Mr Khan" })],
        },
      }),
    ).toBe(false);
  });
});

describe("hasAnyData", () => {
  it("fresh document has no data", () => {
    expect(hasAnyData(createInitialState())).toBe(false);
  });
  it("true when a personal field is set", () => {
    const cv = createInitialState();
    cv.personalInfo.fullName = "Ali";
    expect(hasAnyData(cv)).toBe(true);
  });
  it("true when a photo is present", () => {
    const cv = createInitialState();
    cv.photo = "data:image/jpeg;base64,xxx";
    expect(hasAnyData(cv)).toBe(true);
  });
  it("true when any section has content", () => {
    const cv = createInitialState();
    const skills = cv.sections.find((s) => s.id === "skills")!;
    if (skills.content.kind === "skills") skills.content.items.push("Typing");
    expect(hasAnyData(cv)).toBe(true);
  });
});
