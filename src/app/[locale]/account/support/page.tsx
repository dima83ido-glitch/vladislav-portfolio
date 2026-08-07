import { hasLocale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import { Link } from "@/i18n/navigation";
import { requireUserOrRedirect } from "@/lib/auth/session";
import { getTicketsByUser } from "@/db/queries/support";
import { TicketStatusBadge } from "@/components/account/TicketStatusBadge";
import { MarkSectionRead } from "@/components/shared/MarkSectionRead";

type PageProps = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: PageProps) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "account.support" });
  return { title: t("title") };
}

export default async function SupportPage({ params }: PageProps) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);

  const session = await requireUserOrRedirect("/account/support");
  const t = await getTranslations("account.support");
  const tickets = await getTicketsByUser(session.user.id);

  return (
    <div className="flex flex-col gap-6">
      <MarkSectionRead section="support" />
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">{t("title")}</h1>
        <Link
          href="/account/support/new"
          className="rounded-full bg-blue-soft px-5 py-2.5 text-sm font-semibold text-background transition-colors hover:bg-blue-soft/90"
        >
          {t("newTicket")}
        </Link>
      </div>

      {tickets.length === 0 ? (
        <p className="rounded-2xl border border-line bg-surface/50 p-8 text-sm text-muted">
          {t("empty")}
        </p>
      ) : (
        <div className="flex flex-col gap-4">
          {tickets.map((ticket) => (
            <Link
              key={ticket.id}
              href={`/account/support/${ticket.id}`}
              className="flex flex-col gap-3 rounded-2xl border border-line bg-surface/50 p-6 transition-colors hover:border-blue-soft/50 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="flex flex-col gap-1">
                <span className="font-semibold text-foreground">{ticket.subject}</span>
                <span className="text-xs text-muted">
                  {new Intl.DateTimeFormat(locale, { dateStyle: "medium" }).format(ticket.updatedAt)}
                </span>
              </div>
              <TicketStatusBadge status={ticket.status} />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
