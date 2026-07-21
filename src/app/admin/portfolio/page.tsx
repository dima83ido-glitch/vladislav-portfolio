import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { getAllProjectsAdmin } from "@/db/queries/portfolio";
import { DeleteProjectButton } from "@/components/admin/DeleteProjectButton";
import { getAdminLocale } from "@/lib/i18n/adminLocale";

export default async function AdminPortfolioPage() {
  const locale = await getAdminLocale();
  const t = await getTranslations({ locale, namespace: "admin.portfolio" });
  const commonT = await getTranslations({ locale, namespace: "admin.common" });
  const projects = await getAllProjectsAdmin();

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t("title")}</h1>
          <p className="mt-1 text-sm text-muted">{t("subtitle")}</p>
        </div>
        <Link
          href="/admin/portfolio/new"
          className="rounded-full bg-blue-soft px-5 py-2.5 text-sm font-semibold text-background transition-colors hover:bg-blue-soft/90"
        >
          {t("new")}
        </Link>
      </div>

      {projects.length === 0 ? (
        <p className="py-12 text-center text-sm text-muted">{t("empty")}</p>
      ) : (
        <div className="flex flex-col gap-3">
          {projects.map((project) => (
            <div
              key={project.id}
              className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-line bg-surface/60 p-5"
            >
              <div>
                <div className="flex items-center gap-3">
                  <span className="font-semibold text-foreground">{project.title.en}</span>
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      project.status === "published"
                        ? "bg-emerald-500/10 text-emerald-400"
                        : "bg-line/60 text-muted"
                    }`}
                  >
                    {commonT(project.status)}
                  </span>
                </div>
                <span className="text-xs text-muted">{project.slug}</span>
              </div>
              <div className="flex items-center gap-4 text-sm">
                <Link href={`/admin/portfolio/${project.id}`} className="font-medium text-blue-soft hover:text-blue-soft/80">
                  {commonT("edit")}
                </Link>
                <DeleteProjectButton id={project.id} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
