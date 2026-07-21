import { hasLocale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { FiArrowLeft } from "react-icons/fi";
import { routing } from "@/i18n/routing";
import { Link } from "@/i18n/navigation";
import { requireUserOrRedirect } from "@/lib/auth/session";
import { getOrderForUser } from "@/db/queries/orders";
import { CryptoPaymentForm } from "@/components/account/CryptoPaymentForm";
import { HomeButton } from "@/components/ui/HomeButton";

type PageProps = { params: Promise<{ locale: string; id: string }> };

export default async function CryptoPaymentPage({ params }: PageProps) {
  const { locale, id } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);

  const session = await requireUserOrRedirect(`/account/orders/${id}/pay/crypto`);
  const order = await getOrderForUser(id, session.user.id);
  if (!order || order.status !== "pending_payment") notFound();

  const t = await getTranslations("account.orders");
  const commonT = await getTranslations("common");

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-4">
        <Link
          href={`/account/orders/${order.id}`}
          className="inline-flex items-center gap-2 text-xs font-medium uppercase tracking-[0.2em] text-muted transition-colors hover:text-blue-soft"
        >
          <FiArrowLeft size={13} />
          {t("detail.backToOrder")}
        </Link>
        <HomeButton label={commonT("home")} />
      </div>
      <CryptoPaymentForm orderId={order.id} />
    </div>
  );
}
