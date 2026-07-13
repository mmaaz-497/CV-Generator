"use client";

import { memo, type Dispatch } from "react";
import type { CVAction, Section } from "@/lib/cv-types";

/** Memoized on its `section` slice: re-renders only when the objective text
 *  changes, not when other sections do (perf, plan R2 / T047). */
export const ObjectiveSection = memo(function ObjectiveSection({
  section,
  dispatch,
}: {
  section: Section;
  dispatch: Dispatch<CVAction>;
}) {
  const text = section.content.kind === "text" ? section.content.text : "";

  return (
    <textarea
      value={text}
      rows={4}
      onChange={(e) => dispatch({ type: "UPDATE_TEXT", sectionId: "objective", text: e.target.value })}
      placeholder="Write a short career objective…"
      className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-zinc-900 outline-none focus:border-zinc-900"
    />
  );
});
