import type { Order, User } from "@/db/schema";
import { cn } from "@/lib/utils";

const STATUS_STYLES: Record<Order["status"], string> = {
  pending_payment: "bg-amber-500/10 text-amber-400",
  paid: "bg-blue-soft/10 text-blue-soft",
  in_progress: "bg-blue-soft/10 text-blue-soft",
  delivered: "bg-violet-500/10 text-violet-400",
  completed: "bg-emerald-500/10 text-emerald-400",
  cancelled: "bg-red-500/10 text-red-400",
  payment_rejected: "bg-red-500/10 text-red-400",
};

const STATUS_LABELS: Record<Order["status"], string> = {
  pending_payment: "Pending payment",
  paid: "Paid",
  in_progress: "In progress",
  delivered: "Delivered",
  completed: "Completed",
  cancelled: "Cancelled",
  payment_rejected: "Payment rejected",
};

export function LatestOrdersTable({ rows }: { rows: { order: Order; user: User }[] }) {
  if (rows.length === 0) {
    return <p className="text-sm text-muted">No orders yet.</p>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[640px] text-left text-sm">
        <thead>
          <tr className="border-b border-line text-xs uppercase tracking-[0.1em] text-muted">
            <th className="pb-3 pr-4 font-medium">Order</th>
            <th className="pb-3 pr-4 font-medium">Customer</th>
            <th className="pb-3 pr-4 font-medium">Status</th>
            <th className="pb-3 pr-4 font-medium">Amount</th>
            <th className="pb-3 font-medium">Created</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(({ order, user }) => (
            <tr key={order.id} className="border-b border-line/60 last:border-0">
              <td className="py-3 pr-4 font-medium text-foreground">{order.title}</td>
              <td className="py-3 pr-4 text-muted">{user.displayName || user.email}</td>
              <td className="py-3 pr-4">
                <span className={cn("rounded-full px-3 py-1 text-xs font-medium", STATUS_STYLES[order.status])}>
                  {STATUS_LABELS[order.status]}
                </span>
              </td>
              <td className="py-3 pr-4 text-foreground">${(order.price / 100).toLocaleString()}</td>
              <td className="py-3 text-muted">
                {new Intl.DateTimeFormat("en-US", { dateStyle: "medium" }).format(order.createdAt)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
