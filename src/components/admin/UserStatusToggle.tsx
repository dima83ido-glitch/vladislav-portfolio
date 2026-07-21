"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { setUserStatus } from "@/lib/cms/users/actions";

export function UserStatusToggle({ userId, status }: { userId: string; status: "active" | "suspended" }) {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);

  async function handleToggle() {
    const next = status === "active" ? "suspended" : "active";
    if (!confirm(`${next === "suspended" ? "Suspend" : "Reactivate"} this user?`)) return;

    setIsPending(true);
    try {
      await setUserStatus(userId, next);
      router.refresh();
    } finally {
      setIsPending(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleToggle}
      disabled={isPending}
      className={`text-sm font-medium transition-opacity hover:opacity-80 disabled:opacity-40 ${
        status === "active" ? "text-red-400" : "text-emerald-400"
      }`}
    >
      {status === "active" ? "Suspend" : "Reactivate"}
    </button>
  );
}
