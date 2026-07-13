"use client";

import { useCV } from "@/lib/cv-context";
import { ACCENT_PALETTE } from "@/lib/constants";
import { TEMPLATES } from "@/templates/registry";

/** Accent swatches → SET_ACCENT. Hidden for templates that ignore accent
 *  (Classic, usesAccent: false) so the shopkeeper isn't offered a no-op (FR-018). */
export function ColorPalette() {
  const { cv, dispatch } = useCV();
  const template = TEMPLATES.find((t) => t.id === cv.style.templateId);
  if (!template?.usesAccent) return null;

  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-xs font-medium uppercase tracking-wide text-zinc-500">Colour</span>
      <div className="flex flex-wrap gap-2">
        {ACCENT_PALETTE.map((hex) => {
          const active = cv.style.accentColor === hex;
          return (
            <button
              key={hex}
              type="button"
              onClick={() => dispatch({ type: "SET_ACCENT", accentColor: hex })}
              aria-label={`Accent ${hex}`}
              aria-pressed={active}
              className={`h-11 w-11 rounded-full border-2 transition-transform ${
                active ? "scale-110 border-zinc-900" : "border-transparent"
              }`}
              style={{ backgroundColor: hex }}
            />
          );
        })}
      </div>
    </div>
  );
}
