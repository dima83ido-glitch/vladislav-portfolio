"use client";

import { useState } from "react";
import { useRouter } from "@/i18n/navigation";
import { createOrderFromPlan } from "@/lib/orders/checkout";

export function usePlanOrder(source: "home" | "full") {
  const router = useRouter();
  const [pendingPlanId, setPendingPlanId] = useState<string | null>(null);
  const [errorKey, setErrorKey] = useState<string | null>(null);

  async function order(planId: string) {
    if (pendingPlanId) return;
    setErrorKey(null);
    setPendingPlanId(planId);

    const result = await createOrderFromPlan(source, planId);
    setPendingPlanId(null);

    if (!result.ok) {
      if (result.error === "unauthorized") {
        const callbackUrl = source === "home" ? "/#pricing" : "/pricing";
        router.push(`/login?intent=register&callbackUrl=${encodeURIComponent(callbackUrl)}`);
        return;
      }
      setErrorKey(result.error);
      return;
    }

    router.push(`/account/orders/${result.orderId}`);
  }

  return { order, pendingPlanId, errorKey };
}
