"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { getDb } from "@/db/client";
import { supportMessages, supportTickets } from "@/db/schema";
import { requireAdmin, requireUser } from "@/lib/auth/session";
import { checkRateLimit } from "@/lib/security/rate-limit";
import { notifyAdmins, notifyUser } from "@/db/queries/notifications";
import { createTicketSchema, replySchema } from "./validation";

const TICKET_RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;
const TICKET_RATE_LIMIT = 5;
const REPLY_RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;
const REPLY_RATE_LIMIT = 20;

export async function createTicket(
  input: unknown
): Promise<{ ok: true; ticketId: string } | { ok: false; error: "invalid" | "rateLimited" | "generic" }> {
  const session = await requireUser().catch(() => null);
  if (!session) {
    return { ok: false, error: "invalid" };
  }

  const parsed = createTicketSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: "invalid" };
  }

  const { limited } = await checkRateLimit(
    `ticket:${session.user.id}`,
    TICKET_RATE_LIMIT,
    TICKET_RATE_LIMIT_WINDOW_MS
  );
  if (limited) {
    return { ok: false, error: "rateLimited" };
  }

  try {
    const db = getDb();
    const [ticket] = await db
      .insert(supportTickets)
      .values({ userId: session.user.id, subject: parsed.data.subject, status: "awaiting_admin" })
      .returning();

    await db.insert(supportMessages).values({
      ticketId: ticket.id,
      authorId: session.user.id,
      body: parsed.data.body,
    });

    await notifyAdmins("support", "new_ticket", ticket.id, session.user.id);

    revalidatePath("/account/support");
    revalidatePath("/admin/support");

    return { ok: true, ticketId: ticket.id };
  } catch (error) {
    console.error("Failed to create ticket:", error);
    return { ok: false, error: "generic" };
  }
}

export async function replyToTicket(
  input: unknown
): Promise<
  { ok: true } | { ok: false; error: "invalid" | "forbidden" | "rateLimited" | "generic" }
> {
  const session = await requireUser().catch(() => null);
  if (!session) {
    return { ok: false, error: "invalid" };
  }

  const parsed = replySchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: "invalid" };
  }

  const isAdmin = session.user.role === "admin";
  const db = getDb();
  const [ticket] = await db
    .select({ userId: supportTickets.userId })
    .from(supportTickets)
    .where(eq(supportTickets.id, parsed.data.ticketId))
    .limit(1);

  if (!ticket || (!isAdmin && ticket.userId !== session.user.id)) {
    return { ok: false, error: "forbidden" };
  }

  const { limited } = await checkRateLimit(
    `ticket-reply:${session.user.id}`,
    REPLY_RATE_LIMIT,
    REPLY_RATE_LIMIT_WINDOW_MS
  );
  if (limited) {
    return { ok: false, error: "rateLimited" };
  }

  try {
    await db.insert(supportMessages).values({
      ticketId: parsed.data.ticketId,
      authorId: session.user.id,
      body: parsed.data.body,
    });

    await db
      .update(supportTickets)
      .set({
        status: isAdmin ? "awaiting_user" : "awaiting_admin",
        updatedAt: new Date(),
      })
      .where(eq(supportTickets.id, parsed.data.ticketId));

    if (isAdmin) {
      await notifyUser(ticket.userId, "support", "support_reply", parsed.data.ticketId);
    } else {
      await notifyAdmins("support", "support_reply", parsed.data.ticketId, session.user.id);
    }

    revalidatePath(`/account/support/${parsed.data.ticketId}`);
    revalidatePath("/admin/support");

    return { ok: true };
  } catch (error) {
    console.error("Failed to reply to ticket:", error);
    return { ok: false, error: "generic" };
  }
}

export async function closeTicket(ticketId: string) {
  await requireAdmin();
  await getDb()
    .update(supportTickets)
    .set({ status: "closed", updatedAt: new Date() })
    .where(eq(supportTickets.id, ticketId));
  revalidatePath("/admin/support");
  revalidatePath(`/account/support/${ticketId}`);
}
