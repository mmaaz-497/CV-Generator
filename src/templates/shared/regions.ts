import { isEntryEmpty } from "@/lib/empty-checks";
import type { Section, SectionId } from "@/lib/cv-types";

/** Short "meta" sections that live in a template sidebar column. */
const SIDEBAR_IDS = new Set<SectionId>(["skills", "languages"]);

/** Rough line budget that fits in the main column beside a sidebar on one A4 page.
 *  Only used to decide single- vs two-region layout — the actual pagination is done
 *  by the browser + `break-inside: avoid`. Conservative on purpose (under-fill is
 *  safe; over-fill would clip inside the fixed-height page-1 grid). */
const PAGE_BUDGET = 42;

/** Coarse height estimate for a section, in "lines". No DOM measurement needed. */
function sectionLines(s: Section): number {
  let n = 2; // heading + spacing
  const c = s.content;
  if (c.kind === "text") {
    n += Math.ceil((c.text.trim().length || 1) / 55);
  } else if (c.kind === "skills") {
    n += Math.ceil(c.items.filter((i) => i.trim()).length / 3);
  } else {
    for (const e of c.entries) {
      if (isEntryEmpty(e)) continue;
      n += 2;
      if (e.detail.trim()) n += Math.ceil(e.detail.trim().length / 60);
    }
  }
  return n;
}

export interface SidebarLayout {
  /** Meta sections for the sidebar column (in custom order). */
  sidebar: Section[];
  /** Main-column sections that sit beside the sidebar on page 1. */
  page1Main: Section[];
  /** Overflow sections that continue full-width on page 2+ (empty when single-region). */
  rest: Section[];
  /** True when content genuinely overflows one page (validated R5 two-region recipe). */
  twoRegion: boolean;
}

/**
 * Splits already-visible (non-empty) sections into a sidebar layout, implementing
 * the R5 sidebar page-1-only strategy. Short CVs stay single-region (safe, no
 * clipping, sidebar fills the page via `min-height`). Genuinely long CVs use the
 * two-region path: a fixed-height page-1 grid + a full-width continuation region.
 */
export function planSidebarLayout(visible: Section[]): SidebarLayout {
  const sidebar = visible.filter((s) => SIDEBAR_IDS.has(s.id));
  const main = visible.filter((s) => !SIDEBAR_IDS.has(s.id));

  const total = main.reduce((n, s) => n + sectionLines(s), 0);
  if (total <= PAGE_BUDGET) {
    return { sidebar, page1Main: main, rest: [], twoRegion: false };
  }

  // Greedy fill of page 1; sections that don't fit continue full-width on page 2+.
  const page1Main: Section[] = [];
  const rest: Section[] = [];
  let used = 0;
  for (const s of main) {
    const cost = sectionLines(s);
    if (rest.length === 0 && used + cost <= PAGE_BUDGET) {
      page1Main.push(s);
      used += cost;
    } else {
      rest.push(s);
    }
  }

  // If nothing fit on page 1 (a single huge leading section), fall back to
  // single-region flow so page 1 is never sidebar-only and content is never clipped.
  if (page1Main.length === 0) {
    return { sidebar, page1Main: main, rest: [], twoRegion: false };
  }
  return { sidebar, page1Main, rest, twoRegion: true };
}
