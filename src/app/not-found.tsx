import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";
import { SITE } from "@/lib/data/site";

// Root-level fallback for any request that never resolves to a locale
// segment (e.g. app/[locale]/not-found would only fire once inside that
// tree). Needs its own <html>/<body> since there is no shared root layout
// (this project uses per-route-group root layouts — see [locale]/layout.tsx
// and admin/layout.tsx) — without metadataBase set here, Next falls back to
// "http://localhost:3000" for this route and warns at build time.
export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: `Page not found — ${SITE.name}`,
  robots: { index: false, follow: false },
};

export default function NotFound() {
  return (
    <html lang="en">
      <body className="flex min-h-screen flex-col items-center justify-center bg-background px-6 text-center text-foreground antialiased">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-blue-soft">404</p>
        <h1 className="mt-4 text-3xl font-bold sm:text-4xl">Page not found</h1>
        <p className="mt-3 max-w-md text-sm text-muted">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <Link
          href="/"
          className="mt-8 rounded-full bg-foreground px-6 py-2.5 text-sm font-semibold text-background transition-colors hover:bg-blue-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-soft focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        >
          Back to homepage
        </Link>
      </body>
    </html>
  );
}
