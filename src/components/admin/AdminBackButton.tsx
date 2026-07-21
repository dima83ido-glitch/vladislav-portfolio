"use client";

import { useRouter } from "next/navigation";
import { BackButtonBase } from "@/components/ui/BackButton";

/**
 * Admin renders outside NextIntlClientProvider (it's an English-only
 * internal tool), so unlike the locale-aware `BackButton` this uses plain
 * next/navigation for the fallback too — next-intl's router would throw
 * (it calls useLocale() internally, which needs the provider).
 */
export function AdminBackButton({ className }: { className?: string }) {
  const router = useRouter();
  return <BackButtonBase label="Back" className={className} onFallback={() => router.push("/")} />;
}
