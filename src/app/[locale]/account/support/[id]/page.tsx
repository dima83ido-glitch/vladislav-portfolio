import { hasLocale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { FiArrowLeft } from "react-icons/fi";
import { routing } from "@/i18n/routing";
import { Link } from "@/i18n/navigation";
import { requireUserOrRedirect } from "@/lib/auth/session";
import { getTicketById, getTicketMessages } from "@/db/queries/support";
import { TicketStatusBadge } from "@/components/account/TicketStatusBadge";
import { TicketThread } from "@/components/account/TicketThread";

type PageProps = { params: Promise<{ locale: string; id: string }> };

export default async function TicketPage({ params }: PageProps) {
  const { locale, id } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);

  const session = await requireUserOrRedirect(`/account/support/${id}`);
  const t = await getTranslations("account.support");

  const row = await getTicketById(id);
  if (!row || row.ticket.userId !== session.user.id) notFound();

  const messages = await getTicketMessages(id);

  return (
    <div className="flex flex-col gap-6">
      <Link
        href="/account/support"
        className="inline-flex items-center gap-2 text-xs font-medium uppercase tracking-[0.2em] text-muted transition-colors hover:text-blue-soft"
      >
        <FiArrowLeft size={13} />
        {t("thread.back")}
      </Link>

      <div className="flex items-center justify-between gap-4">
        <h1 className="text-xl font-bold text-foreground">{row.ticket.subject}</h1>
        <TicketStatusBadge status={row.ticket.status} />
      </div>

      <div className="rounded-3xl border border-line bg-surface/60 p-8">
        <TicketThread ticketId={row.ticket.id} messages={messages} isClosed={row.ticket.status === "closed"} />
      </div>
    </div>
  );
}
