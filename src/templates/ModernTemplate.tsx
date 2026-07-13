import type { CSSProperties } from "react";
import { FONT_SIZE_BASE } from "@/lib/constants";
import { isSectionEmpty } from "@/lib/empty-checks";
import type { CVDocument, SectionId } from "@/lib/cv-types";
import { ContactLine } from "./shared/ContactLine";
import { PhotoFrame } from "./shared/PhotoFrame";
import { SectionBlock } from "./shared/SectionBody";
import { DETAIL_FIELDS, MetaList } from "./shared/SidebarMeta";

/** Short meta sections go in the narrow right column; the rest in the wide left. */
const SIDE_IDS = new Set<SectionId>(["skills", "languages"]);

/** Modern: full-bleed accent header band (name + photo) over a clean two-column body.
 *  No decorative full-height column, so it flows safely onto page 2 when long. */
export function ModernTemplate({ cv }: { cv: CVDocument }) {
  const p = cv.personalInfo;
  const visible = cv.sections.filter((s) => !isSectionEmpty(s));
  const wide = visible.filter((s) => !SIDE_IDS.has(s.id));
  const narrow = visible.filter((s) => SIDE_IDS.has(s.id));
  const rootStyle = {
    "--accent": cv.style.accentColor,
    "--fs-base": FONT_SIZE_BASE[cv.style.fontSizeLevel],
  } as CSSProperties;

  return (
    <div className="tpl-modern" style={rootStyle}>
      <style>{MODERN_CSS}</style>

      <header className="band">
        <PhotoFrame photo={cv.photo} className="photo" />
        <div className="band-text">
          <h1 className="name">{p.fullName.trim() || "Your Name"}</h1>
          <ContactLine info={p} className="contact" />
        </div>
      </header>

      <div className="body">
        <div className="col-main">
          {wide.map((s) => (
            <SectionBlock key={s.id} section={s} />
          ))}
        </div>
        <div className="col-side">
          {narrow.map((s) => (
            <SectionBlock key={s.id} section={s} />
          ))}
          <MetaList info={p} fields={DETAIL_FIELDS} heading="Personal" />
        </div>
      </div>
    </div>
  );
}

const MODERN_CSS = `
.tpl-modern {
  width: 100%;
  min-height: 297mm;
  box-sizing: border-box;
  background: #fff;
  color: #1f2937;
  font-family: "Segoe UI", Arial, Helvetica, sans-serif;
  font-size: var(--fs-base);
  line-height: 1.42;
}
.tpl-modern .band {
  background: var(--accent);
  color: #fff;
  display: flex;
  align-items: center;
  gap: 6mm;
  padding: 11mm 14mm;
  -webkit-print-color-adjust: exact;
  print-color-adjust: exact;
}
.tpl-modern .photo {
  width: 28mm;
  height: 28mm;
  border-radius: 50%;
  object-fit: cover;
  border: 0.8mm solid rgba(255, 255, 255, 0.85);
  flex-shrink: 0;
}
.tpl-modern .name {
  font-size: 2em;
  font-weight: 700;
  letter-spacing: 0.01em;
  margin: 0 0 1.5mm;
}
.tpl-modern .contact { font-size: 0.95em; opacity: 0.95; }

.tpl-modern .body {
  display: grid;
  grid-template-columns: 1.7fr 1fr;
  gap: 9mm;
  padding: 9mm 14mm 12mm;
  align-items: start;
}
.tpl-modern .col-main { min-width: 0; }
.tpl-modern .col-side { min-width: 0; }

.tpl-modern .cv-section,
.tpl-modern .cv-meta { margin-bottom: 5mm; }
.tpl-modern .cv-heading {
  font-size: 1.05em;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--accent);
  border-bottom: 0.4mm solid color-mix(in srgb, var(--accent) 35%, #fff);
  padding-bottom: 1mm;
  margin: 0 0 2.5mm;
}

.tpl-modern .cv-text { margin: 0; text-align: justify; }
.tpl-modern .cv-skills { list-style: none; margin: 0; padding: 0; display: flex; flex-wrap: wrap; gap: 1.5mm; }
.tpl-modern .cv-skill {
  background: color-mix(in srgb, var(--accent) 12%, #fff);
  color: color-mix(in srgb, var(--accent) 75%, #000);
  border-radius: 1mm;
  padding: 0.8mm 2mm;
  font-size: 0.9em;
}

.tpl-modern .cv-entry { margin-bottom: 3mm; }
.tpl-modern .cv-entry-head {
  display: flex;
  justify-content: space-between;
  gap: 4mm;
  align-items: baseline;
}
.tpl-modern .cv-entry-headings { display: flex; flex-direction: column; }
.tpl-modern .cv-entry-title { font-weight: 700; }
.tpl-modern .cv-entry-subtitle { font-size: 0.95em; color: #4b5563; }
.tpl-modern .cv-entry-period {
  white-space: nowrap;
  font-size: 0.9em;
  color: var(--accent);
  font-weight: 600;
}
.tpl-modern .cv-entry-detail { margin: 0.8mm 0 0; }

.tpl-modern .cv-meta-list { list-style: none; margin: 0; padding: 0; }
.tpl-modern .cv-meta-row { display: flex; flex-direction: column; margin-bottom: 2mm; }
.tpl-modern .cv-meta-label {
  font-size: 0.78em;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: #6b7280;
}
.tpl-modern .cv-meta-value { font-size: 0.95em; word-break: break-word; }
`;
