import Link from "next/link";
import { getAllSkillGroupsAdmin } from "@/db/queries/content";
import { DeleteSkillGroupButton } from "@/components/admin/DeleteSkillGroupButton";

export default async function AdminSkillsPage() {
  const groups = await getAllSkillGroupsAdmin();

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Skills</h1>
          <Link href="/admin/content" className="text-sm text-muted hover:text-foreground">
            ← Content
          </Link>
        </div>
        <Link
          href="/admin/content/skills/new"
          className="rounded-full bg-blue-soft px-5 py-2.5 text-sm font-semibold text-background transition-colors hover:bg-blue-soft/90"
        >
          New group
        </Link>
      </div>

      {groups.length === 0 ? (
        <p className="py-12 text-center text-sm text-muted">
          No skill groups yet — the public site is showing its built-in defaults until you add some here.
        </p>
      ) : (
        <div className="flex flex-col gap-3">
          {groups.map((group) => (
            <div key={group.id} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-line bg-surface/60 p-5">
              <div>
                <span className="font-semibold text-foreground">{group.category.en}</span>
                <span className="ml-3 text-xs text-muted">{group.skills.length} skills</span>
              </div>
              <div className="flex items-center gap-4 text-sm">
                <Link href={`/admin/content/skills/${group.id}`} className="font-medium text-blue-soft hover:text-blue-soft/80">
                  Edit
                </Link>
                <DeleteSkillGroupButton id={group.id} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
