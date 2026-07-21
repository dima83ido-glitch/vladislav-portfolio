import { and, desc, eq, inArray, sql } from "drizzle-orm";
import { getDb } from "@/db/client";
import { orderFiles, orderMessages, orders, payments, safeUserColumns, users } from "@/db/schema";

const CURRENT_STATUSES = ["pending_payment", "paid", "in_progress", "delivered"] as const;

export async function getOrdersByUser(userId: string) {
  return getDb().select().from(orders).where(eq(orders.userId, userId)).orderBy(desc(orders.createdAt));
}

export async function getOrderForUser(orderId: string, userId: string) {
  const [order] = await getDb()
    .select()
    .from(orders)
    .where(and(eq(orders.id, orderId), eq(orders.userId, userId)))
    .limit(1);
  return order ?? null;
}

export async function getOrderForAdmin(orderId: string) {
  const [order] = await getDb().select().from(orders).where(eq(orders.id, orderId)).limit(1);
  return order ?? null;
}

export async function getOrderMessages(orderId: string) {
  return getDb()
    .select({ message: orderMessages, author: safeUserColumns })
    .from(orderMessages)
    .innerJoin(users, eq(orderMessages.authorId, users.id))
    .where(eq(orderMessages.orderId, orderId))
    .orderBy(orderMessages.createdAt);
}

export async function getOrderFiles(orderId: string) {
  return getDb().select().from(orderFiles).where(eq(orderFiles.orderId, orderId)).orderBy(desc(orderFiles.createdAt));
}

export async function getLatestApprovedPayment(orderId: string) {
  const [payment] = await getDb()
    .select()
    .from(payments)
    .where(and(eq(payments.orderId, orderId), eq(payments.status, "approved")))
    .orderBy(desc(payments.updatedAt))
    .limit(1);
  return payment ?? null;
}

export async function getOrderStats(userId: string) {
  const db = getDb();

  const [completed] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(orders)
    .where(and(eq(orders.userId, userId), eq(orders.status, "completed")));

  const [current] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(orders)
    .where(and(eq(orders.userId, userId), inArray(orders.status, [...CURRENT_STATUSES])));

  const [spent] = await db
    .select({ total: sql<number>`coalesce(sum(${orders.price}), 0)::int` })
    .from(orders)
    .where(
      and(
        eq(orders.userId, userId),
        inArray(orders.status, ["paid", "in_progress", "delivered", "completed"])
      )
    );

  return {
    completedOrders: completed?.count ?? 0,
    currentOrders: current?.count ?? 0,
    totalSpentCents: spent?.total ?? 0,
  };
}
