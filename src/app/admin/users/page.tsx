import { getTranslations } from "next-intl/server";
import { searchUsers, type UserStatusFilter } from "@/db/queries/users";
import { requireAdminOrRedirect } from "@/lib/auth/session";
import { UserStatusToggle } from "@/components/admin/UserStatusToggle";
import { DeleteUserButton } from "@/components/admin/DeleteUserButton";
import { UserAvatar } from "@/components/shared/UserAvatar";
import { getAdminLocale } from "@/lib/i18n/adminLocale";

const STATUS_FILTERS: UserStatusFilter[] = ["active", "suspended", "deleted", "all"];

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string }>;
}) {
  const session = await requireAdminOrRedirect();
  const { q, status: rawStatus } = await searchParams;
  const status: UserStatusFilter = STATUS_FILTERS.includes(rawStatus as UserStatusFilter)
    ? (rawStatus as UserStatusFilter)
    : "active";

  const locale = await getAdminLocale();
  const t = await getTranslations({ locale, namespace: "admin.users" });
  const commonT = await getTranslations({ locale, namespace: "admin.common" });
  const users = await searchUsers(q, status);

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{t("title")}</h1>
        <p className="mt-1 text-sm text-muted">{t("subtitle", { count: users.length })}</p>
      </div>

      <form className="flex flex-wrap gap-3">
        <input
          type="text"
          name="q"
          defaultValue={q}
          placeholder={commonT("searchByEmail")}
          className="flex-1 rounded-xl border border-line-strong bg-background px-4 py-2.5 text-sm text-foreground outline-none focus:border-blue-soft"
        />
        <select
          name="status"
          defaultValue={status}
          className="rounded-xl border border-line-strong bg-background px-4 py-2.5 text-sm text-foreground outline-none focus:border-blue-soft"
        >
          <option value="active">{t("filterActive")}</option>
          <option value="suspended">{t("filterSuspended")}</option>
          <option value="deleted">{t("filterDeleted")}</option>
          <option value="all">{t("filterAll")}</option>
        </select>
        <button
          type="submit"
          className="rounded-full border border-line-strong px-5 py-2.5 text-sm font-semibold text-foreground transition-colors hover:border-blue-soft"
        >
          {commonT("search")}
        </button>
      </form>

      {users.length === 0 ? (
        <p className="py-12 text-center text-sm text-muted">{t("noResults")}</p>
      ) : (
        <div className="flex flex-col gap-3">
          {users.map((user) => (
            <div
              key={user.id}
              className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-line bg-surface/60 p-5"
            >
              <div className="flex items-center gap-3">
                <UserAvatar
                  user={user}
                  size={36}
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-soft/10 text-xs font-bold text-blue-soft"
                />
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
                      className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        user.status === "active"
                          ? "bg-emerald-500/10 text-emerald-400"
                          : user.status === "suspended"
                            ? "bg-red-500/10 text-red-400"
                            : "bg-line/60 text-muted"
                      }`}
                    >
                      {t(`status.${user.status}`)}
                    </span>
                  </div>
                  <span className="text-xs text-muted">
                    {user.email} · {t("joined", { date: new Intl.DateTimeFormat(locale).format(user.createdAt) })}
                  </span>
                </div>
              </div>
              {user.id !== session.user.id ? (
                <div className="flex items-center gap-4">
                  {user.status !== "deleted" ? (
                    <>
                      <UserStatusToggle userId={user.id} status={user.status} />
                      <DeleteUserButton userId={user.id} />
                    </>
                  ) : null}
                </div>
              ) : (
                <span className="text-xs text-muted">{commonT("you")}</span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
