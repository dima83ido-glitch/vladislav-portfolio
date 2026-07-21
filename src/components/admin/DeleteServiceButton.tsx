"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { deleteService } from "@/lib/cms/content/actions";

export function DeleteServiceButton({ id }: { id: string }) {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);

  async function handleDelete() {
    if (!confirm("Delete this service permanently?")) return;
    setIsPending(true);
    await deleteService(id);
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
