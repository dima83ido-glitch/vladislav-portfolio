import { notFound } from "next/navigation";
import { getProjectById } from "@/db/queries/portfolio";
import { ProjectForm } from "@/components/admin/ProjectForm";

export default async function EditProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const project = await getProjectById(id);
  if (!project) notFound();

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold tracking-tight">Edit project</h1>
      <ProjectForm project={project} />
    </div>
  );
}
