import { notFound } from "next/navigation";
import Link from "next/link";
import { FiArrowLeft } from "react-icons/fi";
import { getTranslations } from "next-intl/server";
import { getTicketById, getTicketMessages } from "@/db/queries/support";
import { AdminTicketThread } from "@/components/admin/AdminTicketThread";
import { getAdminLocale } from "@/lib/i18n/adminLocale";

export default async function AdminTicketPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const row = await getTicketById(id);
  if (!row) notFound();

  const messages = await getTicketMessages(id);

  const locale = await getAdminLocale();
  const t = await getTranslations({ locale, namespace: "admin.support" });

  return (
    <div className="flex flex-col gap-6">
      <Link
        href="/admin/support"
        className="inline-flex items-center gap-2 text-xs font-medium uppercase tracking-[0.2em] text-muted transition-colors hover:text-blue-soft"
      >
        <FiArrowLeft size={13} />
        {t("backToTickets")}
      </Link>

      <div>
        <h1 className="text-xl font-bold text-foreground">{row.ticket.subject}</h1>
        <p className="text-sm text-muted">{row.user.displayName || row.user.email}</p>
      </div>

      <div className="rounded-3xl border border-line bg-surface/60 p-8">
        <AdminTicketThread
          ticketId={row.ticket.id}
          messages={messages}
          isClosed={row.ticket.status === "closed"}
        />
      </div>
    </div>
  );
}
