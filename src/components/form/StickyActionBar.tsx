"use client";

import { useState } from "react";
import { useCV } from "@/lib/cv-context";

/** Always-reachable Preview action (FR-011). Blocks preview only when name or
 *  phone is missing (FR-012); everything else is optional. */
export function StickyActionBar() {
  const { cv, dispatch } = useCV();
  const [error, setError] = useState("");

  const onPreview = () => {
    if (!cv.personalInfo.fullName.trim() || !cv.personalInfo.phone.trim()) {
      setError("Please enter at least a name and phone number.");
      return;
    }
    setError("");
    dispatch({ type: "SET_SCREEN", screen: "preview" });
  };

  return (
    <div className="no-print sticky bottom-0 z-20 border-t border-zinc-200 bg-white/95 px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur">
      {error && <p className="mb-2 text-sm text-red-600">{error}</p>}
      <button
        type="button"
        onClick={onPreview}
        className="min-h-[48px] w-full rounded-xl bg-zinc-900 font-semibold text-white active:bg-zinc-800"
      >
        Preview CV
      </button>
    </div>
  );
}
