import Link from "next/link";
import { getAllServicesAdmin } from "@/db/queries/content";
import { DeleteServiceButton } from "@/components/admin/DeleteServiceButton";

export default async function AdminServicesPage() {
  const items = await getAllServicesAdmin();

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Services</h1>
          <Link href="/admin/content" className="text-sm text-muted hover:text-foreground">
            ← Content
          </Link>
        </div>
        <Link
          href="/admin/content/services/new"
          className="rounded-full bg-blue-soft px-5 py-2.5 text-sm font-semibold text-background transition-colors hover:bg-blue-soft/90"
        >
          New service
        </Link>
      </div>

      {items.length === 0 ? (
        <p className="py-12 text-center text-sm text-muted">
          No services yet — the public site is showing its built-in defaults until you add some here.
        </p>
      ) : (
        <div className="flex flex-col gap-3">
          {items.map((item) => (
            <div key={item.id} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-line bg-surface/60 p-5">
              <div>
                <div className="flex items-center gap-3">
                  <span className="font-semibold text-foreground">{item.title.en}</span>
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      item.status === "published" ? "bg-emerald-500/10 text-emerald-400" : "bg-line/60 text-muted"
                    }`}
                  >
                    {item.status}
                  </span>
                </div>
                <span className="text-xs text-muted">{item.slug}</span>
              </div>
              <div className="flex items-center gap-4 text-sm">
                <Link href={`/admin/content/services/${item.id}`} className="font-medium text-blue-soft hover:text-blue-soft/80">
                  Edit
                </Link>
                <DeleteServiceButton id={item.id} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
