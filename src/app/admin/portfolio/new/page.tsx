import { getTranslations } from "next-intl/server";
import { ProjectForm } from "@/components/admin/ProjectForm";
import { getAdminLocale } from "@/lib/i18n/adminLocale";

export default async function NewProjectPage() {
  const locale = await getAdminLocale();
  const t = await getTranslations({ locale, namespace: "admin.portfolio" });

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold tracking-tight">{t("newTitle")}</h1>
      <ProjectForm />
    </div>
  );
}
