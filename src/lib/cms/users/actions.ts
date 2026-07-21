"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { getDb } from "@/db/client";
import { users } from "@/db/schema";
import { requireAdmin } from "@/lib/auth/session";

/**
 * Deliberately narrow: this only ever touches `status`. There is no
 * "make this user admin" action anywhere in the codebase — admin access
 * is exclusively ADMIN_EMAIL-driven (see src/lib/auth/admin.ts), so an
 * arbitrary user can never be promoted through the UI.
 */
export async function setUserStatus(userId: string, status: "active" | "suspended") {
  const session = await requireAdmin();

  if (userId === session.user.id) {
    throw new Error("Cannot change your own account status");
  }

  await getDb().update(users).set({ status }).where(eq(users.id, userId));
  revalidatePath("/admin/users");
}

/**
 * Soft delete only — orders/payments/messages all reference users with
 * `onDelete: "cascade"`, so an actual row delete would silently destroy a
 * customer's order history. Marking `status: "deleted"` instead keeps every
 * relation intact (and reuses the same login/session/order-placement gate
 * that already blocks "suspended" users) while being irreversible from the
 * admin UI, matching "safely removed."
 */
export async function deleteUser(userId: string) {
  const session = await requireAdmin();

  if (userId === session.user.id) {
    throw new Error("Cannot delete your own account");
  }

  await getDb().update(users).set({ status: "deleted" }).where(eq(users.id, userId));
  revalidatePath("/admin/users");
}
