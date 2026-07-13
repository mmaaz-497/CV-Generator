import type { PersonalInfo } from "@/lib/cv-types";

/** Phone / email / address / city joined, skipping every blank field (FR-013). */
export function ContactLine({
  info,
  className = "",
  separator = "  •  ",
}: {
  info: PersonalInfo;
  className?: string;
  separator?: string;
}) {
  const parts = [info.phone, info.email, info.address, info.city]
    .map((s) => s.trim())
    .filter(Boolean);
  if (parts.length === 0) return null;
  return <div className={className}>{parts.join(separator)}</div>;
}
