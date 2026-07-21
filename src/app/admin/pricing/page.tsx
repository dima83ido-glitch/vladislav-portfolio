import Link from "next/link";
import { getAllPlansAdmin } from "@/db/queries/pricingPlans";
import { DeletePlanButton } from "@/components/admin/DeletePlanButton";

export default async function AdminPricingPage() {
  const plans = await getAllPlansAdmin();

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Pricing</h1>
          <p className="mt-1 text-sm text-muted">Manage plans shown on the homepage and /pricing.</p>
        </div>
        <Link
          href="/admin/pricing/new"
          className="rounded-full bg-blue-soft px-5 py-2.5 text-sm font-semibold text-background transition-colors hover:bg-blue-soft/90"
        >
          New plan
        </Link>
      </div>

      {plans.length === 0 ? (
        <p className="py-12 text-center text-sm text-muted">
          No plans yet — the public site is showing its built-in default pricing until you add some here.
        </p>
      ) : (
        <div className="flex flex-col gap-3">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-line bg-surface/60 p-5"
            >
              <div>
                <div className="flex items-center gap-3">
                  <span className="font-semibold text-foreground">{plan.name.en}</span>
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      plan.status === "published" ? "bg-emerald-500/10 text-emerald-400" : "bg-line/60 text-muted"
                    }`}
                  >
                    {plan.status}
                  </span>
                  {plan.showOnHomepage ? (
                    <span className="rounded-full bg-blue-soft/10 px-2.5 py-0.5 text-xs font-medium text-blue-soft">
                      homepage
                    </span>
                  ) : null}
                </div>
                <span className="text-xs text-muted">
                  {plan.slug} · {plan.price || "quote"} · order {plan.sortOrder}
                </span>
              </div>
              <div className="flex items-center gap-4 text-sm">
                <Link href={`/admin/pricing/${plan.id}`} className="font-medium text-blue-soft hover:text-blue-soft/80">
                  Edit
                </Link>
                <DeletePlanButton id={plan.id} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
