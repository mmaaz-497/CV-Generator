"use client";

import { useEffect, useRef, useState } from "react";
import { useCV } from "@/lib/cv-context";
import { TEMPLATES } from "@/templates/registry";
import { DownloadPdfButton } from "@/components/preview/DownloadPdfButton";
import { TemplateSwitcher } from "@/components/preview/TemplateSwitcher";
import { ColorPalette } from "@/components/preview/ColorPalette";
import { FontSizeToggle } from "@/components/preview/FontSizeToggle";
import { NewCvButton } from "@/components/NewCvButton";

const A4_W = 794; // 210mm @ 96dpi

/** Renders the active template inside an A4 page, scaled to fit the screen width.
 *  The scale is screen-only; print CSS resets it so the PDF is true A4 (FR-021). */
export function PreviewScreen() {
  const { cv, dispatch } = useCV();
  const template = TEMPLATES.find((t) => t.id === cv.style.templateId) ?? TEMPLATES[0];
  const Tpl = template.component;

  const wrapRef = useRef<HTMLDivElement>(null);
  const a4Ref = useRef<HTMLDivElement>(null);
  const [box, setBox] = useState({ scale: 1, height: 1123 });

  useEffect(() => {
    const recalc = () => {
      const avail = wrapRef.current?.clientWidth ?? A4_W;
      const scale = Math.min(1, avail / A4_W);
      const height = (a4Ref.current?.scrollHeight ?? 1123) * scale;
      setBox({ scale, height });
    };
    recalc();
    const ro = new ResizeObserver(recalc);
    if (a4Ref.current) ro.observe(a4Ref.current);
    window.addEventListener("resize", recalc);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", recalc);
    };
  }, [cv]);

  return (
    <div className="flex flex-1 flex-col">
      <header className="no-print sticky top-0 z-10 flex items-center gap-3 border-b border-zinc-200 bg-white px-4 py-3">
        <button
          type="button"
          onClick={() => dispatch({ type: "SET_SCREEN", screen: "form" })}
          className="min-h-[44px] rounded-lg border border-zinc-300 px-3 text-sm"
        >
          ← Edit
        </button>
        <div className="flex-1" />
        <NewCvButton />
        <DownloadPdfButton getA4={() => a4Ref.current} />
      </header>

      <div className="no-print flex flex-col gap-3 border-b border-zinc-200 bg-white px-4 py-3">
        <TemplateSwitcher />
        <div className="flex flex-wrap items-start gap-x-8 gap-y-3">
          <ColorPalette />
          <FontSizeToggle />
        </div>
      </div>

      <div className="preview-surface flex-1 overflow-auto bg-zinc-200 p-4">
        <div ref={wrapRef} className="mx-auto" style={{ maxWidth: A4_W }}>
          <div className="a4-scaler" style={{ height: box.height }}>
            <div
              ref={a4Ref}
              className="a4"
              style={{ transform: `scale(${box.scale})`, transformOrigin: "top left" }}
            >
              <div key={cv.style.templateId} className="tpl-fade">
                <Tpl cv={cv} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
