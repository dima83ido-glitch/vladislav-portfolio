"use server";

import { requireUser } from "@/lib/auth/session";
import { markSectionRead, type NotificationSection } from "@/db/queries/notifications";

export async function markNotificationsRead(section: NotificationSection): Promise<{ ok: boolean }> {
  const session = await requireUser().catch(() => null);
  if (!session) {
    return { ok: false };
  }

  await markSectionRead(session.user.id, section);
  return { ok: true };
}
