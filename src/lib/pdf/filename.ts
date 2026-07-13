/**
 * Derives a filesystem-safe download filename from the customer's name
 * (contract 1 / data-model rules). Pure and deterministic.
 *
 *   "Ahmed Khan"     -> "Ahmed-Khan-CV.pdf"
 *   "Fatima / Noor"  -> "Fatima-Noor-CV.pdf"
 *   "M. A. Jinnah"   -> "M-A-Jinnah-CV.pdf"
 *   ""  / "   "      -> "CV.pdf"
 *   "!!!"            -> "CV.pdf"   (no alphanumerics)
 */
const MAX_NAME_LEN = 60;

export function pdfFilename(fullName: string): string {
  const name = (fullName ?? "")
    .trim()
    // every run of non-alphanumeric characters becomes a single hyphen
    .replace(/[^A-Za-z0-9]+/g, "-")
    // strip leading/trailing hyphens left by punctuation at the edges
    .replace(/^-+|-+$/g, "")
    .slice(0, MAX_NAME_LEN)
    // slicing can leave a trailing hyphen mid-token; trim it again
    .replace(/-+$/g, "");

  return name ? `${name}-CV.pdf` : "CV.pdf";
}
