import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { getSkillGroupById } from "@/db/queries/content";
import { SkillGroupForm } from "@/components/admin/SkillGroupForm";
import { getAdminLocale } from "@/lib/i18n/adminLocale";

export default async function EditSkillGroupPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const group = await getSkillGroupById(id);
  if (!group) notFound();

  const locale = await getAdminLocale();
  const t = await getTranslations({ locale, namespace: "admin.content.skills" });

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold tracking-tight">{t("editTitle")}</h1>
      <SkillGroupForm group={group} />
    </div>
  );
}
