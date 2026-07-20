"use client";

import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import type { SupportTicket } from "@/db/schema";

const STATUS_STYLES: Record<SupportTicket["status"], string> = {
  open: "bg-amber-500/10 text-amber-400",
  awaiting_admin: "bg-amber-500/10 text-amber-400",
  awaiting_user: "bg-blue-soft/10 text-blue-soft",
  closed: "bg-line/60 text-muted",
};

export function TicketStatusBadge({ status }: { status: SupportTicket["status"] }) {
  const t = useTranslations("account.support.status");

  return (
    <span className={cn("w-fit rounded-full px-3 py-1 text-xs font-medium", STATUS_STYLES[status])}>
      {t(status)}
    </span>
  );
}
