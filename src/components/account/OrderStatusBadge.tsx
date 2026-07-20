"use client";

import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import type { Order } from "@/db/schema";

const STATUS_STYLES: Record<Order["status"], string> = {
  pending_payment: "bg-amber-500/10 text-amber-400",
  paid: "bg-blue-soft/10 text-blue-soft",
  in_progress: "bg-blue-soft/10 text-blue-soft",
  delivered: "bg-violet-500/10 text-violet-400",
  completed: "bg-emerald-500/10 text-emerald-400",
  cancelled: "bg-red-500/10 text-red-400",
  payment_rejected: "bg-red-500/10 text-red-400",
};

export const ORDER_PROGRESS: Record<Order["status"], number> = {
  pending_payment: 0,
  paid: 25,
  in_progress: 55,
  delivered: 90,
  completed: 100,
  cancelled: 0,
  payment_rejected: 0,
};

export function OrderStatusBadge({ status }: { status: Order["status"] }) {
  const t = useTranslations("account.orders.status");

  return (
    <span className={cn("rounded-full px-3 py-1 text-xs font-medium", STATUS_STYLES[status])}>
      {t(status)}
    </span>
  );
}
