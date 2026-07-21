import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { getAllPlansAdmin } from "@/db/queries/pricingPlans";
import { DeletePlanButton } from "@/components/admin/DeletePlanButton";
import { getAdminLocale } from "@/lib/i18n/adminLocale";

export default async function AdminPricingPage() {
  const locale = await getAdminLocale();
  const t = await getTranslations({ locale, namespace: "admin.pricing" });
  const commonT = await getTranslations({ locale, namespace: "admin.common" });
  const plans = await getAllPlansAdmin();

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t("title")}</h1>
          <p className="mt-1 text-sm text-muted">{t("subtitle")}</p>
        </div>
        <Link
          href="/admin/pricing/new"
          className="rounded-full bg-blue-soft px-5 py-2.5 text-sm font-semibold text-background transition-colors hover:bg-blue-soft/90"
        >
          {t("new")}
        </Link>
      </div>

      {plans.length === 0 ? (
        <p className="py-12 text-center text-sm text-muted">{t("empty")}</p>
      ) : (
        <div className="flex flex-col gap-3">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-line bg-surface/60 p-5"
            >
              <div>
                <div className="flex items-center gap-3">
                  <span className="font-semibold text-foreground">{plan.name.en}</span>
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      plan.status === "published" ? "bg-emerald-500/10 text-emerald-400" : "bg-line/60 text-muted"
                    }`}
                  >
                    {commonT(plan.status)}
                  </span>
                  {plan.showOnHomepage ? (
                    <span className="rounded-full bg-blue-soft/10 px-2.5 py-0.5 text-xs font-medium text-blue-soft">
                      {t("homepage")}
                    </span>
                  ) : null}
                </div>
                <span className="text-xs text-muted">
                  {plan.slug} · {plan.price || t("quote")} · {t("order", { n: plan.sortOrder })}
                </span>
              </div>
              <div className="flex items-center gap-4 text-sm">
                <Link href={`/admin/pricing/${plan.id}`} className="font-medium text-blue-soft hover:text-blue-soft/80">
                  {commonT("edit")}
                </Link>
                <DeletePlanButton id={plan.id} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
