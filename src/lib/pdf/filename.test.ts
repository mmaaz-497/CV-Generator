import { describe, it, expect } from "vitest";
import { pdfFilename } from "./filename";

describe("pdfFilename", () => {
  it("derives a hyphenated name with the -CV.pdf suffix", () => {
    expect(pdfFilename("Ahmed Khan")).toBe("Ahmed-Khan-CV.pdf");
  });

  it("collapses runs of whitespace", () => {
    expect(pdfFilename("  Ayesha   Noor  ")).toBe("Ayesha-Noor-CV.pdf");
  });

  it("replaces filesystem-unsafe characters (slashes, punctuation)", () => {
    expect(pdfFilename("Fatima / Noor")).toBe("Fatima-Noor-CV.pdf");
    expect(pdfFilename('a\\b:c*d?e"f<g>h|i')).toBe("a-b-c-d-e-f-g-h-i-CV.pdf");
  });

  it("handles dotted initials", () => {
    expect(pdfFilename("M. A. Jinnah")).toBe("M-A-Jinnah-CV.pdf");
  });

  it("falls back to CV.pdf for empty / whitespace-only names", () => {
    expect(pdfFilename("")).toBe("CV.pdf");
    expect(pdfFilename("   ")).toBe("CV.pdf");
  });

  it("falls back to CV.pdf when there are no alphanumerics", () => {
    expect(pdfFilename("!!!")).toBe("CV.pdf");
    expect(pdfFilename("—/—")).toBe("CV.pdf");
  });

  it("truncates very long names to <=60 chars and leaves no trailing hyphen", () => {
    const long = "A".repeat(80);
    const out = pdfFilename(long);
    expect(out).toBe(`${"A".repeat(60)}-CV.pdf`);

    const longMulti = `${"a".repeat(59)} bcd`;
    const out2 = pdfFilename(longMulti);
    expect(out2.endsWith("-CV.pdf")).toBe(true);
    expect(out2).not.toContain("--");
    // the name portion is <= 60 chars and has no dangling hyphen before the suffix
    expect(out2.replace("-CV.pdf", "").length).toBeLessThanOrEqual(60);
    expect(out2.replace("-CV.pdf", "")).not.toMatch(/-$/);
  });

  it("produces a name matching the safe pattern", () => {
    const out = pdfFilename("Zaid (Jr.) O'Brien").replace("-CV.pdf", "");
    expect(out).toMatch(/^[A-Za-z0-9]+(-[A-Za-z0-9]+)*$/);
  });

  it("is null/undefined tolerant", () => {
    // @ts-expect-error runtime guard
    expect(pdfFilename(undefined)).toBe("CV.pdf");
  });
});
