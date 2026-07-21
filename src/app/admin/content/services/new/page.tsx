import { ServiceForm } from "@/components/admin/ServiceForm";

export default function NewServicePage() {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold tracking-tight">New service</h1>
      <ServiceForm />
    </div>
  );
}
