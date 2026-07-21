import Link from "next/link";
import { getAllProjectsAdmin } from "@/db/queries/portfolio";
import { DeleteProjectButton } from "@/components/admin/DeleteProjectButton";

export default async function AdminPortfolioPage() {
  const projects = await getAllProjectsAdmin();

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Portfolio</h1>
          <p className="mt-1 text-sm text-muted">Manage case studies shown on the public site.</p>
        </div>
        <Link
          href="/admin/portfolio/new"
          className="rounded-full bg-blue-soft px-5 py-2.5 text-sm font-semibold text-background transition-colors hover:bg-blue-soft/90"
        >
          New project
        </Link>
      </div>

      {projects.length === 0 ? (
        <p className="py-12 text-center text-sm text-muted">
          No projects yet — the public site is showing its built-in default case studies until you add some here.
        </p>
      ) : (
        <div className="flex flex-col gap-3">
          {projects.map((project) => (
            <div
              key={project.id}
              className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-line bg-surface/60 p-5"
            >
              <div>
                <div className="flex items-center gap-3">
                  <span className="font-semibold text-foreground">{project.title.en}</span>
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      project.status === "published"
                        ? "bg-emerald-500/10 text-emerald-400"
                        : "bg-line/60 text-muted"
                    }`}
                  >
                    {project.status}
                  </span>
                </div>
                <span className="text-xs text-muted">{project.slug}</span>
              </div>
              <div className="flex items-center gap-4 text-sm">
                <Link href={`/admin/portfolio/${project.id}`} className="font-medium text-blue-soft hover:text-blue-soft/80">
                  Edit
                </Link>
                <DeleteProjectButton id={project.id} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
