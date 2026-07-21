import { getTranslations } from "next-intl/server";
import { isStripeConfigured } from "@/lib/payments/stripe";
import { isCloudinaryConfigured } from "@/lib/media/cloudinary";
import { getAdminLocale } from "@/lib/i18n/adminLocale";

function StatusBadge({ ok, configuredLabel, notConfiguredLabel }: { ok: boolean; configuredLabel: string; notConfiguredLabel: string }) {
  return (
    <span
      className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
        ok ? "bg-emerald-500/10 text-emerald-400" : "bg-line/60 text-muted"
      }`}
    >
      {ok ? configuredLabel : notConfiguredLabel}
    </span>
  );
}

export default async function AdminSettingsPage() {
  const locale = await getAdminLocale();
  const t = await getTranslations({ locale, namespace: "admin.settings" });

  const rows = [
    { label: t("database"), ok: Boolean(process.env.DATABASE_URL) },
    { label: t("email"), ok: Boolean(process.env.RESEND_API_KEY) },
    { label: t("cardPayments"), ok: isStripeConfigured() },
    { label: t("mediaStorage"), ok: isCloudinaryConfigured() },
  ];

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{t("title")}</h1>
        <p className="mt-1 text-sm text-muted">{t("subtitle")}</p>
      </div>

      <div className="flex flex-col gap-3">
        {rows.map((row) => (
          <div
            key={row.label}
            className="flex items-center justify-between rounded-2xl border border-line bg-surface/60 p-5"
          >
            <span className="text-sm font-medium text-foreground">{row.label}</span>
            <StatusBadge ok={row.ok} configuredLabel={t("configured")} notConfiguredLabel={t("notConfigured")} />
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-line bg-surface/60 p-5">
        <span className="text-sm font-medium text-foreground">{t("adminAccountTitle")}</span>
        <p className="mt-1 text-xs text-muted">{t("adminAccountBody")}</p>
      </div>
    </div>
  );
}
