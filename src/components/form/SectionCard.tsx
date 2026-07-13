"use client";

import { useState, type ReactNode } from "react";

export interface RenameControl {
  defaultHeading: string;
  customHeading: string | null;
  /** Pass the new heading, or null to restore the default (FR-014). */
  onRename: (heading: string | null) => void;
}

export interface ReorderControl {
  onMoveUp: () => void;
  onMoveDown: () => void;
  canMoveUp: boolean;
  canMoveDown: boolean;
}

/** Collapsible card with a filled indicator (FR-010) and smooth CSS-only
 *  expand/collapse via animated grid rows (plan R9). When `rename`/`reorder` are
 *  provided (the 7 reorderable sections), the header shows edit + move controls
 *  (US2, FR-014/FR-015). */
export function SectionCard({
  title,
  filled,
  defaultOpen = false,
  headerRight,
  rename,
  reorder,
  children,
}: {
  title: string;
  filled: boolean;
  defaultOpen?: boolean;
  headerRight?: ReactNode;
  rename?: RenameControl;
  reorder?: ReorderControl;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState("");

  function startEdit() {
    setDraft(rename?.customHeading ?? "");
    setEditing(true);
  }
  function save() {
    const value = draft.trim();
    rename?.onRename(value ? value : null);
    setEditing(false);
  }

  return (
    <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm">
      <div className="flex items-center">
        {editing ? (
          <div className="flex flex-1 items-center gap-2 p-2">
            {/* eslint-disable-next-line jsx-a11y/no-autofocus */}
            <input
              autoFocus
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") save();
                if (e.key === "Escape") setEditing(false);
              }}
              placeholder={rename?.defaultHeading}
              aria-label="Section heading"
              className="min-h-[44px] w-full flex-1 rounded-lg border border-zinc-300 px-3 text-sm"
            />
            <button
              type="button"
              onClick={save}
              className="min-h-[44px] shrink-0 rounded-lg bg-zinc-900 px-3 text-sm font-medium text-white"
            >
              Save
            </button>
            <button
              type="button"
              onClick={() => setEditing(false)}
              aria-label="Cancel rename"
              className="min-h-[44px] shrink-0 rounded-lg border border-zinc-300 px-3 text-sm"
            >
              Cancel
            </button>
          </div>
        ) : (
          <>
            <button
              type="button"
              onClick={() => setOpen((o) => !o)}
              aria-expanded={open}
              className="flex min-h-[52px] flex-1 items-center gap-3 px-4 text-left"
            >
              <svg
                viewBox="0 0 20 20"
                fill="currentColor"
                className={`h-4 w-4 shrink-0 text-zinc-400 transition-transform duration-200 ${open ? "rotate-90" : ""}`}
              >
                <path d="M7 5l6 5-6 5z" />
              </svg>
              <span className="flex-1 font-medium text-zinc-800">{title}</span>
              {filled && (
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-green-100 text-green-700">
                  <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
                    <path
                      fillRule="evenodd"
                      d="M16.7 5.3a1 1 0 010 1.4l-7.5 7.5a1 1 0 01-1.4 0L3.3 9.7a1 1 0 111.4-1.4l3.3 3.3 6.8-6.8a1 1 0 011.4 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                </span>
              )}
            </button>

            {(rename || reorder || headerRight) && (
              <div className="flex items-center pr-1.5">
                {rename && (
                  <IconButton label="Rename section" onClick={startEdit}>
                    <path d="M13.6 2.9a1.5 1.5 0 012.1 2.1l-8.4 8.4-2.8.7.7-2.8 8.4-8.4z" />
                  </IconButton>
                )}
                {reorder && (
                  <>
                    <IconButton
                      label="Move section up"
                      onClick={reorder.onMoveUp}
                      disabled={!reorder.canMoveUp}
                    >
                      <path d="M10 5l5 6H5z" />
                    </IconButton>
                    <IconButton
                      label="Move section down"
                      onClick={reorder.onMoveDown}
                      disabled={!reorder.canMoveDown}
                    >
                      <path d="M10 15l-5-6h10z" />
                    </IconButton>
                  </>
                )}
                {headerRight}
              </div>
            )}
          </>
        )}
      </div>

      <div
        className="grid transition-all duration-200 ease-out"
        style={{ gridTemplateRows: open ? "1fr" : "0fr" }}
      >
        <div className="overflow-hidden">
          <div className="px-4 pb-4 pt-1">{children}</div>
        </div>
      </div>
    </div>
  );
}

/** 44px icon button used for the rename/move affordances. */
function IconButton({
  label,
  onClick,
  disabled = false,
  children,
}: {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      className="flex h-11 w-11 items-center justify-center rounded-lg text-zinc-500 disabled:opacity-30"
    >
      <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
        {children}
      </svg>
    </button>
  );
}
