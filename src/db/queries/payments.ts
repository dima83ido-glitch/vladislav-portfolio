import { desc, eq } from "drizzle-orm";
import { getDb } from "@/db/client";
import { orders, payments, safeUserColumns, users } from "@/db/schema";

export async function getPaymentsByStatus(status: "pending" | "awaiting_confirmation" | "approved" | "rejected" | "failed" | "all") {
  const db = getDb();
  const query = db
    .select({ payment: payments, order: orders, user: safeUserColumns })
    .from(payments)
    .innerJoin(orders, eq(payments.orderId, orders.id))
    .innerJoin(users, eq(payments.userId, users.id))
    .orderBy(desc(payments.createdAt));

  if (status === "all") return query;

  return db
    .select({ payment: payments, order: orders, user: safeUserColumns })
    .from(payments)
    .innerJoin(orders, eq(payments.orderId, orders.id))
    .innerJoin(users, eq(payments.userId, users.id))
    .where(eq(payments.status, status))
    .orderBy(desc(payments.createdAt));
}

export async function getPaymentById(paymentId: string) {
  const [row] = await getDb()
    .select({ payment: payments, order: orders, user: safeUserColumns })
    .from(payments)
    .innerJoin(orders, eq(payments.orderId, orders.id))
    .innerJoin(users, eq(payments.userId, users.id))
    .where(eq(payments.id, paymentId))
    .limit(1);
  return row ?? null;
}
