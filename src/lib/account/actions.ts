"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { getDb } from "@/db/client";
import { users } from "@/db/schema";
import { destroyOtherSessions, requireUser } from "@/lib/auth/session";
import { updateProfileSchema } from "./validation";

export async function updateProfile(
  input: unknown
): Promise<{ ok: true } | { ok: false; error: "invalid" | "usernameTaken" | "generic" }> {
  const session = await requireUser().catch(() => null);
  if (!session) {
    return { ok: false, error: "invalid" };
  }

  const parsed = updateProfileSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: "invalid" };
  }

  try {
    if (parsed.data.username) {
      const [existing] = await getDb()
        .select({ id: users.id })
        .from(users)
        .where(eq(users.username, parsed.data.username))
        .limit(1);
      if (existing && existing.id !== session.user.id) {
        return { ok: false, error: "usernameTaken" };
      }
    }

    await getDb()
      .update(users)
      .set({ displayName: parsed.data.displayName, username: parsed.data.username })
      .where(eq(users.id, session.user.id));

    revalidatePath("/account");
    return { ok: true };
  } catch (error) {
    console.error("Failed to update profile:", error);
    return { ok: false, error: "generic" };
  }
}

export async function signOutEverywhere(): Promise<{ ok: boolean }> {
  const session = await requireUser().catch(() => null);
  if (!session) {
    return { ok: false };
  }

  await destroyOtherSessions(session.user.id, session.sessionId);
  return { ok: true };
}
