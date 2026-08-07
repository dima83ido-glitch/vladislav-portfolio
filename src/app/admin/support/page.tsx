import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { getAllTickets } from "@/db/queries/support";
import { getAdminLocale } from "@/lib/i18n/adminLocale";
import { MarkSectionRead } from "@/components/shared/MarkSectionRead";

const STATUS_STYLES: Record<string, string> = {
  open: "bg-amber-500/10 text-amber-400",
  awaiting_admin: "bg-amber-500/10 text-amber-400",
  awaiting_user: "bg-blue-soft/10 text-blue-soft",
  closed: "bg-line/60 text-muted",
};

export default async function AdminSupportPage() {
  const tickets = await getAllTickets();

  const locale = await getAdminLocale();
  const t = await getTranslations({ locale, namespace: "admin.support" });

  return (
    <div className="flex flex-col gap-8">
      <MarkSectionRead section="support" />
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{t("title")}</h1>
        <p className="mt-1 text-sm text-muted">{t("subtitle")}</p>
      </div>

      {tickets.length === 0 ? (
        <p className="py-12 text-center text-sm text-muted">{t("empty")}</p>
      ) : (
        <div className="flex flex-col gap-3">
          {tickets.map(({ ticket, user }) => (
            <Link
              key={ticket.id}
              href={`/admin/support/${ticket.id}`}
              className="flex flex-col gap-2 rounded-2xl border border-line bg-surface/60 p-5 transition-colors hover:border-blue-soft/50 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="flex flex-col gap-1">
                <span className="font-semibold text-foreground">{ticket.subject}</span>
                <span className="text-xs text-muted">
                  {user.displayName || user.email} ·{" "}
                  {new Intl.DateTimeFormat("en", { dateStyle: "medium" }).format(ticket.updatedAt)}
                </span>
              </div>
              <span
                className={`w-fit rounded-full px-3 py-1 text-xs font-medium ${STATUS_STYLES[ticket.status]}`}
              >
                {t(`status.${ticket.status}`)}
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
