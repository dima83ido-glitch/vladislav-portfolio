"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { getDb } from "@/db/client";
import { supportMessages, supportTickets } from "@/db/schema";
import { requireAdmin, requireUser } from "@/lib/auth/session";
import { checkRateLimit } from "@/lib/security/rate-limit";
import { createTicketSchema, replySchema } from "./validation";

const TICKET_RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;
const TICKET_RATE_LIMIT = 5;

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

    revalidatePath("/account/support");
    revalidatePath("/admin/support");

    return { ok: true, ticketId: ticket.id };
  } catch (error) {
    console.error("Failed to create ticket:", error);
    return { ok: false, error: "generic" };
  }
}

async function assertTicketAccess(ticketId: string, userId: string, isAdmin: boolean) {
  if (isAdmin) return true;
  const db = getDb();
  const [ticket] = await db
    .select({ userId: supportTickets.userId })
    .from(supportTickets)
    .where(eq(supportTickets.id, ticketId))
    .limit(1);
  return ticket?.userId === userId;
}

export async function replyToTicket(
  input: unknown
): Promise<{ ok: true } | { ok: false; error: "invalid" | "forbidden" | "generic" }> {
  const session = await requireUser().catch(() => null);
  if (!session) {
    return { ok: false, error: "invalid" };
  }

  const parsed = replySchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: "invalid" };
  }

  const isAdmin = session.user.role === "admin";
  const hasAccess = await assertTicketAccess(parsed.data.ticketId, session.user.id, isAdmin);
  if (!hasAccess) {
    return { ok: false, error: "forbidden" };
  }

  try {
    const db = getDb();
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
