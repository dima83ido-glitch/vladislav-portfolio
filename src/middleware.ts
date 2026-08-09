import { NextRequest, NextResponse } from "next/server";
import createMiddleware from "next-intl/middleware";
import { routing } from "@/i18n/routing";
import { resolveAutoLocale } from "@/i18n/geo-locale";

const intlMiddleware = createMiddleware(routing);

const LOCALE_COOKIE_NAME = "NEXT_LOCALE";

// Matches "/en", "/uk/anything", etc. — an explicit locale already spelled
// out in the URL (a shared link, a bookmark, a search result). That's a
// definitive signal on its own; auto-detection must not run for it.
const EXPLICIT_LOCALE_PREFIX = new RegExp(`^/(${routing.locales.join("|")})(/|$)`);

export default async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // The admin dashboard lives outside the [locale] segment (it's an
  // internal, English-only tool). This is only a cheap presence check —
  // src/app/admin/layout.tsx performs the authoritative, DB-backed
  // session + role verification.
  if (pathname.startsWith("/admin")) {
    const hasSession = request.cookies.has("session");
    if (!hasSession) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }
    return NextResponse.next();
  }

  // First visit ever (no NEXT_LOCALE cookie yet, from either a manual
  // language-switcher pick or a previous run of this same block) AND no
  // locale already spelled out in the URL: decide the locale ourselves —
  // IP-derived country first (UA -> uk, RU -> ru, anything else -> en),
  // falling back to the browser's Accept-Language and finally English when
  // the country can't be determined at all. Once any cookie exists, this
  // never runs again — next-intl's own cookie-based resolution (routing.ts
  // has localeDetection: true) takes it from there on every later request,
  // identically for both manual and auto-detected choices.
  if (!request.cookies.has(LOCALE_COOKIE_NAME) && !EXPLICIT_LOCALE_PREFIX.test(pathname)) {
    const locale = await resolveAutoLocale(request.headers);
    // Feed the decision into next-intl's own cookie-priority resolution
    // instead of reimplementing its as-needed-prefix redirect/rewrite
    // logic here.
    request.cookies.set(LOCALE_COOKIE_NAME, locale);
    const response = intlMiddleware(request);
    // next-intl's middleware only writes NEXT_LOCALE back to the response
    // when it thinks the cookie changed — since we just made it "already"
    // match by setting it above, it skips the write. Without this, the
    // browser would never actually receive the cookie and we'd repeat
    // auto-detection on every future visit.
    response.cookies.set(LOCALE_COOKIE_NAME, locale, { path: "/", sameSite: "lax" });
    return response;
  }

  return intlMiddleware(request);
}

export const config = {
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
};
