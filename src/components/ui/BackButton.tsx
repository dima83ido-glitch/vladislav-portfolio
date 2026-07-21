"use client";

import { useRouter } from "next/navigation";
import { FiArrowLeft } from "react-icons/fi";
import { useRouter as useLocaleRouter } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

/**
 * Shared button chrome + "go back through history, else run a fallback"
 * logic. `router.back()` is plain history navigation, so it's safe to use
 * regardless of locale — only the fallback needs to know how to build a
 * "home" URL, which differs between locale-aware pages and /admin (which
 * renders outside NextIntlClientProvider and can't use next-intl's router).
 * See `BackButton` (for [locale] pages) and admin's `AdminBackButton` for
 * the two concrete fallback strategies.
 */
export function BackButtonBase({
  label,
  className,
  onFallback,
}: {
  label: string;
  className?: string;
  onFallback: () => void;
}) {
  const router = useRouter();

  function handleClick() {
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
    } else {
      onFallback();
    }
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className={cn(
        "inline-flex items-center gap-2 text-xs font-medium uppercase tracking-[0.2em] text-muted transition-colors hover:text-blue-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-soft focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        className
      )}
    >
      <FiArrowLeft size={13} />
      {label}
    </button>
  );
}

/** For pages under `[locale]` — the fallback push stays within the current locale. */
export function BackButton({ label, className }: { label: string; className?: string }) {
  const localeRouter = useLocaleRouter();
  return <BackButtonBase label={label} className={className} onFallback={() => localeRouter.push("/")} />;
}
