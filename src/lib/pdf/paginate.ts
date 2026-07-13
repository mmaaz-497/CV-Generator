/**
 * Composes the print-matching page list for the download PDF (validated in the
 * T005 spike; research R4). Given the rendered `.a4` element, returns the vertical
 * bands (in CSS px, relative to the element top) that become one A4 page each.
 *
 * Rules that reproduce the print path's breaks:
 * - Sidebar templates render a fixed-height `.page1` block (feature-001 R5) — that
 *   block is exactly page 1.
 * - Remaining content is packed by cutting only at a `.cv-entry` top, choosing the
 *   furthest boundary that still keeps the page within one A4 height — so a page is
 *   never taller than A4 and a `.cv-entry` is never split (FR-005/SC-004).
 */
export const PAGE_H = 1123; // 297mm @96dpi

export interface PageBand {
  start: number;
  end: number;
}

export function computePages(a4El: HTMLElement): PageBand[] {
  const total = a4El.scrollHeight;
  const top = a4El.getBoundingClientRect().top;
  const pages: PageBand[] = [];

  const page1 = a4El.querySelector<HTMLElement>(".page1");
  let contentStart = 0;
  if (page1) {
    const h = page1.offsetHeight;
    pages.push({ start: 0, end: h });
    contentStart = h;
  }

  const entryTops = [...a4El.querySelectorAll<HTMLElement>(".cv-entry")]
    .map((e) => e.getBoundingClientRect().top - top)
    .filter((y) => y >= contentStart - 1)
    .sort((a, b) => a - b);

  let pageStart = contentStart;
  let guard = 0;
  while (total - pageStart > PAGE_H + 1 && guard++ < 60) {
    const limit = pageStart + PAGE_H;
    const candidates = entryTops.filter((y) => y > pageStart + 1 && y <= limit);
    const cut = candidates.length ? Math.max(...candidates) : limit;
    pages.push({ start: pageStart, end: cut });
    pageStart = cut;
  }
  pages.push({ start: pageStart, end: total });
  return pages;
}
