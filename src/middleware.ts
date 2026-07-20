import { NextRequest, NextResponse } from "next/server";
import createMiddleware from "next-intl/middleware";
import { routing } from "@/i18n/routing";

const intlMiddleware = createMiddleware(routing);

export default function middleware(request: NextRequest) {
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

  return intlMiddleware(request);
}

export const config = {
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
};
