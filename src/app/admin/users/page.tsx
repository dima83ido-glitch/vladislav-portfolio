import { searchUsers } from "@/db/queries/users";
import { requireAdminOrRedirect } from "@/lib/auth/session";
import { UserStatusToggle } from "@/components/admin/UserStatusToggle";

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const session = await requireAdminOrRedirect();
  const { q } = await searchParams;
  const users = await searchUsers(q);

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Users</h1>
        <p className="mt-1 text-sm text-muted">
          {users.length} shown. Role changes aren&apos;t available here — admin access is exclusively
          tied to the ADMIN_EMAIL environment variable.
        </p>
      </div>

      <form className="flex gap-3">
        <input
          type="text"
          name="q"
          defaultValue={q}
          placeholder="Search by email..."
          className="flex-1 rounded-xl border border-line-strong bg-background px-4 py-2.5 text-sm text-foreground outline-none focus:border-blue-soft"
        />
        <button
          type="submit"
          className="rounded-full border border-line-strong px-5 py-2.5 text-sm font-semibold text-foreground transition-colors hover:border-blue-soft"
        >
          Search
        </button>
      </form>

      <div className="flex flex-col gap-3">
        {users.map((user) => (
          <div
            key={user.id}
            className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-line bg-surface/60 p-5"
          >
            <div>
              <div className="flex items-center gap-3">
                <span className="font-semibold text-foreground">{user.displayName || user.email}</span>
                <span
                  className={`rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${
                    user.role === "admin" ? "bg-blue-soft/10 text-blue-soft" : "bg-line/60 text-muted"
                  }`}
                >
                  {user.role}
                </span>
                <span
                  className={`rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${
                    user.status === "active" ? "bg-emerald-500/10 text-emerald-400" : "bg-red-500/10 text-red-400"
                  }`}
                >
                  {user.status}
                </span>
              </div>
              <span className="text-xs text-muted">
                {user.email} · joined {new Intl.DateTimeFormat("en").format(user.createdAt)}
              </span>
            </div>
            {user.id !== session.user.id ? (
              <UserStatusToggle userId={user.id} status={user.status} />
            ) : (
              <span className="text-xs text-muted">You</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
