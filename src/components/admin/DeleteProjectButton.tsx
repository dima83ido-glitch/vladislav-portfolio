"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { deleteProject } from "@/lib/cms/portfolio/actions";

export function DeleteProjectButton({ id }: { id: string }) {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);

  async function handleDelete() {
    if (!confirm("Delete this project permanently?")) return;
    setIsPending(true);
    await deleteProject(id);
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
