import type { Metadata, Viewport } from "next";
import { Geist } from "next/font/google";
import "./globals.css";

// Self-hosted at build time by next/font — no runtime Google Fonts fetch (constitution II)
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

// Absolute base for og:/twitter: URLs. Override per-deployment via NEXT_PUBLIC_SITE_URL.
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://cv-maker.vercel.app";

const DESCRIPTION =
  "Build a professional CV on your phone in minutes and export a print-ready A4 PDF. " +
  "Five templates, no sign-up, and nothing ever leaves your device.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "CV Maker — Resume Builder | Free A4 PDF CV Generator",
    template: "%s | CV Maker",
  },
  description: DESCRIPTION,
  applicationName: "CV Maker",
  keywords: [
    "CV maker",
    "resume builder",
    "CV generator",
    "free CV maker",
    "mobile CV maker",
    "A4 CV template",
    "PDF resume",
    "print CV",
    "CV templates",
    "offline resume builder",
  ],
  category: "productivity",
  manifest: "/manifest.webmanifest",
  // icon.png / apple-icon.png / favicon.ico in this directory are picked up automatically.
  openGraph: {
    type: "website",
    url: SITE_URL,
    siteName: "CV Maker",
    title: "CV Maker — Resume Builder",
    description: DESCRIPTION,
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "CV Maker — Resume Builder",
    description: DESCRIPTION,
  },
  robots: { index: true, follow: true },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#003c94",
  colorScheme: "light",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-zinc-100 text-zinc-900">
        {children}
      </body>
    </html>
  );
}
