import type { PersonalInfo } from "@/lib/cv-types";

type FieldDef = { key: keyof PersonalInfo; label: string };

/** Contact fields for a sidebar column (vertical, labelled). */
export const CONTACT_FIELDS: FieldDef[] = [
  { key: "phone", label: "Phone" },
  { key: "email", label: "Email" },
  { key: "address", label: "Address" },
  { key: "city", label: "City" },
];

/** Optional personal-detail fields common on Pakistani CVs. */
export const DETAIL_FIELDS: FieldDef[] = [
  { key: "dateOfBirth", label: "Date of Birth" },
  { key: "cnic", label: "CNIC" },
  { key: "maritalStatus", label: "Marital Status" },
  { key: "nationality", label: "Nationality" },
  { key: "religion", label: "Religion" },
];

/** A labelled list of personal fields, rendering nothing when all are blank (FR-013). */
export function MetaList({
  info,
  fields,
  heading,
}: {
  info: PersonalInfo;
  fields: FieldDef[];
  heading?: string;
}) {
  const rows = fields.filter((f) => info[f.key].trim());
  if (rows.length === 0) return null;
  return (
    <div className="cv-meta">
      {heading && <h2 className="cv-heading">{heading}</h2>}
      <ul className="cv-meta-list">
        {rows.map((f) => (
          <li key={f.key} className="cv-meta-row">
            <span className="cv-meta-label">{f.label}</span>
            <span className="cv-meta-value">{info[f.key]}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
