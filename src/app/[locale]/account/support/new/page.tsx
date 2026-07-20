import { hasLocale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import { requireUserOrRedirect } from "@/lib/auth/session";
import { NewTicketForm } from "@/components/account/NewTicketForm";

type PageProps = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: PageProps) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "account.support" });
  return { title: t("new.title") };
}

export default async function NewTicketPage({ params }: PageProps) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);

  await requireUserOrRedirect("/account/support/new");

  return <NewTicketForm />;
}
