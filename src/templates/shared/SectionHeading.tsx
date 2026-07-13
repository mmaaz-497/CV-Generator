import type { ReactNode } from "react";

/** Accent-aware section heading. Each template styles `.cv-heading` (scoped by its
 *  own root class) so one component serves every template. */
export function SectionHeading({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return <h2 className={`cv-heading ${className}`.trim()}>{children}</h2>;
}
