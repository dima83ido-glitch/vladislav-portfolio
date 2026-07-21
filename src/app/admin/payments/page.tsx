import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { cn } from "@/lib/utils";
import { getPaymentsByStatus } from "@/db/queries/payments";
import { PaymentsTable } from "@/components/admin/PaymentsTable";
import { getAdminLocale } from "@/lib/i18n/adminLocale";

const TAB_KEYS = ["awaiting_confirmation", "pending", "approved", "rejected", "all"] as const;

type Status = (typeof TAB_KEYS)[number];

export default async function AdminPaymentsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status: rawStatus } = await searchParams;
  const status: Status = TAB_KEYS.some((key) => key === rawStatus)
    ? (rawStatus as Status)
    : "awaiting_confirmation";

  const rows = await getPaymentsByStatus(status);

  const locale = await getAdminLocale();
  const t = await getTranslations({ locale, namespace: "admin.payments" });

  const tabs = TAB_KEYS.map((key) => ({ key, label: t(`tabs.${key}`) }));

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{t("title")}</h1>
        <p className="mt-1 text-sm text-muted">{t("subtitle")}</p>
      </div>

      <div className="flex items-center gap-2 overflow-x-auto border-b border-line">
        {tabs.map((tab) => (
          <Link
            key={tab.key}
            href={`/admin/payments?status=${tab.key}`}
            className={cn(
              "shrink-0 border-b-2 px-4 py-3 text-sm font-medium transition-colors",
              status === tab.key
                ? "border-blue-soft text-foreground"
                : "border-transparent text-muted hover:text-foreground"
            )}
          >
            {tab.label}
          </Link>
        ))}
      </div>

      <PaymentsTable rows={rows} />
    </div>
  );
}
