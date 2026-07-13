"use client";

import { useState } from "react";
import { useCV } from "@/lib/cv-context";

/** "New CV" reset with a confirmation step (FR-025). Confirm dispatches RESET
 *  (factory defaults + gallery); decline is a pure no-op. Marked `.no-print`.
 *  After RESET the app is empty, so the beforeunload guard disarms itself. */
export function NewCvButton({ className = "" }: { className?: string }) {
  const { dispatch } = useCV();
  const [confirming, setConfirming] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setConfirming(true)}
        className={`no-print min-h-[44px] rounded-lg border border-zinc-300 px-3 text-sm text-zinc-700 ${className}`}
      >
        New CV
      </button>

      {confirming && (
        <div
          className="no-print fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          role="dialog"
          aria-modal="true"
          aria-label="Start a new CV"
          onClick={() => setConfirming(false)}
        >
          <div
            className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-lg font-semibold text-zinc-900">Start a new CV?</h2>
            <p className="mt-1 text-sm text-zinc-600">
              This clears all details for the current customer. It can&apos;t be undone.
            </p>
            <div className="mt-5 flex gap-3">
              <button
                type="button"
                onClick={() => setConfirming(false)}
                className="min-h-[44px] flex-1 rounded-lg border border-zinc-300 font-medium text-zinc-700"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  dispatch({ type: "RESET" });
                  setConfirming(false);
                }}
                className="min-h-[44px] flex-1 rounded-lg bg-red-600 font-medium text-white active:bg-red-700"
              >
                Start new
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
