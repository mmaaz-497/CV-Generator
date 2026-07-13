import { computePages, PAGE_H } from "./paginate";

/**
 * Generates an A4 PDF from the rendered CV preview and saves it straight to the
 * device — no print dialog (contract 2; validated in the T005 spike).
 *
 * The libraries are loaded via dynamic `import()` so they are code-split out of
 * first paint and only fetched when the shopkeeper actually taps Download
 * (constitution v1.1.0 scoped export-library exception; ADR-0003). Everything runs
 * on-device: html-to-image serialises the DOM to an in-memory SVG and paints it to
 * a canvas; jsPDF assembles the pages into a Blob saved via `<a download>`. Nothing
 * is transmitted (Principle II).
 *
 * We render from an OFF-SCREEN CLONE of the `.a4` element at natural A4 size, so the
 * preview's on-screen fit-to-width `transform: scale(...)` neither shrinks the output
 * nor skews page measurements — and the visible preview never flickers.
 *
 * Throws on failure so the caller can show the inline error + Print fallback; no
 * partial file is written (jsPDF only saves on the final `.save()`).
 */
const A4_W_PX = 794; // 210mm @96dpi
const SCALE = 2; // ~192dpi — crisp enough for print/share, bounded size & memory

export async function generateCvPdf(a4El: HTMLElement, filename: string): Promise<void> {
  const [{ toCanvas }, { jsPDF }] = await Promise.all([
    import("html-to-image"),
    import("jspdf"),
  ]);

  // The offscreen positioning MUST live on a wrapper, never on the capture root:
  // html-to-image copies the root's computed style into the <foreignObject> it
  // rasterises, so a `position:fixed; left:-10000px` root would be laid out right
  // back off the SVG viewport and the canvas would come out blank.
  const holder = document.createElement("div");
  holder.style.cssText =
    `position:fixed;left:-10000px;top:0;width:${A4_W_PX}px;margin:0;background:#ffffff;`;

  const clone = a4El.cloneNode(true) as HTMLElement;
  clone.style.transform = "none";
  clone.style.margin = "0";

  // Inserting the clone re-triggers the template's `.tpl-fade` entry animation, and
  // html-to-image bakes each node's CURRENT computed style into the SVG — capturing a
  // half-faded CV (~35% opacity, colours washed out). Freeze animations so we always
  // capture the settled end state, exactly as `@media print` already does for `.tpl-fade`.
  clone.style.animation = "none";
  for (const el of clone.querySelectorAll<HTMLElement>("*")) {
    el.style.animation = "none";
    el.style.transition = "none";
  }

  holder.appendChild(clone);
  document.body.appendChild(holder);

  try {
    // Let layout settle before measuring/rasterising.
    await new Promise((r) => requestAnimationFrame(() => r(null)));

    const full = await toCanvas(clone, {
      pixelRatio: SCALE,
      backgroundColor: "#ffffff",
      // Applied after the computed-style copy above — keeps the capture root at the
      // foreignObject origin, at natural A4, whatever styles it inherits.
      style: { transform: "none", position: "static", left: "auto", top: "auto", margin: "0" },
    });
    const pages = computePages(clone);

    const doc = new jsPDF({ unit: "mm", format: "a4" });
    const pageW = Math.round(A4_W_PX * SCALE);
    const pageH = Math.round(PAGE_H * SCALE);

    pages.forEach((band, i) => {
      const pageCanvas = document.createElement("canvas");
      pageCanvas.width = pageW;
      pageCanvas.height = pageH;
      const ctx = pageCanvas.getContext("2d");
      if (!ctx) throw new Error("Canvas context unavailable");
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, pageW, pageH);
      const bandH = Math.min(pageH, Math.max(1, Math.round((band.end - band.start) * SCALE)));
      ctx.drawImage(full, 0, Math.round(band.start * SCALE), full.width, bandH, 0, 0, pageW, bandH);
      const img = pageCanvas.toDataURL("image/jpeg", 0.9);
      if (i > 0) doc.addPage("a4", "portrait");
      doc.addImage(img, "JPEG", 0, 0, 210, 297);
    });

    doc.save(filename);
  } finally {
    holder.remove();
  }
}
