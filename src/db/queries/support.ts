import { desc, eq } from "drizzle-orm";
import { getDb } from "@/db/client";
import { safeUserColumns, supportMessages, supportTickets, users } from "@/db/schema";

export async function getTicketsByUser(userId: string) {
  return getDb()
    .select()
    .from(supportTickets)
    .where(eq(supportTickets.userId, userId))
    .orderBy(desc(supportTickets.updatedAt));
}

export async function getAllTickets() {
  return getDb()
    .select({ ticket: supportTickets, user: safeUserColumns })
    .from(supportTickets)
    .innerJoin(users, eq(supportTickets.userId, users.id))
    .orderBy(desc(supportTickets.updatedAt));
}

export async function getTicketById(ticketId: string) {
  const [row] = await getDb()
    .select({ ticket: supportTickets, user: safeUserColumns })
    .from(supportTickets)
    .innerJoin(users, eq(supportTickets.userId, users.id))
    .where(eq(supportTickets.id, ticketId))
    .limit(1);
  return row ?? null;
}

export async function getTicketMessages(ticketId: string) {
  return getDb()
    .select({ message: supportMessages, author: safeUserColumns })
    .from(supportMessages)
    .innerJoin(users, eq(supportMessages.authorId, users.id))
    .where(eq(supportMessages.ticketId, ticketId))
    .orderBy(supportMessages.createdAt);
}
