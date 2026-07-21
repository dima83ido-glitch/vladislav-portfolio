import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { getAllServicesAdmin } from "@/db/queries/content";
import { DeleteServiceButton } from "@/components/admin/DeleteServiceButton";
import { getAdminLocale } from "@/lib/i18n/adminLocale";

export default async function AdminServicesPage() {
  const items = await getAllServicesAdmin();
  const locale = await getAdminLocale();
  const t = await getTranslations({ locale, namespace: "admin.content.services" });
  const commonT = await getTranslations({ locale, namespace: "admin.common" });

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t("title")}</h1>
          <Link href="/admin/content" className="text-sm text-muted hover:text-foreground">
            {commonT("backToContent")}
          </Link>
        </div>
        <Link
          href="/admin/content/services/new"
          className="rounded-full bg-blue-soft px-5 py-2.5 text-sm font-semibold text-background transition-colors hover:bg-blue-soft/90"
        >
          {t("new")}
        </Link>
      </div>

      {items.length === 0 ? (
        <p className="py-12 text-center text-sm text-muted">
          {t("empty")}
        </p>
      ) : (
        <div className="flex flex-col gap-3">
          {items.map((item) => (
            <div key={item.id} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-line bg-surface/60 p-5">
              <div>
                <div className="flex items-center gap-3">
                  <span className="font-semibold text-foreground">{item.title.en}</span>
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      item.status === "published" ? "bg-emerald-500/10 text-emerald-400" : "bg-line/60 text-muted"
                    }`}
                  >
                    {item.status}
                  </span>
                </div>
                <span className="text-xs text-muted">{item.slug}</span>
              </div>
              <div className="flex items-center gap-4 text-sm">
                <Link href={`/admin/content/services/${item.id}`} className="font-medium text-blue-soft hover:text-blue-soft/80">
                  {commonT("edit")}
                </Link>
                <DeleteServiceButton id={item.id} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
