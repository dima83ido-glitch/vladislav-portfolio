import { and, count, desc, eq, gte, sql } from "drizzle-orm";
import { getDb } from "@/db/client";
import { orders, payments, reviews, supportTickets, users } from "@/db/schema";

export async function getOverviewStats() {
  const db = getDb();

  const [[pendingReviews], [pendingPayments], [openTickets], [totalOrders], [totalUsers], [revenue]] =
    await Promise.all([
      db.select({ count: count() }).from(reviews).where(eq(reviews.status, "pending")),
      db
        .select({ count: count() })
        .from(payments)
        .where(eq(payments.status, "awaiting_confirmation")),
      db
        .select({ count: count() })
        .from(supportTickets)
        .where(eq(supportTickets.status, "awaiting_admin")),
      db.select({ count: count() }).from(orders),
      db.select({ count: count() }).from(users),
      db
        .select({ total: sql<number>`coalesce(sum(${payments.amount}), 0)::int` })
        .from(payments)
        .where(eq(payments.status, "approved")),
    ]);

  return {
    pendingReviews: pendingReviews?.count ?? 0,
    pendingPayments: pendingPayments?.count ?? 0,
    openTickets: openTickets?.count ?? 0,
    totalOrders: totalOrders?.count ?? 0,
    totalUsers: totalUsers?.count ?? 0,
    totalRevenueCents: revenue?.total ?? 0,
  };
}

export async function getRevenueByDay(days = 30) {
  const db = getDb();
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

  const rows = await db
    .select({
      day: sql<string>`to_char(${payments.updatedAt}, 'YYYY-MM-DD')`,
      total: sql<number>`sum(${payments.amount})::int`,
    })
    .from(payments)
    .where(and(eq(payments.status, "approved"), gte(payments.updatedAt, since)))
    .groupBy(sql`to_char(${payments.updatedAt}, 'YYYY-MM-DD')`)
    .orderBy(sql`to_char(${payments.updatedAt}, 'YYYY-MM-DD')`);

  return rows.map((r) => ({ day: r.day, total: r.total ?? 0 }));
}

export async function getPaymentMethodBreakdown() {
  const db = getDb();
  const rows = await db
    .select({ method: payments.method, count: count() })
    .from(payments)
    .where(eq(payments.status, "approved"))
    .groupBy(payments.method);

  return rows.map((r) => ({ method: r.method, count: r.count }));
}

export async function getOrderStatusBreakdown() {
  const db = getDb();
  const rows = await db
    .select({ status: orders.status, count: count() })
    .from(orders)
    .groupBy(orders.status)
    .orderBy(desc(count()));

  return rows.map((r) => ({ status: r.status, count: r.count }));
}
