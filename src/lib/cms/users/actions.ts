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
