import Link from "next/link";
import { cn } from "@/lib/utils";
import { getPaymentsByStatus } from "@/db/queries/payments";
import { PaymentsTable } from "@/components/admin/PaymentsTable";

const TABS = [
  { key: "awaiting_confirmation", label: "Awaiting confirmation" },
  { key: "pending", label: "Pending" },
  { key: "approved", label: "Approved" },
  { key: "rejected", label: "Rejected" },
  { key: "all", label: "All" },
] as const;

type Status = (typeof TABS)[number]["key"];

export default async function AdminPaymentsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status: rawStatus } = await searchParams;
  const status: Status = TABS.some((tab) => tab.key === rawStatus)
    ? (rawStatus as Status)
    : "awaiting_confirmation";

  const rows = await getPaymentsByStatus(status);

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Payments</h1>
        <p className="mt-1 text-sm text-muted">
          Review and confirm crypto payments; card payments confirm automatically via Stripe.
        </p>
      </div>

      <div className="flex items-center gap-2 overflow-x-auto border-b border-line">
        {TABS.map((tab) => (
          <Link
            key={tab.key}
            href={`/admin/payments?status=${tab.key}`}
            className={cn(
              "shrink-0 border-b-2 px-4 py-3 text-sm font-medium transition-colors",
              status === tab.key
                ? "border-blue-soft text-foreground"
                : "border-transparent text-muted hover:text-foreground"
            )}
          >
            {tab.label}
          </Link>
        ))}
      </div>

      <PaymentsTable rows={rows} />
    </div>
  );
}
