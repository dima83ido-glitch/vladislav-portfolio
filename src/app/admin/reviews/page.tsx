import Link from "next/link";
import { cn } from "@/lib/utils";
import { getReviewsByStatus } from "@/db/queries/reviews";
import { ReviewsTable } from "@/components/admin/ReviewsTable";

const TABS = [
  { key: "pending", label: "Pending" },
  { key: "approved", label: "Approved" },
  { key: "rejected", label: "Rejected" },
  { key: "all", label: "All" },
] as const;

type Status = (typeof TABS)[number]["key"];

type PageProps = {
  searchParams: Promise<{ status?: string }>;
};

export default async function AdminReviewsPage({ searchParams }: PageProps) {
  const { status: rawStatus } = await searchParams;
  const status: Status = TABS.some((tab) => tab.key === rawStatus)
    ? (rawStatus as Status)
    : "pending";

  const reviews = await getReviewsByStatus(status);

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Reviews</h1>
        <p className="mt-1 text-sm text-muted">
          Moderate visitor-submitted reviews before they appear on the public site.
        </p>
      </div>

      <div className="flex items-center gap-2 border-b border-line">
        {TABS.map((tab) => (
          <Link
            key={tab.key}
            href={`/admin/reviews?status=${tab.key}`}
            className={cn(
              "border-b-2 px-4 py-3 text-sm font-medium transition-colors",
              status === tab.key
                ? "border-blue-soft text-foreground"
                : "border-transparent text-muted hover:text-foreground"
            )}
          >
            {tab.label}
          </Link>
        ))}
      </div>

      <ReviewsTable reviews={reviews} />
    </div>
  );
}
