"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { deleteUser } from "@/lib/cms/users/actions";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";

export function DeleteUserButton({ userId }: { userId: string }) {
  const t = useTranslations("admin");
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);

  async function handleConfirm() {
    setIsPending(true);
    try {
      await deleteUser(userId);
      router.refresh();
    } finally {
      setIsPending(false);
      setIsConfirming(false);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setIsConfirming(true)}
        disabled={isPending}
        className="text-sm font-medium text-red-400 transition-opacity hover:opacity-80 disabled:opacity-40"
      >
        {t("users.delete")}
      </button>
      <ConfirmDialog
        open={isConfirming}
        title={t("users.confirmDeleteTitle")}
        body={t("users.confirmDeleteBody")}
        confirmLabel={t("users.delete")}
        cancelLabel={t("common.cancel")}
        variant="danger"
        isPending={isPending}
        onConfirm={handleConfirm}
        onCancel={() => setIsConfirming(false)}
      />
    </>
  );
}
