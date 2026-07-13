import type { CSSProperties } from "react";
import { FONT_SIZE_BASE } from "@/lib/constants";
import { isSectionEmpty } from "@/lib/empty-checks";
import type { CVDocument } from "@/lib/cv-types";
import { ContactLine } from "./shared/ContactLine";
import { PhotoFrame } from "./shared/PhotoFrame";
import { SectionBlock } from "./shared/SectionBody";

/** Minimal: ultra-simple single column, thin dividers, tight spacing for maximum
 *  text density. Accent used only as a hairline and heading tint. Flows cleanly
 *  onto page 2 (no decorative regions). */
export function MinimalTemplate({ cv }: { cv: CVDocument }) {
  const p = cv.personalInfo;
  const visible = cv.sections.filter((s) => !isSectionEmpty(s));
  const rootStyle = {
    "--accent": cv.style.accentColor,
    "--fs-base": FONT_SIZE_BASE[cv.style.fontSizeLevel],
  } as CSSProperties;

  return (
    <div className="tpl-minimal" style={rootStyle}>
      <style>{MINIMAL_CSS}</style>

      <header className="head">
        <div className="head-text">
          <h1 className="name">{p.fullName.trim() || "Your Name"}</h1>
          <ContactLine info={p} className="contact" separator="  ·  " />
        </div>
        <PhotoFrame photo={cv.photo} className="photo" />
      </header>

      {visible.map((s) => (
        <SectionBlock key={s.id} section={s} />
      ))}
    </div>
  );
}

const MINIMAL_CSS = `
.tpl-minimal {
  width: 100%;
  min-height: 297mm;
  box-sizing: border-box;
  padding: 12mm 14mm;
  background: #fff;
  color: #18181b;
  font-family: "Helvetica Neue", Arial, sans-serif;
  font-size: var(--fs-base);
  line-height: 1.34;
}
.tpl-minimal .head {
  display: flex;
  align-items: center;
  gap: 5mm;
  border-bottom: 0.5mm solid var(--accent);
  padding-bottom: 2.5mm;
  margin-bottom: 4mm;
}
.tpl-minimal .head-text { flex: 1; min-width: 0; }
.tpl-minimal .photo {
  width: 22mm;
  height: 26mm;
  object-fit: cover;
  border: 0.3mm solid #d4d4d8;
  flex-shrink: 0;
}
.tpl-minimal .name {
  font-size: 1.8em;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  margin: 0 0 1mm;
}
.tpl-minimal .contact { font-size: 0.92em; color: #3f3f46; }

.tpl-minimal .cv-section {
  margin: 0;
  padding: 3mm 0;
  border-top: 0.2mm solid #d4d4d8;
}
.tpl-minimal .cv-section:first-of-type { border-top: none; padding-top: 0; }
.tpl-minimal .cv-heading {
  font-size: 0.95em;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.09em;
  color: var(--accent);
  margin: 0 0 1.8mm;
}

.tpl-minimal .cv-text { margin: 0; text-align: justify; }
.tpl-minimal .cv-skills {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-wrap: wrap;
  gap: 0 2mm;
}
.tpl-minimal .cv-skill { white-space: nowrap; }
.tpl-minimal .cv-skill:not(:last-child)::after { content: " ·"; color: #a1a1aa; }

.tpl-minimal .cv-entry { margin-bottom: 2.2mm; }
.tpl-minimal .cv-entry-head {
  display: flex;
  justify-content: space-between;
  gap: 4mm;
  align-items: baseline;
}
.tpl-minimal .cv-entry-headings { display: flex; flex-wrap: wrap; gap: 0 2mm; align-items: baseline; }
.tpl-minimal .cv-entry-title { font-weight: 700; }
.tpl-minimal .cv-entry-subtitle { color: #52525b; }
.tpl-minimal .cv-entry-subtitle::before { content: "— "; color: #a1a1aa; }
.tpl-minimal .cv-entry-period { white-space: nowrap; font-size: 0.9em; color: #52525b; }
.tpl-minimal .cv-entry-detail { margin: 0.4mm 0 0; }
`;
