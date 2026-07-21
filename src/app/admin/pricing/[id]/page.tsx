import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { getPlanById } from "@/db/queries/pricingPlans";
import { PlanForm } from "@/components/admin/PlanForm";
import { getAdminLocale } from "@/lib/i18n/adminLocale";

export default async function EditPlanPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const plan = await getPlanById(id);
  if (!plan) notFound();

  const locale = await getAdminLocale();
  const t = await getTranslations({ locale, namespace: "admin.pricing" });

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold tracking-tight">{t("editTitle")}</h1>
      <PlanForm plan={plan} />
    </div>
  );
}
