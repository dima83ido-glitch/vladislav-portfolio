import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["en", "uk", "ru"],
  defaultLocale: "en",
  localePrefix: "as-needed",
  // English is always the default, full stop — never negotiated from the
  // browser's Accept-Language header. The locale only ever changes when
  // the visitor explicitly picks one via the language switcher, which
  // sets the NEXT_LOCALE cookie that middleware then honors on return
  // visits.
  localeDetection: false,
});

export type Locale = (typeof routing.locales)[number];
