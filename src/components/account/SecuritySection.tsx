"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { MagneticButton } from "@/components/ui/MagneticButton";
import { signOutEverywhere } from "@/lib/account/actions";

export function SecuritySection() {
  const t = useTranslations("account.profile.security");
  const [isPending, setIsPending] = useState(false);
  const [done, setDone] = useState(false);

  async function handleClick() {
    if (isPending) return;
    setIsPending(true);
    await signOutEverywhere();
    setIsPending(false);
    setDone(true);
  }

  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-line bg-surface/50 p-6">
      <span className="text-sm font-semibold text-foreground">{t("title")}</span>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <span className="text-sm text-foreground/85">{t("signOutEverywhere")}</span>
          <span className="text-xs text-muted">{t("signOutEverywhereDescription")}</span>
        </div>
        <MagneticButton
          as="button"
          onClick={handleClick}
          disabled={isPending}
          className="rounded-full border border-line-strong px-5 py-2.5 text-sm font-semibold text-foreground transition-colors hover:border-blue-soft hover:text-blue-soft"
        >
          {t("signOutEverywhere")}
        </MagneticButton>
      </div>
      {done ? <p className="text-sm text-emerald-400">{t("done")}</p> : null}
    </div>
  );
}
