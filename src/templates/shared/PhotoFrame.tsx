/** Renders the customer photo fitted to a template frame, or nothing when absent
 *  so no empty photo box appears (FR-019). Plain <img> — the source is a data URL. */
export function PhotoFrame({
  photo,
  className = "",
  alt = "Photograph",
}: {
  photo: string | null;
  className?: string;
  alt?: string;
}) {
  if (!photo) return null;
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={photo} alt={alt} className={className} />;
}
