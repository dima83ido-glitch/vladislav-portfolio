"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { deletePlan } from "@/lib/cms/pricing/actions";

export function DeletePlanButton({ id }: { id: string }) {
  const router = useRouter();
  const t = useTranslations("admin.common");
  const [isPending, setIsPending] = useState(false);

  async function handleDelete() {
    if (!confirm(t("confirmDeleteGeneric"))) return;
    setIsPending(true);
    await deletePlan(id);
    setIsPending(false);
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={handleDelete}
      disabled={isPending}
      className="font-medium text-red-400 transition-opacity hover:opacity-80 disabled:opacity-40"
    >
      {t("delete")}
    </button>
  );
}
