"use client";

import { memo, useState, type Dispatch } from "react";
import type { CVAction, Section } from "@/lib/cv-types";

/** Skills added one at a time as removable chips (FR-007). Tapping a chip removes
 *  it, keeping the whole chip a ≥44px touch target. Memoized on its `section` slice
 *  so typing elsewhere doesn't re-render the chip list (perf, T047). */
export const SkillsChips = memo(function SkillsChips({
  section,
  dispatch,
}: {
  section: Section;
  dispatch: Dispatch<CVAction>;
}) {
  const items = section.content.kind === "skills" ? section.content.items : [];
  const [value, setValue] = useState("");

  const add = () => {
    const v = value.trim();
    if (!v) return;
    dispatch({ type: "ADD_SKILL", value: v });
    setValue("");
  };

  return (
    <div className="grid gap-3">
      <div className="flex gap-2">
        <input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              add();
            }
          }}
          placeholder="e.g. MS Office"
          className="min-h-[44px] flex-1 rounded-lg border border-zinc-300 px-3 text-zinc-900 outline-none focus:border-zinc-900"
        />
        <button
          type="button"
          onClick={add}
          className="min-h-[44px] rounded-lg bg-zinc-900 px-4 font-medium text-white active:bg-zinc-800"
        >
          Add
        </button>
      </div>

      {items.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {items.map((item, i) => (
            <button
              key={i}
              type="button"
              onClick={() => dispatch({ type: "REMOVE_SKILL", index: i })}
              aria-label={`Remove ${item}`}
              className="inline-flex min-h-[44px] items-center gap-1.5 rounded-full bg-zinc-100 px-4 text-sm text-zinc-800 active:bg-zinc-200"
            >
              {item}
              <span aria-hidden className="text-zinc-500">
                ×
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
});
