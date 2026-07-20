import { hasLocale } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import { requireUserOrRedirect } from "@/lib/auth/session";
import { getOrderForUser } from "@/db/queries/orders";
import { CryptoPaymentForm } from "@/components/account/CryptoPaymentForm";

type PageProps = { params: Promise<{ locale: string; id: string }> };

export default async function CryptoPaymentPage({ params }: PageProps) {
  const { locale, id } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);

  const session = await requireUserOrRedirect(`/account/orders/${id}/pay/crypto`);
  const order = await getOrderForUser(id, session.user.id);
  if (!order || order.status !== "pending_payment") notFound();

  return <CryptoPaymentForm orderId={order.id} />;
}
