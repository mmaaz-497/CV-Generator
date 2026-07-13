"use client";

import { useCV } from "@/lib/cv-context";
import { TEMPLATES } from "@/templates/registry";

/** Horizontal template picker (registry-driven, current highlighted). Switching
 *  dispatches SET_TEMPLATE; the preview re-renders instantly with a subtle fade
 *  (FR-020, FR-028). All data is preserved (reducer never touches content). */
export function TemplateSwitcher() {
  const { cv, dispatch } = useCV();
  const current = cv.style.templateId;

  return (
    <div className="flex flex-wrap gap-2">
      {TEMPLATES.map((t) => {
        const active = t.id === current;
        return (
          <button
            key={t.id}
            type="button"
            onClick={() => dispatch({ type: "SET_TEMPLATE", templateId: t.id })}
            aria-pressed={active}
            className={`min-h-[44px] shrink-0 rounded-lg border px-4 text-sm font-medium transition-colors ${
              active
                ? "border-zinc-900 bg-zinc-900 text-white"
                : "border-zinc-300 bg-white text-zinc-700"
            }`}
          >
            {t.name}
          </button>
        );
      })}
    </div>
  );
}
