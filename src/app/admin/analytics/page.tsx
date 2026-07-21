import { getOrderStatusBreakdown, getOverviewStats, getPaymentMethodBreakdown, getRevenueByDay } from "@/db/queries/analytics";
import { RevenueChart, PaymentMethodChart, OrderStatusChart } from "@/components/admin/AnalyticsCharts";

export default async function AdminAnalyticsPage() {
  const [stats, revenue, methods, statuses] = await Promise.all([
    getOverviewStats(),
    getRevenueByDay(30),
    getPaymentMethodBreakdown(),
    getOrderStatusBreakdown(),
  ]);

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Analytics</h1>
        <p className="mt-1 text-sm text-muted">
          {stats.totalOrders} orders · ${(stats.totalRevenueCents / 100).toLocaleString()} revenue ·{" "}
          {stats.totalUsers} users
        </p>
      </div>

      <div className="rounded-2xl border border-line bg-surface/60 p-6">
        <h2 className="mb-4 text-sm font-semibold text-foreground">Revenue, last 30 days</h2>
        <RevenueChart data={revenue} />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-line bg-surface/60 p-6">
          <h2 className="mb-4 text-sm font-semibold text-foreground">Payment methods</h2>
          <PaymentMethodChart data={methods} />
        </div>
        <div className="rounded-2xl border border-line bg-surface/60 p-6">
          <h2 className="mb-4 text-sm font-semibold text-foreground">Orders by status</h2>
          <OrderStatusChart data={statuses} />
        </div>
      </div>
    </div>
  );
}
