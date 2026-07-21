import { getTranslations } from "next-intl/server";
import type { Order, SafeUser } from "@/db/schema";
import { cn } from "@/lib/utils";
import { getAdminLocale } from "@/lib/i18n/adminLocale";

const STATUS_STYLES: Record<Order["status"], string> = {
  pending_payment: "bg-amber-500/10 text-amber-400",
  paid: "bg-blue-soft/10 text-blue-soft",
  in_progress: "bg-blue-soft/10 text-blue-soft",
  delivered: "bg-violet-500/10 text-violet-400",
  completed: "bg-emerald-500/10 text-emerald-400",
  cancelled: "bg-red-500/10 text-red-400",
  payment_rejected: "bg-red-500/10 text-red-400",
};

export async function LatestOrdersTable({ rows }: { rows: { order: Order; user: SafeUser }[] }) {
  const locale = await getAdminLocale();
  const t = await getTranslations({ locale, namespace: "admin.dashboard" });
  const statusT = await getTranslations({ locale, namespace: "admin.orderStatus" });

  if (rows.length === 0) {
    return <p className="text-sm text-muted">{t("noOrders")}</p>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[640px] text-left text-sm">
        <thead>
          <tr className="border-b border-line text-xs uppercase tracking-[0.1em] text-muted">
            <th className="pb-3 pr-4 font-medium">{t("table.order")}</th>
            <th className="pb-3 pr-4 font-medium">{t("table.customer")}</th>
            <th className="pb-3 pr-4 font-medium">{t("table.status")}</th>
            <th className="pb-3 pr-4 font-medium">{t("table.amount")}</th>
            <th className="pb-3 font-medium">{t("table.created")}</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(({ order, user }) => (
            <tr key={order.id} className="border-b border-line/60 last:border-0">
              <td className="py-3 pr-4 font-medium text-foreground">{order.title}</td>
              <td className="py-3 pr-4 text-muted">{user.displayName || user.email}</td>
              <td className="py-3 pr-4">
                <span className={cn("rounded-full px-3 py-1 text-xs font-medium", STATUS_STYLES[order.status])}>
                  {statusT(order.status)}
                </span>
              </td>
              <td className="py-3 pr-4 text-foreground">${(order.price / 100).toLocaleString()}</td>
              <td className="py-3 text-muted">
                {new Intl.DateTimeFormat(locale, { dateStyle: "medium" }).format(order.createdAt)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
