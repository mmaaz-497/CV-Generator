"use client";

import type { Dispatch } from "react";
import { useCV } from "@/lib/cv-context";
import { isSectionEmpty } from "@/lib/empty-checks";
import type { CVAction, Section } from "@/lib/cv-types";
import { SectionCard } from "@/components/form/SectionCard";
import { PersonalInfoSection } from "@/components/form/PersonalInfoSection";
import { ObjectiveSection } from "@/components/form/ObjectiveSection";
import {
  RepeatableSection,
  type EntryFieldDef,
} from "@/components/form/RepeatableSection";
import { SkillsChips } from "@/components/form/SkillsChips";
import { PhotoSection } from "@/components/form/PhotoSection";
import { StickyActionBar } from "@/components/form/StickyActionBar";
import { NewCvButton } from "@/components/NewCvButton";

const REPEATABLE: Record<
  string,
  { fields: EntryFieldDef[]; addLabel: string; withReferencesToggle?: boolean }
> = {
  education: {
    fields: [
      { key: "title", label: "Degree / Certificate" },
      { key: "subtitle", label: "Institute" },
      { key: "period", label: "Year(s)" },
      { key: "detail", label: "Grade / Division" },
    ],
    addLabel: "Add education",
  },
  experience: {
    fields: [
      { key: "title", label: "Job Title" },
      { key: "subtitle", label: "Company" },
      { key: "period", label: "Duration" },
      { key: "detail", label: "Description", textarea: true },
    ],
    addLabel: "Add experience",
  },
  languages: {
    fields: [
      { key: "title", label: "Language" },
      { key: "subtitle", label: "Proficiency" },
    ],
    addLabel: "Add language",
  },
  certifications: {
    fields: [
      { key: "title", label: "Title" },
      { key: "subtitle", label: "Institute" },
      { key: "period", label: "Year" },
    ],
    addLabel: "Add certification",
  },
  references: {
    fields: [
      { key: "title", label: "Name" },
      { key: "subtitle", label: "Designation" },
      { key: "detail", label: "Contact" },
    ],
    addLabel: "Add reference",
    withReferencesToggle: true,
  },
};

function SectionBody({
  section,
  dispatch,
}: {
  section: Section;
  dispatch: Dispatch<CVAction>;
}) {
  if (section.id === "objective") return <ObjectiveSection section={section} dispatch={dispatch} />;
  if (section.id === "skills") return <SkillsChips section={section} dispatch={dispatch} />;
  const cfg = REPEATABLE[section.id];
  return (
    <RepeatableSection
      section={section}
      fields={cfg.fields}
      addLabel={cfg.addLabel}
      withReferencesToggle={cfg.withReferencesToggle}
      dispatch={dispatch}
    />
  );
}

export function FormScreen() {
  const { cv, dispatch } = useCV();

  return (
    <div className="flex flex-1 flex-col">
      <header className="no-print sticky top-0 z-10 flex items-center gap-3 border-b border-zinc-200 bg-white px-4 py-3">
        <button
          type="button"
          onClick={() => dispatch({ type: "SET_SCREEN", screen: "gallery" })}
          className="min-h-[44px] rounded-lg border border-zinc-300 px-3 text-sm"
        >
          ← Templates
        </button>
        <h1 className="font-semibold text-zinc-900">Fill CV details</h1>
        <div className="flex-1" />
        <NewCvButton />
      </header>

      <div className="mx-auto grid w-full max-w-xl flex-1 gap-3 px-4 py-4">
        <SectionCard
          title="Personal Information"
          filled={!!cv.personalInfo.fullName.trim()}
          defaultOpen
        >
          <PersonalInfoSection personalInfo={cv.personalInfo} dispatch={dispatch} />
        </SectionCard>

        <SectionCard title="Photo" filled={!!cv.photo}>
          <PhotoSection photo={cv.photo} dispatch={dispatch} />
        </SectionCard>

        {cv.sections.map((s, i) => (
          <SectionCard
            key={s.id}
            title={s.customHeading ?? s.defaultHeading}
            filled={!isSectionEmpty(s)}
            rename={{
              defaultHeading: s.defaultHeading,
              customHeading: s.customHeading,
              onRename: (heading) =>
                dispatch({ type: "RENAME_SECTION", sectionId: s.id, heading }),
            }}
            reorder={{
              onMoveUp: () =>
                dispatch({ type: "MOVE_SECTION", sectionId: s.id, direction: "up" }),
              onMoveDown: () =>
                dispatch({ type: "MOVE_SECTION", sectionId: s.id, direction: "down" }),
              canMoveUp: i > 0,
              canMoveDown: i < cv.sections.length - 1,
            }}
          >
            <SectionBody section={s} dispatch={dispatch} />
          </SectionCard>
        ))}
      </div>

      <StickyActionBar />
    </div>
  );
}
