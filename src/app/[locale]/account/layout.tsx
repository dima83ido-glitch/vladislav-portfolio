import { hasLocale } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import { requireUserOrRedirect } from "@/lib/auth/session";
import { AccountNav } from "@/components/account/AccountNav";
import { GlowBackground } from "@/components/ui/GlowBackground";

type LayoutProps = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export default async function AccountLayout({ children, params }: LayoutProps) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);

  await requireUserOrRedirect("/account");

  return (
    <section className="relative overflow-hidden py-32 lg:py-40">
      <GlowBackground variant="section" />
      <div className="relative mx-auto grid max-w-6xl grid-cols-1 gap-8 px-6 sm:grid-cols-[220px_1fr] lg:px-12">
        <AccountNav />
        <div className="min-w-0">{children}</div>
      </div>
    </section>
  );
}
