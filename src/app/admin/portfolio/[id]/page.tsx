import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { getProjectById } from "@/db/queries/portfolio";
import { ProjectForm } from "@/components/admin/ProjectForm";
import { getAdminLocale } from "@/lib/i18n/adminLocale";

export default async function EditProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const project = await getProjectById(id);
  if (!project) notFound();

  const locale = await getAdminLocale();
  const t = await getTranslations({ locale, namespace: "admin.portfolio" });

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold tracking-tight">{t("editTitle")}</h1>
      <ProjectForm project={project} />
    </div>
  );
}
