import Link from "next/link";
import { getOverviewStats } from "@/db/queries/analytics";

export default async function AdminOverviewPage() {
  const stats = await getOverviewStats();

  const tiles = [
    { label: "Pending reviews", value: stats.pendingReviews, href: "/admin/reviews?status=pending" },
    { label: "Awaiting payment confirmation", value: stats.pendingPayments, href: "/admin/payments" },
    { label: "Open support tickets", value: stats.openTickets, href: "/admin/support" },
    { label: "Total orders", value: stats.totalOrders, href: "/admin/analytics" },
    { label: "Total users", value: stats.totalUsers, href: "/admin/users" },
    {
      label: "Total revenue",
      value: `$${(stats.totalRevenueCents / 100).toLocaleString()}`,
      href: "/admin/analytics",
    },
  ];

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Overview</h1>
        <p className="mt-1 text-sm text-muted">A quick look at what needs attention.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {tiles.map((tile) => (
          <Link
            key={tile.label}
            href={tile.href}
            className="rounded-2xl border border-line bg-surface/60 p-6 transition-colors hover:border-blue-soft/50"
          >
            <span className="text-3xl font-extrabold tracking-tight text-foreground">{tile.value}</span>
            <p className="mt-1 text-sm text-muted">{tile.label}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
