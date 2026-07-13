import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Pure static export — no server, deployable on Vercel free tier (constitution II/VI)
  output: "export",
  // Static export cannot use the Next image optimizer; the only image is an in-memory
  // data-URL photo rendered via a plain <img>, so optimization is irrelevant.
  images: { unoptimized: true },
};

export default nextConfig;
