import { hasLocale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import { Link } from "@/i18n/navigation";
import { requireUserOrRedirect } from "@/lib/auth/session";
import { getOrdersByUser } from "@/db/queries/orders";
import { OrderStatusBadge } from "@/components/account/OrderStatusBadge";
import { MarkSectionRead } from "@/components/shared/MarkSectionRead";

type PageProps = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: PageProps) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "account.orders" });
  return { title: t("title") };
}

export default async function OrdersPage({ params }: PageProps) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);

  const session = await requireUserOrRedirect("/account/orders");
  const t = await getTranslations("account.orders");
  const orders = await getOrdersByUser(session.user.id);

  return (
    <div className="flex flex-col gap-6">
      <MarkSectionRead section="orders" />
      <h1 className="text-2xl font-bold tracking-tight text-foreground">{t("title")}</h1>

      {orders.length === 0 ? (
        <div className="flex flex-col items-start gap-4 rounded-2xl border border-line bg-surface/50 p-8">
          <p className="text-sm text-muted">{t("empty")}</p>
          <Link
            href="/pricing"
            className="rounded-full bg-blue-soft px-6 py-2.5 text-sm font-semibold text-background transition-colors hover:bg-blue-soft/90"
          >
            {t("browsePlans")}
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {orders.map((order) => (
            <Link
              key={order.id}
              href={`/account/orders/${order.id}`}
              className="flex flex-col gap-3 rounded-2xl border border-line bg-surface/50 p-6 transition-colors hover:border-blue-soft/50 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="flex flex-col gap-1">
                <span className="font-semibold text-foreground">{order.title}</span>
                <span className="text-xs text-muted">
                  {new Intl.DateTimeFormat(locale, { dateStyle: "medium" }).format(order.createdAt)}
                </span>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-sm font-semibold text-foreground">
                  ${(order.price / 100).toLocaleString(locale)}
                </span>
                <OrderStatusBadge status={order.status} />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
