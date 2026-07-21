import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://vladislav-portfolio.onrender.com";
const productionOrigin = new URL(siteUrl).host;

const nextConfig: NextConfig = {
  reactStrictMode: true,
  compress: true,
  images: {
    formats: ["image/avif", "image/webp"],
    // Admin-uploaded portfolio images are served from Cloudinary once
    // CLOUDINARY_* is configured — next/image refuses to optimize an
    // external host unless it's explicitly allow-listed.
    remotePatterns: [{ protocol: "https", hostname: "res.cloudinary.com" }],
  },
  experimental: {
    serverActions: {
      // Next already restricts Server Action POSTs to same-origin by
      // default (comparing Origin against Host) — this pins that
      // allowlist explicitly rather than leaving it implicit, and covers
      // local dev alongside the real production host.
      allowedOrigins: [productionOrigin, "localhost:3000"],
    },
  },
};

export default withNextIntl(nextConfig);
