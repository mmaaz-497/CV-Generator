import type { CSSProperties } from "react";
import { FONT_SIZE_BASE } from "@/lib/constants";
import { isSectionEmpty } from "@/lib/empty-checks";
import type { CVDocument } from "@/lib/cv-types";
import { PhotoFrame } from "./shared/PhotoFrame";
import { SectionBlock } from "./shared/SectionBody";
import { CONTACT_FIELDS, DETAIL_FIELDS, MetaList } from "./shared/SidebarMeta";
import { planSidebarLayout } from "./shared/regions";

/** Elegant: dark full-height accent sidebar (photo, contact, skills) beside a serif
 *  main column. Photo-forward but works photo-less. Sidebar is page-1-only when
 *  content overflows, per the validated R5 recipe. `print-color-adjust: exact` keeps
 *  the dark sidebar (and its white text) visible even if "Background graphics" is off. */
export function ElegantTemplate({ cv }: { cv: CVDocument }) {
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
      <h1 className="name">{p.fullName.trim() || "Your Name"}</h1>
      <MetaList info={p} fields={CONTACT_FIELDS} heading="Contact" />
      {sidebar.map((s) => (
        <SectionBlock key={s.id} section={s} />
      ))}
      <MetaList info={p} fields={DETAIL_FIELDS} heading="Personal" />
    </aside>
  );

  return (
    <div className="tpl-elegant" style={rootStyle}>
      <style>{ELEGANT_CSS}</style>

      <div className={twoRegion ? "page1" : "sheet"}>
        {Sidebar}
        <main className="main">
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

const ELEGANT_CSS = `
.tpl-elegant {
  width: 100%;
  box-sizing: border-box;
  background: #fff;
  color: #262626;
  font-family: Georgia, "Times New Roman", serif;
  font-size: var(--fs-base);
  line-height: 1.45;
}
.tpl-elegant .page1,
.tpl-elegant .sheet {
  display: grid;
  grid-template-columns: 68mm 1fr;
}
.tpl-elegant .page1 {
  height: 297mm;
  overflow: hidden;
  break-after: page;
  page-break-after: always;
}
.tpl-elegant .sheet { min-height: 297mm; }

.tpl-elegant .side {
  background: color-mix(in srgb, var(--accent) 82%, #000);
  color: #f4f4f5;
  padding: 13mm 8mm;
  -webkit-print-color-adjust: exact;
  print-color-adjust: exact;
}
.tpl-elegant .photo {
  width: 40mm;
  height: 40mm;
  border-radius: 50%;
  object-fit: cover;
  border: 0.8mm solid rgba(255, 255, 255, 0.6);
  display: block;
  margin: 0 auto 5mm;
}
.tpl-elegant .name {
  font-size: 1.55em;
  font-weight: 700;
  text-align: center;
  letter-spacing: 0.02em;
  margin: 0 0 6mm;
}
.tpl-elegant .main { padding: 13mm 14mm; min-width: 0; }
.tpl-elegant .rest { padding: 8mm 14mm 13mm; }

.tpl-elegant .cv-section,
.tpl-elegant .cv-meta { margin-bottom: 5mm; }
.tpl-elegant .cv-heading {
  font-size: 1.1em;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--accent);
  margin: 0 0 2.5mm;
}
.tpl-elegant .side .cv-heading {
  color: #fff;
  font-size: 0.95em;
  border-bottom: 0.3mm solid rgba(255, 255, 255, 0.4);
  padding-bottom: 1mm;
}

.tpl-elegant .cv-text { margin: 0; text-align: justify; }
.tpl-elegant .cv-skills { list-style: none; margin: 0; padding: 0; }
.tpl-elegant .side .cv-skill {
  font-size: 0.95em;
  padding: 0.7mm 0;
  border-bottom: 0.2mm solid rgba(255, 255, 255, 0.18);
}

.tpl-elegant .cv-entry { margin-bottom: 3.5mm; }
.tpl-elegant .cv-entry-head { display: flex; flex-direction: column; }
.tpl-elegant .cv-entry-title { font-weight: 700; }
.tpl-elegant .cv-entry-subtitle { font-style: italic; color: #52525b; }
.tpl-elegant .cv-entry-period {
  font-size: 0.9em;
  color: var(--accent);
  letter-spacing: 0.03em;
}
.tpl-elegant .cv-entry-detail { margin: 0.8mm 0 0; }

.tpl-elegant .cv-meta-list { list-style: none; margin: 0; padding: 0; }
.tpl-elegant .cv-meta-row { display: flex; flex-direction: column; margin-bottom: 2mm; }
.tpl-elegant .cv-meta-label {
  font-size: 0.78em;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: rgba(255, 255, 255, 0.65);
}
.tpl-elegant .cv-meta-value { font-size: 0.95em; word-break: break-word; }
`;
