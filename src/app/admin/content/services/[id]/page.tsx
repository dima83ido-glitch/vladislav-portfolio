import { notFound } from "next/navigation";
import { getServiceById } from "@/db/queries/content";
import { ServiceForm } from "@/components/admin/ServiceForm";

export default async function EditServicePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const service = await getServiceById(id);
  if (!service) notFound();

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold tracking-tight">Edit service</h1>
      <ServiceForm service={service} />
    </div>
  );
}
