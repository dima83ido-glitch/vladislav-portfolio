import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { getServiceById } from "@/db/queries/content";
import { ServiceForm } from "@/components/admin/ServiceForm";
import { getAdminLocale } from "@/lib/i18n/adminLocale";

export default async function EditServicePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const service = await getServiceById(id);
  if (!service) notFound();

  const locale = await getAdminLocale();
  const t = await getTranslations({ locale, namespace: "admin.content.services" });

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold tracking-tight">{t("editTitle")}</h1>
      <ServiceForm service={service} />
    </div>
  );
}
