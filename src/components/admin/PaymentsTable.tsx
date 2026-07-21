"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { approvePayment, rejectPayment } from "@/lib/payments/actions";
import type { Order, Payment, SafeUser } from "@/db/schema";

const STATUS_STYLES: Record<string, string> = {
  pending: "bg-amber-500/10 text-amber-400",
  awaiting_confirmation: "bg-amber-500/10 text-amber-400",
  approved: "bg-emerald-500/10 text-emerald-400",
  rejected: "bg-red-500/10 text-red-400",
  failed: "bg-red-500/10 text-red-400",
};

type Row = { payment: Payment; order: Order; user: SafeUser };

export function PaymentsTable({ rows }: { rows: Row[] }) {
  const router = useRouter();
  const t = useTranslations("admin");
  const [pendingId, setPendingId] = useState<string | null>(null);

  async function run(id: string, action: () => Promise<void>) {
    setPendingId(id);
    try {
      await action();
      router.refresh();
    } finally {
      setPendingId(null);
    }
  }

  if (rows.length === 0) {
    return <p className="py-12 text-center text-sm text-muted">{t("payments.empty")}</p>;
  }

  function statusLabel(status: string) {
    if (status === "failed") {
      return status.replace("_", " ");
    }
    return t(`payments.tabs.${status}`);
  }

  return (
    <div className="flex flex-col gap-4">
      {rows.map(({ payment, order, user }) => {
        const isBusy = pendingId === payment.id;
        const canModerate = payment.status === "pending" || payment.status === "awaiting_confirmation";

        return (
          <div key={payment.id} className="flex flex-col gap-4 rounded-2xl border border-line bg-surface/60 p-6">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-3">
                  <span className="font-semibold text-foreground">{order.title}</span>
                  <span className={cn("rounded-full px-2.5 py-0.5 text-xs font-medium capitalize", STATUS_STYLES[payment.status])}>
                    {statusLabel(payment.status)}
                  </span>
                </div>
                <span className="text-xs text-muted">
                  {user.displayName || user.email} · {payment.method}
                  {payment.cryptoCurrency ? ` · ${payment.cryptoCurrency}` : ""}
                </span>
              </div>
              <span className="text-sm font-semibold text-foreground">
                ${(payment.amount / 100).toLocaleString()}
              </span>
            </div>

            {payment.cryptoTxHash ? (
              <code className="break-all rounded-lg bg-line/40 px-3 py-2 text-xs text-foreground/80">
                {payment.cryptoTxHash}
              </code>
            ) : null}

            {canModerate ? (
              <div className="flex gap-3 border-t border-line pt-4 text-sm">
                <button
                  type="button"
                  disabled={isBusy}
                  onClick={() => run(payment.id, () => approvePayment(payment.id))}
                  className="font-medium text-emerald-400 transition-opacity hover:opacity-80 disabled:opacity-40"
                >
                  {t("common.approve")}
                </button>
                <button
                  type="button"
                  disabled={isBusy}
                  onClick={() => run(payment.id, () => rejectPayment(payment.id))}
                  className="font-medium text-red-400 transition-opacity hover:opacity-80 disabled:opacity-40"
                >
                  {t("common.reject")}
                </button>
              </div>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}
