import { getTranslations } from "next-intl/server";
import { SkillGroupForm } from "@/components/admin/SkillGroupForm";
import { getAdminLocale } from "@/lib/i18n/adminLocale";

export default async function NewSkillGroupPage() {
  const locale = await getAdminLocale();
  const t = await getTranslations({ locale, namespace: "admin.content.skills" });

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold tracking-tight">{t("newTitle")}</h1>
      <SkillGroupForm />
    </div>
  );
}
