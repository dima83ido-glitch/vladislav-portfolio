"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { deletePlan } from "@/lib/cms/pricing/actions";

export function DeletePlanButton({ id }: { id: string }) {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);

  async function handleDelete() {
    if (!confirm("Delete this plan permanently?")) return;
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
      Delete
    </button>
  );
}
