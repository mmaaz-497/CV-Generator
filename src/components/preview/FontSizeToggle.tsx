"use client";

import { useCV } from "@/lib/cv-context";
import type { FontSizeLevel } from "@/lib/cv-types";

const LEVELS: { level: FontSizeLevel; label: string }[] = [
  { level: "small", label: "S" },
  { level: "medium", label: "M" },
  { level: "large", label: "L" },
];

/** Small / Medium / Large segmented control → SET_FONT_SIZE. The template root
 *  reads --fs-base from cv.style, so the preview re-scales instantly (FR-018). */
export function FontSizeToggle() {
  const { cv, dispatch } = useCV();
  const current = cv.style.fontSizeLevel;

  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-xs font-medium uppercase tracking-wide text-zinc-500">Size</span>
      <div className="flex overflow-hidden rounded-lg border border-zinc-300">
        {LEVELS.map(({ level, label }) => {
          const active = current === level;
          return (
            <button
              key={level}
              type="button"
              onClick={() => dispatch({ type: "SET_FONT_SIZE", fontSizeLevel: level })}
              aria-pressed={active}
              className={`min-h-[44px] w-11 text-sm font-medium transition-colors ${
                active ? "bg-zinc-900 text-white" : "bg-white text-zinc-700"
              }`}
            >
              {label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
