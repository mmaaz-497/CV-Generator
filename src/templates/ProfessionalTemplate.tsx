import type { CSSProperties } from "react";
import { FONT_SIZE_BASE } from "@/lib/constants";
import { isSectionEmpty } from "@/lib/empty-checks";
import type { CVDocument } from "@/lib/cv-types";
import { PhotoFrame } from "./shared/PhotoFrame";
import { SectionBlock } from "./shared/SectionBody";
import { CONTACT_FIELDS, DETAIL_FIELDS, MetaList } from "./shared/SidebarMeta";
import { planSidebarLayout } from "./shared/regions";

/** Professional: light accent sidebar (photo, contact, skills) + main column
 *  (objective, education, experience). Subtle single accent. Sidebar is page-1-only
 *  when content overflows, per the validated R5 recipe. */
export function ProfessionalTemplate({ cv }: { cv: CVDocument }) {
  const p = cv.personalInfo;
  const visible = cv.sections.filter((s) => !isSectionEmpty(s));
  const { sidebar, page1Main, rest, twoRegion } = planSidebarLayout(visible);
  const rootStyle = {
    "--accent": cv.style.accentColor,
    "--fs-base": FONT_SIZE_BASE[cv.style.fontSizeLevel],
  } as CSSProperties;

  const Sidebar = (
    <aside className="side">
      <PhotoFrame photo={cv.photo} className="photo" />
      <MetaList info={p} fields={CONTACT_FIELDS} heading="Contact" />
      {sidebar.map((s) => (
        <SectionBlock key={s.id} section={s} />
      ))}
      <MetaList info={p} fields={DETAIL_FIELDS} heading="Personal" />
    </aside>
  );

  const MainHead = (
    <header className="head">
      <h1 className="name">{p.fullName.trim() || "Your Name"}</h1>
    </header>
  );

  return (
    <div className="tpl-professional" style={rootStyle}>
      <style>{PRO_CSS}</style>

      <div className={twoRegion ? "page1" : "sheet"}>
        {Sidebar}
        <main className="main">
          {MainHead}
          {page1Main.map((s) => (
            <SectionBlock key={s.id} section={s} />
          ))}
        </main>
      </div>

      {twoRegion && rest.length > 0 && (
        <div className="rest">
          {rest.map((s) => (
            <SectionBlock key={s.id} section={s} />
          ))}
        </div>
      )}
    </div>
  );
}

const PRO_CSS = `
.tpl-professional {
  width: 100%;
  box-sizing: border-box;
  background: #fff;
  color: #1f2937;
  font-family: Arial, "Helvetica Neue", Helvetica, sans-serif;
  font-size: var(--fs-base);
  line-height: 1.42;
}
.tpl-professional .page1,
.tpl-professional .sheet {
  display: grid;
  grid-template-columns: 62mm 1fr;
}
.tpl-professional .page1 {
  height: 297mm;
  overflow: hidden;
  break-after: page;
  page-break-after: always;
}
.tpl-professional .sheet { min-height: 297mm; }

.tpl-professional .side {
  background: color-mix(in srgb, var(--accent) 10%, #fff);
  border-right: 0.6mm solid var(--accent);
  padding: 12mm 7mm;
  -webkit-print-color-adjust: exact;
  print-color-adjust: exact;
}
.tpl-professional .photo {
  width: 34mm;
  height: 40mm;
  object-fit: cover;
  border: 1pt solid var(--accent);
  display: block;
  margin: 0 auto 5mm;
}
.tpl-professional .main { padding: 12mm 13mm; min-width: 0; }
.tpl-professional .rest { padding: 8mm 13mm 12mm; }

.tpl-professional .head {
  border-bottom: 0.6mm solid var(--accent);
  padding-bottom: 3mm;
  margin-bottom: 5mm;
}
.tpl-professional .name {
  font-size: 1.9em;
  font-weight: 700;
  letter-spacing: 0.01em;
  color: var(--accent);
  margin: 0;
}

.tpl-professional .cv-section { margin-bottom: 5mm; }
.tpl-professional .cv-heading {
  font-size: 1.05em;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--accent);
  margin: 0 0 2.5mm;
}
.tpl-professional .side .cv-heading {
  font-size: 0.95em;
  border-bottom: 0.3mm solid color-mix(in srgb, var(--accent) 40%, #fff);
  padding-bottom: 1mm;
}
.tpl-professional .side .cv-section,
.tpl-professional .side .cv-meta { margin-bottom: 5mm; }

.tpl-professional .cv-text { margin: 0; text-align: justify; }
.tpl-professional .cv-skills { list-style: none; margin: 0; padding: 0; }
.tpl-professional .side .cv-skill {
  font-size: 0.95em;
  padding: 0.6mm 0;
  border-bottom: 0.2mm solid color-mix(in srgb, var(--accent) 20%, #fff);
}
.tpl-professional .main .cv-skills { display: flex; flex-wrap: wrap; gap: 1.5mm; }
.tpl-professional .main .cv-skill {
  background: color-mix(in srgb, var(--accent) 12%, #fff);
  border-radius: 1mm;
  padding: 0.8mm 2mm;
  font-size: 0.9em;
}

.tpl-professional .cv-entry { margin-bottom: 3mm; }
.tpl-professional .cv-entry-head {
  display: flex;
  justify-content: space-between;
  gap: 4mm;
  align-items: baseline;
}
.tpl-professional .cv-entry-headings { display: flex; flex-direction: column; }
.tpl-professional .cv-entry-title { font-weight: 700; }
.tpl-professional .cv-entry-subtitle { font-size: 0.95em; color: #4b5563; }
.tpl-professional .cv-entry-period {
  white-space: nowrap;
  font-size: 0.9em;
  color: var(--accent);
  font-weight: 600;
}
.tpl-professional .cv-entry-detail { margin: 0.8mm 0 0; }

.tpl-professional .cv-meta-list { list-style: none; margin: 0; padding: 0; }
.tpl-professional .cv-meta-row { display: flex; flex-direction: column; margin-bottom: 2mm; }
.tpl-professional .cv-meta-label {
  font-size: 0.78em;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: color-mix(in srgb, var(--accent) 70%, #000);
}
.tpl-professional .cv-meta-value { font-size: 0.95em; word-break: break-word; }
`;
