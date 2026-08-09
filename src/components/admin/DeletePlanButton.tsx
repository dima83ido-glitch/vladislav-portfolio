"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { deletePlan } from "@/lib/cms/pricing/actions";

export function DeletePlanButton({ id }: { id: string }) {
  const router = useRouter();
  const t = useTranslations("admin.common");
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleDelete() {
    if (!confirm(t("confirmDeleteGeneric"))) return;
    setIsPending(true);
    setError(null);
    try {
      const result = await deletePlan(id);
      if (!result.ok) {
        setError(t("errorGeneric"));
        return;
      }
      router.refresh();
    } catch {
      setError(t("errorGeneric"));
    } finally {
      setIsPending(false);
    }
  }

  return (
    <span className="flex items-center gap-3">
      <button
        type="button"
        onClick={handleDelete}
        disabled={isPending}
        className="font-medium text-red-400 transition-opacity hover:opacity-80 disabled:opacity-40"
      >
        {t("delete")}
      </button>
      {error ? <span className="text-xs text-red-400">{error}</span> : null}
    </span>
  );
}
