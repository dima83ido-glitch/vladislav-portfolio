import Link from "next/link";
import { getAboutContent } from "@/db/queries/content";
import { AboutContentForm } from "@/components/admin/AboutContentForm";

export default async function AdminContentPage() {
  const content = await getAboutContent();

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Content</h1>
          <p className="mt-1 text-sm text-muted">About page biography, philosophy cards, and hero stats.</p>
        </div>
        <div className="flex gap-4 text-sm font-medium">
          <Link href="/admin/content/services" className="text-blue-soft hover:text-blue-soft/80">
            Services →
          </Link>
          <Link href="/admin/content/skills" className="text-blue-soft hover:text-blue-soft/80">
            Skills →
          </Link>
        </div>
      </div>

      {!content ? (
        <p className="rounded-2xl border border-line bg-surface/50 p-4 text-sm text-muted">
          Nothing saved yet — the public site is showing its built-in default About content. Fill this in and save to
          take over.
        </p>
      ) : null}

      <AboutContentForm content={content} />
    </div>
  );
}
