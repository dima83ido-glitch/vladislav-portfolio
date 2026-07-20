import { hasLocale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import { requireUserOrRedirect } from "@/lib/auth/session";
import { getOrderStats } from "@/db/queries/orders";
import { initials } from "@/lib/utils";
import { ProfileEditForm } from "@/components/account/ProfileEditForm";
import { SecuritySection } from "@/components/account/SecuritySection";
import { LanguageSwitcher } from "@/components/layout/LanguageSwitcher";

type PageProps = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: PageProps) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "account.profile" });
  return { title: t("title") };
}

export default async function ProfilePage({ params }: PageProps) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);

  const session = await requireUserOrRedirect("/account");
  const t = await getTranslations("account.profile");
  const stats = await getOrderStats(session.user.id);

  const memberSince = new Intl.DateTimeFormat(locale, {
    year: "numeric",
    month: "long",
  }).format(session.user.createdAt);

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-6 rounded-3xl border border-line bg-surface/60 p-8">
        <div className="flex flex-wrap items-center gap-5">
          <span className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-soft/10 text-xl font-bold text-blue-soft">
            {initials(session.user)}
          </span>
          <div className="flex flex-col gap-1">
            <span className="text-lg font-bold text-foreground">
              {session.user.displayName || session.user.email.split("@")[0]}
            </span>
            <span className="text-sm text-muted">{t("memberSince", { date: memberSince })}</span>
          </div>
          <span
            className={`ml-auto rounded-full px-3 py-1 text-xs font-medium ${
              session.user.status === "active"
                ? "bg-emerald-500/10 text-emerald-400"
                : "bg-red-500/10 text-red-400"
            }`}
          >
            {session.user.status === "active" ? t("statusActive") : t("statusSuspended")}
          </span>
        </div>

        <div className="grid grid-cols-1 gap-4 border-t border-line pt-6 sm:grid-cols-2">
          <div className="flex flex-col gap-1">
            <span className="text-xs font-medium uppercase tracking-[0.15em] text-muted">
              {t("email")}
            </span>
            <span className="text-sm text-foreground">{session.user.email}</span>
          </div>
        </div>

        <ProfileEditForm
          initialDisplayName={session.user.displayName}
          initialUsername={session.user.username}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {[
          { label: t("stats.completedOrders"), value: stats.completedOrders },
          { label: t("stats.currentOrders"), value: stats.currentOrders },
          {
            label: t("stats.totalSpent"),
            value: `$${(stats.totalSpentCents / 100).toLocaleString(locale)}`,
          },
        ].map((stat) => (
          <div
            key={stat.label}
            className="rounded-2xl border border-line bg-surface/50 p-6"
          >
            <span className="text-2xl font-extrabold tracking-tight text-foreground">
              {stat.value}
            </span>
            <p className="mt-1 text-xs text-muted">{stat.label}</p>
          </div>
        ))}
      </div>

      <SecuritySection />

      <div className="flex items-center justify-between rounded-2xl border border-line bg-surface/50 p-6">
        <span className="text-sm font-medium text-foreground">{t("language")}</span>
        <LanguageSwitcher />
      </div>
    </div>
  );
}
