import { hasLocale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { FiArrowLeft } from "react-icons/fi";
import { routing } from "@/i18n/routing";
import { Link } from "@/i18n/navigation";
import { requireUserOrRedirect } from "@/lib/auth/session";
import { getLatestApprovedPayment, getOrderFiles, getOrderForUser, getOrderMessages } from "@/db/queries/orders";
import { OrderStatusBadge, ORDER_PROGRESS } from "@/components/account/OrderStatusBadge";
import { OrderMessages } from "@/components/account/OrderMessages";

type PageProps = { params: Promise<{ locale: string; id: string }> };

export default async function OrderDetailPage({ params }: PageProps) {
  const { locale, id } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);

  const session = await requireUserOrRedirect(`/account/orders/${id}`);
  const t = await getTranslations("account.orders");

  const order = await getOrderForUser(id, session.user.id);
  if (!order) notFound();

  const [messages, files, payment] = await Promise.all([
    getOrderMessages(order.id),
    getOrderFiles(order.id),
    getLatestApprovedPayment(order.id),
  ]);

  const progress = ORDER_PROGRESS[order.status];

  return (
    <div className="flex flex-col gap-6">
      <Link
        href="/account/orders"
        className="inline-flex items-center gap-2 text-xs font-medium uppercase tracking-[0.2em] text-muted transition-colors hover:text-blue-soft"
      >
        <FiArrowLeft size={13} />
        {t("detail.back")}
      </Link>

      <div className="flex flex-col gap-6 rounded-3xl border border-line bg-surface/60 p-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex flex-col gap-1">
            <h1 className="text-xl font-bold text-foreground">{order.title}</h1>
            {order.description ? (
              <p className="text-sm text-muted">{order.description}</p>
            ) : null}
          </div>
          <OrderStatusBadge status={order.status} />
        </div>

        <div className="grid grid-cols-2 gap-4 border-t border-line pt-6 sm:grid-cols-4">
          <div className="flex flex-col gap-1">
            <span className="text-xs font-medium uppercase tracking-[0.15em] text-muted">
              {t("price")}
            </span>
            <span className="text-sm font-semibold text-foreground">
              ${(order.price / 100).toLocaleString(locale)}
            </span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-xs font-medium uppercase tracking-[0.15em] text-muted">
              {t("paymentMethod")}
            </span>
            <span className="text-sm font-semibold capitalize text-foreground">
              {payment?.method ?? "—"}
            </span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-xs font-medium uppercase tracking-[0.15em] text-muted">
              {t("created")}
            </span>
            <span className="text-sm font-semibold text-foreground">
              {new Intl.DateTimeFormat(locale, { dateStyle: "medium" }).format(order.createdAt)}
            </span>
          </div>
          {payment ? (
            <Link
              href={`/account/orders/${order.id}/invoice`}
              className="text-sm font-semibold text-blue-soft transition-colors hover:text-blue-soft/80"
            >
              {t("detail.invoice")}
            </Link>
          ) : null}
        </div>

        <div className="border-t border-line pt-6">
          <div className="flex items-center justify-between text-xs font-medium uppercase tracking-[0.15em] text-muted">
            <span>{t("progress")}</span>
            <span>{progress}%</span>
          </div>
          <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-line">
            <div
              className="h-full rounded-full bg-gradient-to-r from-blue-dim to-blue-soft transition-all duration-700"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>

      <OrderMessages orderId={order.id} messages={messages} currentUserEmail={session.user.email} />

      <div className="flex flex-col gap-3 rounded-2xl border border-line bg-surface/50 p-6">
        <span className="text-sm font-semibold text-foreground">{t("detail.filesTitle")}</span>
        {files.length === 0 ? (
          <p className="text-sm text-muted">{t("detail.noFiles")}</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {files.map((file) => (
              <li key={file.id}>
                <a
                  href={file.fileUrl}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="text-sm text-blue-soft hover:text-blue-soft/80"
                >
                  {file.fileName}
                </a>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
