import { and, eq, sql } from "drizzle-orm";
import { getDb } from "@/db/client";
import { notifications, users, type notificationSectionEnum } from "@/db/schema";

export type NotificationSection = (typeof notificationSectionEnum.enumValues)[number];

export async function getUnreadCounts(userId: string): Promise<{ support: number; orders: number }> {
  const [row] = await getDb()
    .select({
      support: sql<number>`count(*) filter (where ${notifications.section} = 'support')::int`,
      orders: sql<number>`count(*) filter (where ${notifications.section} = 'orders')::int`,
    })
    .from(notifications)
    .where(and(eq(notifications.userId, userId), eq(notifications.isRead, false)));

  return { support: row?.support ?? 0, orders: row?.orders ?? 0 };
}

export async function markSectionRead(userId: string, section: NotificationSection): Promise<void> {
  await getDb()
    .update(notifications)
    .set({ isRead: true })
    .where(
      and(
        eq(notifications.userId, userId),
        eq(notifications.section, section),
        eq(notifications.isRead, false)
      )
    );
}

export async function notifyUser(
  userId: string,
  section: NotificationSection,
  kind: string,
  resourceId?: string
): Promise<void> {
  await getDb().insert(notifications).values({ userId, section, kind, resourceId });
}

/**
 * Fans an event out to every active admin as one row each — a shared row
 * would mean one admin reading it clears it for every other admin too.
 * `excludeUserId` skips the acting admin so replying to your own ticket
 * doesn't notify yourself (mirrors the isAdmin branching already in
 * replyToTicket/postOrderMessage).
 */
export async function notifyAdmins(
  section: NotificationSection,
  kind: string,
  resourceId?: string,
  excludeUserId?: string
): Promise<void> {
  const admins = await getDb()
    .select({ id: users.id })
    .from(users)
    .where(and(eq(users.role, "admin"), eq(users.status, "active")));

  const recipients = admins.filter((admin) => admin.id !== excludeUserId);
  if (recipients.length === 0) return;

  await getDb()
    .insert(notifications)
    .values(recipients.map((admin) => ({ userId: admin.id, section, kind, resourceId })));
}
