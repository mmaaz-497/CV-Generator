"use client";

/** Opens the browser print dialog to save the CV as an A4 PDF (FR-021).
 *  The preview is already an A4-proportioned page; print CSS removes app chrome. */
export function PdfButton() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="min-h-[44px] rounded-lg bg-zinc-900 px-4 font-semibold text-white active:bg-zinc-800"
    >
      Download PDF
    </button>
  );
}
