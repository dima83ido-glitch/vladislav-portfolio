import Link from "next/link";
import { getAllTickets } from "@/db/queries/support";

const STATUS_LABELS: Record<string, string> = {
  open: "Open",
  awaiting_admin: "Awaiting reply",
  awaiting_user: "Replied",
  closed: "Closed",
};

const STATUS_STYLES: Record<string, string> = {
  open: "bg-amber-500/10 text-amber-400",
  awaiting_admin: "bg-amber-500/10 text-amber-400",
  awaiting_user: "bg-blue-soft/10 text-blue-soft",
  closed: "bg-line/60 text-muted",
};

export default async function AdminSupportPage() {
  const tickets = await getAllTickets();

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Support</h1>
        <p className="mt-1 text-sm text-muted">All customer support tickets.</p>
      </div>

      {tickets.length === 0 ? (
        <p className="py-12 text-center text-sm text-muted">No support tickets yet.</p>
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
                {STATUS_LABELS[ticket.status]}
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
