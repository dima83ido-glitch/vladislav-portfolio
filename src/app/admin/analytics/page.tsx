import { getTranslations } from "next-intl/server";
import { getOrderStatusBreakdown, getOverviewStats, getPaymentMethodBreakdown, getRevenueByDay } from "@/db/queries/analytics";
import { RevenueChart, PaymentMethodChart, OrderStatusChart } from "@/components/admin/AnalyticsCharts";
import { getAdminLocale } from "@/lib/i18n/adminLocale";

export default async function AdminAnalyticsPage() {
  const locale = await getAdminLocale();
  const t = await getTranslations({ locale, namespace: "admin.analytics" });

  const [stats, revenue, methods, statuses] = await Promise.all([
    getOverviewStats(),
    getRevenueByDay(30),
    getPaymentMethodBreakdown(),
    getOrderStatusBreakdown(),
  ]);

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{t("title")}</h1>
        <p className="mt-1 text-sm text-muted">
          {t("subtitle", {
            orders: stats.totalOrders,
            revenue: `$${(stats.totalRevenueCents / 100).toLocaleString()}`,
            users: stats.totalUsers,
          })}
        </p>
      </div>

      <div className="rounded-2xl border border-line bg-surface/60 p-6">
        <h2 className="mb-4 text-sm font-semibold text-foreground">{t("revenueChartTitle")}</h2>
        <RevenueChart data={revenue} />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-line bg-surface/60 p-6">
          <h2 className="mb-4 text-sm font-semibold text-foreground">{t("paymentMethodsTitle")}</h2>
          <PaymentMethodChart data={methods} />
        </div>
        <div className="rounded-2xl border border-line bg-surface/60 p-6">
          <h2 className="mb-4 text-sm font-semibold text-foreground">{t("orderStatusTitle")}</h2>
          <OrderStatusChart data={statuses} />
        </div>
      </div>
    </div>
  );
}
