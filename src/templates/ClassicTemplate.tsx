import type { CSSProperties } from "react";
import { FONT_SIZE_BASE } from "@/lib/constants";
import { isEntryEmpty, isSectionEmpty } from "@/lib/empty-checks";
import type { CVDocument, Entry, PersonalInfo, Section } from "@/lib/cv-types";
import { ContactLine } from "./shared/ContactLine";
import { PhotoFrame } from "./shared/PhotoFrame";
import { SectionHeading } from "./shared/SectionHeading";

const PERSONAL_DETAILS: { key: keyof PersonalInfo; label: string }[] = [
  { key: "dateOfBirth", label: "Date of Birth" },
  { key: "cnic", label: "CNIC" },
  { key: "maritalStatus", label: "Marital Status" },
  { key: "nationality", label: "Nationality" },
  { key: "religion", label: "Religion" },
];

/** Classic: black & white, centered header, traditional single column (FR-016).
 *  Ignores accent color (usesAccent: false). */
export function ClassicTemplate({ cv }: { cv: CVDocument }) {
  const p = cv.personalInfo;
  const details = PERSONAL_DETAILS.filter((d) => p[d.key].trim());
  const visible = cv.sections.filter((s) => !isSectionEmpty(s));
  const rootStyle = {
    "--fs-base": FONT_SIZE_BASE[cv.style.fontSizeLevel],
  } as CSSProperties;

  return (
    <div className="tpl-classic" style={rootStyle}>
      <style>{CLASSIC_CSS}</style>

      <header className="hdr">
        <PhotoFrame photo={cv.photo} className="photo" />
        <h1 className="name">{p.fullName.trim() || "Your Name"}</h1>
        <ContactLine info={p} className="contact" />
        {details.length > 0 && (
          <div className="details">
            {details.map((d) => (
              <span key={d.key}>
                <b>{d.label}:</b> {p[d.key]}
              </span>
            ))}
          </div>
        )}
      </header>

      {visible.map((s) => (
        <section className="sec" key={s.id}>
          <SectionHeading>{s.customHeading ?? s.defaultHeading}</SectionHeading>
          <SectionBody section={s} />
        </section>
      ))}
    </div>
  );
}

function SectionBody({ section }: { section: Section }) {
  const c = section.content;

  if (c.kind === "text") return <p className="text">{c.text}</p>;

  if (c.kind === "skills") {
    return <p className="skills">{c.items.filter((i) => i.trim()).join("  •  ")}</p>;
  }

  // entries or references
  const filled = c.entries.filter((e) => !isEntryEmpty(e));
  if (c.kind === "references" && filled.length === 0 && c.onRequest) {
    return <p className="text">References available on request.</p>;
  }
  return (
    <div>
      {filled.map((e) => (
        <EntryRow key={e.id} entry={e} />
      ))}
    </div>
  );
}

function EntryRow({ entry }: { entry: Entry }) {
  const heading = [entry.title, entry.subtitle].map((s) => s.trim()).filter(Boolean).join(" — ");
  return (
    <div className="entry cv-entry">
      <div className="entry-top">
        <span className="entry-title">{heading}</span>
        {entry.period.trim() && <span className="entry-period">{entry.period}</span>}
      </div>
      {entry.detail.trim() && <div className="entry-detail">{entry.detail}</div>}
    </div>
  );
}

const CLASSIC_CSS = `
.tpl-classic {
  width: 100%;
  min-height: 297mm;
  box-sizing: border-box;
  padding: 14mm 16mm;
  background: #fff;
  color: #000;
  font-family: "Times New Roman", Georgia, serif;
  font-size: var(--fs-base);
  line-height: 1.4;
}
.tpl-classic .hdr {
  text-align: center;
  border-bottom: 2pt solid #000;
  padding-bottom: 4mm;
  margin-bottom: 5mm;
}
.tpl-classic .photo {
  width: 28mm;
  height: 34mm;
  object-fit: cover;
  border: 1pt solid #000;
  display: block;
  margin: 0 auto 3mm;
}
.tpl-classic .name {
  font-size: 2em;
  font-weight: bold;
  letter-spacing: 0.02em;
  text-transform: uppercase;
  margin: 0 0 2mm;
}
.tpl-classic .contact {
  font-size: 0.95em;
}
.tpl-classic .details {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 1mm 5mm;
  font-size: 0.9em;
  margin-top: 2mm;
}
.tpl-classic .cv-heading {
  font-size: 1.15em;
  font-weight: bold;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  border-bottom: 1pt solid #000;
  padding-bottom: 1mm;
  margin: 0 0 3mm;
}
.tpl-classic .sec {
  margin-bottom: 5mm;
}
.tpl-classic .entry {
  margin-bottom: 3mm;
}
.tpl-classic .entry-top {
  display: flex;
  justify-content: space-between;
  gap: 4mm;
  font-weight: bold;
}
.tpl-classic .entry-period {
  white-space: nowrap;
  font-weight: normal;
  font-style: italic;
}
.tpl-classic .entry-detail {
  font-weight: normal;
}
.tpl-classic .text {
  margin: 0;
  text-align: justify;
}
.tpl-classic .skills {
  margin: 0;
}
`;
