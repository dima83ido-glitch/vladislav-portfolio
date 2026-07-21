import { cookies } from "next/headers";
import { hasLocale } from "next-intl";
import { routing, type Locale } from "@/i18n/routing";

/**
 * Admin lives outside `[locale]` (see middleware.ts), so requestLocale is
 * never set for it by next-intl's routing middleware — reading the same
 * NEXT_LOCALE cookie the public site's LanguageSwitcher writes is how the
 * admin panel picks up the visitor's chosen language without moving admin
 * under `[locale]` (which reintroduces the 404 bug fixed previously).
 */
export async function getAdminLocale(): Promise<Locale> {
  const cookieStore = await cookies();
  const cookieLocale = cookieStore.get("NEXT_LOCALE")?.value;
  return hasLocale(routing.locales, cookieLocale) ? cookieLocale : routing.defaultLocale;
}

export async function getAdminMessages(locale: Locale) {
  return (await import(`../../../messages/${locale}.json`)).default;
}
