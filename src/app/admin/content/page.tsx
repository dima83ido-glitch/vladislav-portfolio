import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { getAboutContent } from "@/db/queries/content";
import { AboutContentForm } from "@/components/admin/AboutContentForm";
import { getAdminLocale } from "@/lib/i18n/adminLocale";

export default async function AdminContentPage() {
  const content = await getAboutContent();
  const locale = await getAdminLocale();
  const t = await getTranslations({ locale, namespace: "admin.content" });

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t("title")}</h1>
          <p className="mt-1 text-sm text-muted">{t("subtitle")}</p>
        </div>
        <div className="flex gap-4 text-sm font-medium">
          <Link href="/admin/content/services" className="text-blue-soft hover:text-blue-soft/80">
            {t("servicesLink")}
          </Link>
          <Link href="/admin/content/skills" className="text-blue-soft hover:text-blue-soft/80">
            {t("skillsLink")}
          </Link>
        </div>
      </div>

      {!content ? (
        <p className="rounded-2xl border border-line bg-surface/50 p-4 text-sm text-muted">
          {t("empty")}
        </p>
      ) : null}

      <AboutContentForm content={content} />
    </div>
  );
}
