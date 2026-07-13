"use client";

import { memo, type Dispatch } from "react";
import type { CVAction, Entry, Section } from "@/lib/cv-types";

export interface EntryFieldDef {
  key: keyof Omit<Entry, "id">;
  label: string;
  textarea?: boolean;
}

/** Generic repeatable-entry editor for education / experience / languages /
 *  certifications / references (FR-006). References also gets the
 *  "available on request" toggle (FR-008). Memoized on its `section` slice so
 *  typing in another section doesn't re-render these entries (perf, T047). */
export const RepeatableSection = memo(function RepeatableSection({
  section,
  fields,
  addLabel,
  withReferencesToggle = false,
  dispatch,
}: {
  section: Section;
  fields: EntryFieldDef[];
  addLabel: string;
  withReferencesToggle?: boolean;
  dispatch: Dispatch<CVAction>;
}) {
  const sectionId = section.id;
  const c = section.content;
  const entries: Entry[] = c.kind === "entries" || c.kind === "references" ? c.entries : [];
  const onRequest = c.kind === "references" ? c.onRequest : false;

  return (
    <div className="grid gap-3">
      {withReferencesToggle && (
        <label className="flex min-h-[44px] items-center gap-2">
          <input
            type="checkbox"
            checked={onRequest}
            onChange={(e) =>
              dispatch({ type: "SET_REFERENCES_MODE", onRequest: e.target.checked })
            }
            className="h-5 w-5"
          />
          <span className="text-sm text-zinc-700">
            Show “References available on request”
          </span>
        </label>
      )}

      {entries.map((entry, i) => (
        <div key={entry.id} className="grid gap-2 rounded-lg border border-zinc-200 p-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-zinc-400">#{i + 1}</span>
            <button
              type="button"
              onClick={() => dispatch({ type: "REMOVE_ENTRY", sectionId, entryId: entry.id })}
              className="min-h-[44px] px-2 text-sm font-medium text-red-600"
            >
              Remove
            </button>
          </div>
          {fields.map((f) =>
            f.textarea ? (
              <textarea
                key={f.key}
                rows={2}
                value={entry[f.key]}
                placeholder={f.label}
                onChange={(e) =>
                  dispatch({
                    type: "UPDATE_ENTRY",
                    sectionId,
                    entryId: entry.id,
                    field: f.key,
                    value: e.target.value,
                  })
                }
                className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm text-zinc-900 outline-none focus:border-zinc-900"
              />
            ) : (
              <input
                key={f.key}
                value={entry[f.key]}
                placeholder={f.label}
                onChange={(e) =>
                  dispatch({
                    type: "UPDATE_ENTRY",
                    sectionId,
                    entryId: entry.id,
                    field: f.key,
                    value: e.target.value,
                  })
                }
                className="min-h-[44px] w-full rounded-lg border border-zinc-300 px-3 text-sm text-zinc-900 outline-none focus:border-zinc-900"
              />
            ),
          )}
        </div>
      ))}

      <button
        type="button"
        onClick={() => dispatch({ type: "ADD_ENTRY", sectionId })}
        className="min-h-[44px] rounded-lg border border-dashed border-zinc-300 text-sm font-medium text-zinc-600 active:bg-zinc-50"
      >
        + {addLabel}
      </button>
    </div>
  );
});
