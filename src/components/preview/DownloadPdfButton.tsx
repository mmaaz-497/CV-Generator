"use client";

import { useState } from "react";
import { useCV } from "@/lib/cv-context";
import { pdfFilename } from "@/lib/pdf/filename";
import { generateCvPdf } from "@/lib/pdf/generate";

/** One-tap direct PDF download (US1, FR-002). Generates an A4 PDF from the live
 *  preview and saves it straight to the device — no print dialog. Statically
 *  importing `generateCvPdf` is fine: the heavy libraries live behind a dynamic
 *  `import()` inside it, so they load only on the first tap (constitution v1.1.0).
 *  Basic in-flight disable here; the full spinner/error UX lands in US3. */
export function DownloadPdfButton({ getA4 }: { getA4: () => HTMLElement | null }) {
  const { cv } = useCV();
  const [busy, setBusy] = useState(false);

  const onClick = async () => {
    if (busy) return;
    const el = getA4();
    if (!el) return;
    setBusy(true);
    try {
      await generateCvPdf(el, pdfFilename(cv.personalInfo.fullName));
    } catch {
      // Graceful inline error + Print fallback arrives in US3.
    } finally {
      setBusy(false);
    }
  };

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={busy}
      aria-busy={busy}
      className="min-h-[44px] rounded-lg bg-zinc-900 px-4 font-semibold text-white active:bg-zinc-800 disabled:opacity-60"
    >
      {busy ? "Preparing…" : "Download PDF"}
    </button>
  );
}
