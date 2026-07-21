import { and, desc, eq, ilike } from "drizzle-orm";
import { getDb } from "@/db/client";
import { safeUserColumns, users, type SafeUser } from "@/db/schema";

export type UserStatusFilter = SafeUser["status"] | "all";

/**
 * Deleted users are soft-deleted (status="deleted", row kept for FK/order
 * history integrity) — hidden from the default list unless explicitly
 * filtered for, same idea as an archive view.
 */
export async function searchUsers(query?: string, statusFilter: UserStatusFilter = "active") {
  const db = getDb();

  const conditions = [];
  if (query && query.trim()) {
    conditions.push(ilike(users.email, `%${query.trim()}%`));
  }
  if (statusFilter !== "all") {
    conditions.push(eq(users.status, statusFilter));
  }

  return db
    .select(safeUserColumns)
    .from(users)
    .where(conditions.length ? and(...conditions) : undefined)
    .orderBy(desc(users.createdAt))
    .limit(100);
}
