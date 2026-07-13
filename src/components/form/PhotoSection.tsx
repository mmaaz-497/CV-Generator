"use client";

import { memo, useRef, useState, type Dispatch } from "react";
import type { CVAction } from "@/lib/cv-types";
import { processPhoto } from "@/lib/photo";

/** Optional customer photo (FR-009). `<input type="file" accept="image/*">` lets
 *  Android offer camera or gallery. The file is downscaled in-browser to a JPEG
 *  data URL and never transmitted (constitution II). Decode failures keep the prior
 *  photo and show an inline retry message (contract 5). Memoized on `photo`. */
export const PhotoSection = memo(function PhotoSection({
  photo,
  dispatch,
}: {
  photo: string | null;
  dispatch: Dispatch<CVAction>;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function onPick(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = ""; // allow re-picking the same file
    if (!file) return;
    setBusy(true);
    setError("");
    try {
      const dataUrl = await processPhoto(file);
      dispatch({ type: "SET_PHOTO", dataUrl });
    } catch {
      setError("Couldn't load photo, try another.");
    } finally {
      setBusy(false);
    }
  }

  function remove() {
    dispatch({ type: "SET_PHOTO", dataUrl: null });
    setError("");
  }

  return (
    <div className="grid gap-3">
      <div className="flex items-center gap-4">
        {photo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={photo}
            alt="Customer"
            className="h-20 w-20 rounded-lg border border-zinc-200 object-cover"
          />
        ) : (
          <div className="flex h-20 w-20 items-center justify-center rounded-lg border border-dashed border-zinc-300 text-xs text-zinc-400">
            No photo
          </div>
        )}

        <div className="flex flex-1 flex-wrap gap-2">
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            onChange={onPick}
            className="hidden"
          />
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={busy}
            className="min-h-[44px] rounded-lg bg-zinc-900 px-4 text-sm font-medium text-white active:bg-zinc-800 disabled:opacity-50"
          >
            {busy ? "Loading…" : photo ? "Change photo" : "Add photo"}
          </button>
          {photo && (
            <button
              type="button"
              onClick={remove}
              className="min-h-[44px] rounded-lg border border-zinc-300 px-4 text-sm text-zinc-700"
            >
              Remove
            </button>
          )}
        </div>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
});
