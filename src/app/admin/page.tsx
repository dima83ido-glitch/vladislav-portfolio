import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { getLatestOrders, getOrdersByDay, getOverviewStats, getRevenueByDay } from "@/db/queries/analytics";
import { OrdersChart, RevenueChart } from "@/components/admin/AnalyticsCharts";
import { LatestOrdersTable } from "@/components/admin/LatestOrdersTable";
import { getAdminLocale } from "@/lib/i18n/adminLocale";

function formatCents(cents: number) {
  return `$${(cents / 100).toLocaleString()}`;
}

export default async function AdminOverviewPage() {
  const locale = await getAdminLocale();
  const t = await getTranslations({ locale, namespace: "admin.dashboard" });

  const [stats, revenue, ordersByDay, latestOrders] = await Promise.all([
    getOverviewStats(),
    getRevenueByDay(30),
    getOrdersByDay(30),
    getLatestOrders(10),
  ]);

  const salesStats = [
    { label: t("totalRevenue"), value: formatCents(stats.totalRevenueCents) },
    { label: t("todayRevenue"), value: formatCents(stats.todayRevenueCents) },
    { label: t("monthRevenue"), value: formatCents(stats.monthRevenueCents) },
    { label: t("avgOrderValue"), value: formatCents(stats.avgOrderValueCents) },
    { label: t("completedOrders"), value: stats.completedOrders },
    { label: t("pendingOrders"), value: stats.pendingOrders },
    { label: t("cancelledOrders"), value: stats.cancelledOrders },
    { label: t("conversionRate"), value: `${stats.conversionRate}%` },
  ];

  const attentionTiles = [
    { label: t("pendingReviews"), value: stats.pendingReviews, href: "/admin/reviews?status=pending" },
    { label: t("awaitingPaymentConfirmation"), value: stats.pendingPayments, href: "/admin/payments" },
    { label: t("openSupportTickets"), value: stats.openTickets, href: "/admin/support" },
    { label: t("totalUsers"), value: stats.totalUsers, href: "/admin/users" },
  ];

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{t("title")}</h1>
        <p className="mt-1 text-sm text-muted">
          {t("subtitle", { orders: stats.totalOrders, revenue: formatCents(stats.totalRevenueCents) })}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {salesStats.map((tile) => (
          <div key={tile.label} className="rounded-2xl border border-line bg-surface/60 p-6">
            <span className="text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">
              {tile.value}
            </span>
            <p className="mt-1 text-sm text-muted">{tile.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-line bg-surface/60 p-6">
          <h2 className="mb-4 text-sm font-semibold text-foreground">{t("revenueChartTitle")}</h2>
          <RevenueChart data={revenue} />
        </div>
        <div className="rounded-2xl border border-line bg-surface/60 p-6">
          <h2 className="mb-4 text-sm font-semibold text-foreground">{t("ordersChartTitle")}</h2>
          <OrdersChart data={ordersByDay} />
        </div>
      </div>

      <div className="rounded-2xl border border-line bg-surface/60 p-6">
        <h2 className="mb-4 text-sm font-semibold text-foreground">{t("latestOrdersTitle")}</h2>
        <LatestOrdersTable rows={latestOrders} />
      </div>

      <div>
        <h2 className="mb-4 text-sm font-semibold text-foreground">{t("needsAttention")}</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {attentionTiles.map((tile) => (
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
    </div>
  );
}
