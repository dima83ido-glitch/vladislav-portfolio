"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { FiGlobe } from "react-icons/fi";
import { useLocale, useTranslations } from "next-intl";
import { routing } from "@/i18n/routing";
import { cn } from "@/lib/utils";

const LOCALE_LABELS: Record<string, string> = {
  en: "EN",
  uk: "UA",
  ru: "RU",
};

/**
 * Admin's own switcher — deliberately not the public `LanguageSwitcher`,
 * which navigates through next-intl's locale-prefixing router and would
 * try to rewrite the current admin path to /uk/admin/... (404, since admin
 * intentionally lives outside [locale]). This just sets the same
 * NEXT_LOCALE cookie the public site reads and refreshes the current page.
 */
export function AdminLanguageSwitcher() {
  const t = useTranslations("nav");
  const locale = useLocale();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);

  function selectLocale(loc: string) {
    setIsOpen(false);
    document.cookie = `NEXT_LOCALE=${loc}; path=/; samesite=lax`;
    router.refresh();
  }

  return (
    <div className="relative">
      <button
        type="button"
        aria-label={t("language")}
        aria-expanded={isOpen}
        onClick={() => setIsOpen((prev) => !prev)}
        className={cn(
          "flex items-center gap-1.5 rounded-full border px-3.5 py-2 text-xs font-semibold uppercase tracking-[0.15em] transition-colors",
          isOpen
            ? "border-blue-soft text-blue-soft"
            : "border-line-strong text-foreground hover:border-blue-soft hover:text-blue-soft"
        )}
      >
        <FiGlobe size={14} />
        {LOCALE_LABELS[locale] ?? locale.toUpperCase()}
      </button>

      <AnimatePresence>
        {isOpen ? (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} aria-hidden="true" />
            <motion.div
              initial={{ opacity: 0, y: -8, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.96 }}
              transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="absolute right-0 top-full z-50 mt-2 flex flex-col gap-1 rounded-2xl border border-line bg-surface/95 p-1.5 shadow-xl backdrop-blur-xl"
            >
              {routing.locales.map((loc) => (
                <button
                  key={loc}
                  type="button"
                  onClick={() => selectLocale(loc)}
                  className={cn(
                    "flex items-center justify-between gap-6 rounded-xl px-4 py-2.5 text-left text-sm font-medium transition-colors",
                    loc === locale
                      ? "bg-blue-soft/10 text-blue-soft"
                      : "text-foreground/80 hover:bg-line/50 hover:text-foreground"
                  )}
                >
                  {LOCALE_LABELS[loc] ?? loc.toUpperCase()}
                </button>
              ))}
            </motion.div>
          </>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
