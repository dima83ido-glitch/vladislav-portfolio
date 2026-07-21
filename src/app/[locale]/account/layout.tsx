import { hasLocale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import { requireUserOrRedirect } from "@/lib/auth/session";
import { AccountNav } from "@/components/account/AccountNav";
import { GlowBackground } from "@/components/ui/GlowBackground";
import { BackButton } from "@/components/ui/BackButton";

type LayoutProps = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export default async function AccountLayout({ children, params }: LayoutProps) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);

  await requireUserOrRedirect("/account");
  const t = await getTranslations("common");

  return (
    <section className="relative overflow-hidden py-32 lg:py-40">
      <GlowBackground variant="section" />
      <div className="relative mx-auto max-w-6xl px-6 lg:px-12">
        <BackButton label={t("back")} className="mb-6" />
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-[220px_1fr]">
          <AccountNav />
          <div className="min-w-0">{children}</div>
        </div>
      </div>
    </section>
  );
}
