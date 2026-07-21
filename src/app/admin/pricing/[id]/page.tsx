import { notFound } from "next/navigation";
import { getPlanById } from "@/db/queries/pricingPlans";
import { PlanForm } from "@/components/admin/PlanForm";

export default async function EditPlanPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const plan = await getPlanById(id);
  if (!plan) notFound();

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold tracking-tight">Edit plan</h1>
      <PlanForm plan={plan} />
    </div>
  );
}
