import { hasLocale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import { requireUserOrRedirect } from "@/lib/auth/session";
import { getLatestApprovedPayment, getOrderForUser } from "@/db/queries/orders";
import { SITE } from "@/lib/data/site";
import { InvoicePrintButton } from "@/components/account/InvoicePrintButton";

type PageProps = { params: Promise<{ locale: string; id: string }> };

export default async function InvoicePage({ params }: PageProps) {
  const { locale, id } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);

  const session = await requireUserOrRedirect(`/account/orders/${id}/invoice`);
  const t = await getTranslations("account.orders.invoice");

  const order = await getOrderForUser(id, session.user.id);
  if (!order) notFound();

  const payment = await getLatestApprovedPayment(order.id);
  if (!payment) notFound();

  return (
    <div className="mx-auto max-w-2xl rounded-3xl border border-line bg-surface/60 p-10 print:border-none print:bg-white print:text-black">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-foreground print:text-black">
            {t("title")}
          </h1>
          <p className="mt-1 text-sm text-muted print:text-black/70">{SITE.name}</p>
        </div>
        <InvoicePrintButton label={t("print")} />
      </div>

      <dl className="mt-8 flex flex-col gap-4 border-t border-line pt-6 print:border-black/20">
        <div className="flex justify-between text-sm">
          <dt className="text-muted print:text-black/70">{t("order")}</dt>
          <dd className="font-medium text-foreground print:text-black">{order.title}</dd>
        </div>
        <div className="flex justify-between text-sm">
          <dt className="text-muted print:text-black/70">{t("date")}</dt>
          <dd className="font-medium text-foreground print:text-black">
            {new Intl.DateTimeFormat(locale, { dateStyle: "long" }).format(
              payment.reviewedAt ?? payment.createdAt
            )}
          </dd>
        </div>
        <div className="flex justify-between text-sm">
          <dt className="text-muted print:text-black/70">{t("status")}</dt>
          <dd className="font-medium text-emerald-500">{payment.status}</dd>
        </div>
        <div className="flex justify-between border-t border-line pt-4 text-base print:border-black/20">
          <dt className="font-semibold text-foreground print:text-black">{t("amount")}</dt>
          <dd className="font-bold text-foreground print:text-black">
            ${(payment.amount / 100).toLocaleString(locale)} {payment.currency.toUpperCase()}
          </dd>
        </div>
      </dl>
    </div>
  );
}
