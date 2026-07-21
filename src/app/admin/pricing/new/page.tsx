import { PlanForm } from "@/components/admin/PlanForm";

export default function NewPlanPage() {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold tracking-tight">New plan</h1>
      <PlanForm />
    </div>
  );
}
