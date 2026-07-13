"use client";

import { useCV } from "@/lib/cv-context";
import { SAMPLE_CV } from "@/lib/sample-data";
import { TEMPLATES } from "@/templates/registry";

const A4_W = 794; // 210mm @ 96dpi
const THUMB_W = 152;
const THUMB_H = 210;
const SCALE = THUMB_W / A4_W;

/** Opening screen: live thumbnails of each template rendered from real components
 *  (plan R6). Tapping one selects it and opens the form (FR-001/FR-002). */
export function GalleryScreen() {
  const { dispatch } = useCV();

  return (
    <main className="mx-auto flex w-full max-w-xl flex-1 flex-col px-4 py-6">
      <div className="mb-5 flex items-center gap-3">
        {/* Bundled asset — no network fetch, no customer data (constitution II) */}
        <img
          src="/logo.png"
          alt=""
          width={44}
          height={44}
          className="h-11 w-11 shrink-0"
        />
        <div>
          <p className="text-base font-semibold leading-tight text-zinc-900">CV Maker</p>
          <p className="text-xs leading-tight text-zinc-500">Resume builder · A4 PDF</p>
        </div>
      </div>

      <h1 className="text-xl font-semibold text-zinc-900">Choose a CV template</h1>
      <p className="mb-5 mt-1 text-sm text-zinc-500">
        Tap a design to start. You can switch it later while previewing.
      </p>

      <div className="grid grid-cols-2 gap-4">
        {TEMPLATES.map((t) => {
          const Tpl = t.component;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => {
                dispatch({ type: "SET_TEMPLATE", templateId: t.id });
                dispatch({ type: "SET_SCREEN", screen: "form" });
              }}
              className="flex flex-col items-center gap-2"
            >
              <div
                className="overflow-hidden rounded-lg border border-zinc-300 bg-white shadow-sm"
                style={{ width: THUMB_W, height: THUMB_H }}
              >
                <div
                  aria-hidden
                  className="pointer-events-none"
                  style={{
                    width: A4_W,
                    transform: `scale(${SCALE})`,
                    transformOrigin: "top left",
                  }}
                >
                  <Tpl cv={SAMPLE_CV} />
                </div>
              </div>
              <span className="text-sm font-medium text-zinc-700">{t.name}</span>
            </button>
          );
        })}
      </div>
    </main>
  );
}
