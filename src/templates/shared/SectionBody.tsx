import { isEntryEmpty } from "@/lib/empty-checks";
import type { Entry, Section } from "@/lib/cv-types";
import { SectionHeading } from "./SectionHeading";

/** Heading + body for one section. Shared by all accent templates; each template
 *  styles the neutral `.cv-*` class vocabulary from its own scoped root. */
export function SectionBlock({ section }: { section: Section }) {
  return (
    <section className="cv-section">
      <SectionHeading>{section.customHeading ?? section.defaultHeading}</SectionHeading>
      <SectionBody section={section} />
    </section>
  );
}

/** Renders a section's content by variant, skipping empty entries/fields (FR-013). */
export function SectionBody({ section }: { section: Section }) {
  const c = section.content;

  if (c.kind === "text") return <p className="cv-text">{c.text}</p>;

  if (c.kind === "skills") {
    const items = c.items.filter((i) => i.trim());
    return (
      <ul className="cv-skills">
        {items.map((s, i) => (
          <li key={i} className="cv-skill">
            {s}
          </li>
        ))}
      </ul>
    );
  }

  // entries or references
  const filled = c.entries.filter((e) => !isEntryEmpty(e));
  if (c.kind === "references" && filled.length === 0 && c.onRequest) {
    return <p className="cv-text">References available on request.</p>;
  }
  return (
    <div className="cv-entries">
      {filled.map((e) => (
        <EntryRow key={e.id} entry={e} />
      ))}
    </div>
  );
}

function EntryRow({ entry }: { entry: Entry }) {
  const title = entry.title.trim();
  const subtitle = entry.subtitle.trim();
  const period = entry.period.trim();
  const detail = entry.detail.trim();
  return (
    <div className="cv-entry">
      <div className="cv-entry-head">
        <div className="cv-entry-headings">
          {title && <span className="cv-entry-title">{title}</span>}
          {subtitle && <span className="cv-entry-subtitle">{subtitle}</span>}
        </div>
        {period && <span className="cv-entry-period">{period}</span>}
      </div>
      {detail && <p className="cv-entry-detail">{detail}</p>}
    </div>
  );
}
