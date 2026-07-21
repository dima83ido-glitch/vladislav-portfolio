import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { cn } from "@/lib/utils";
import { getReviewsByStatus } from "@/db/queries/reviews";
import { ReviewsTable } from "@/components/admin/ReviewsTable";
import { getAdminLocale } from "@/lib/i18n/adminLocale";

const TAB_KEYS = ["pending", "approved", "rejected", "all"] as const;

type Status = (typeof TAB_KEYS)[number];

type PageProps = {
  searchParams: Promise<{ status?: string }>;
};

export default async function AdminReviewsPage({ searchParams }: PageProps) {
  const { status: rawStatus } = await searchParams;
  const status: Status = TAB_KEYS.some((key) => key === rawStatus)
    ? (rawStatus as Status)
    : "pending";

  const reviews = await getReviewsByStatus(status);

  const locale = await getAdminLocale();
  const t = await getTranslations({ locale, namespace: "admin.reviews" });

  const tabs = TAB_KEYS.map((key) => ({ key, label: t(`tabs.${key}`) }));

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{t("title")}</h1>
        <p className="mt-1 text-sm text-muted">{t("subtitle")}</p>
      </div>

      <div className="flex items-center gap-2 border-b border-line">
        {tabs.map((tab) => (
          <Link
            key={tab.key}
            href={`/admin/reviews?status=${tab.key}`}
            className={cn(
              "border-b-2 px-4 py-3 text-sm font-medium transition-colors",
              status === tab.key
                ? "border-blue-soft text-foreground"
                : "border-transparent text-muted hover:text-foreground"
            )}
          >
            {tab.label}
          </Link>
        ))}
      </div>

      <ReviewsTable reviews={reviews} />
    </div>
  );
}
