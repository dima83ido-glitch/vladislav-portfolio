import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["en", "uk", "ru"],
  defaultLocale: "en",
  localePrefix: "as-needed",
  // Lets next-intl's own middleware read the NEXT_LOCALE cookie (set by
  // the language switcher, or by src/middleware.ts's one-time IP-country
  // auto-detection) on every request with no locale in the URL, and fall
  // back to the Accept-Language header when neither has run yet. See
  // src/middleware.ts for the country-detection step that runs ahead of
  // this and takes priority over Accept-Language.
  localeDetection: true,
});

export type Locale = (typeof routing.locales)[number];
