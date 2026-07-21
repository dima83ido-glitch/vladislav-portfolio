import { and, count, desc, eq, gte, inArray, sql } from "drizzle-orm";
import { getDb } from "@/db/client";
import { orders, payments, reviews, safeUserColumns, supportTickets, users } from "@/db/schema";

const CANCELLED_STATUSES = ["cancelled", "payment_rejected"] as const;
/** Orders that made it past checkout — used both for the "converted" pending
 * split and the conversion-rate proxy below. */
const CONVERTED_STATUSES = ["paid", "in_progress", "delivered", "completed"] as const;

export async function getOverviewStats() {
  const db = getDb();

  const [
    [pendingReviews],
    [pendingPayments],
    [openTickets],
    [totalOrders],
    [totalUsers],
    [revenue],
    [todayRevenue],
    [monthRevenue],
    [approvedPaymentCount],
    [completedOrders],
    [cancelledOrders],
    [convertedOrders],
  ] = await Promise.all([
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
    db
      .select({ total: sql<number>`coalesce(sum(${payments.amount}), 0)::int` })
      .from(payments)
      .where(
        and(eq(payments.status, "approved"), gte(payments.updatedAt, sql`date_trunc('day', now())`))
      ),
    db
      .select({ total: sql<number>`coalesce(sum(${payments.amount}), 0)::int` })
      .from(payments)
      .where(
        and(eq(payments.status, "approved"), gte(payments.updatedAt, sql`date_trunc('month', now())`))
      ),
    db.select({ count: count() }).from(payments).where(eq(payments.status, "approved")),
    db.select({ count: count() }).from(orders).where(eq(orders.status, "completed")),
    db
      .select({ count: count() })
      .from(orders)
      .where(inArray(orders.status, [...CANCELLED_STATUSES])),
    db
      .select({ count: count() })
      .from(orders)
      .where(inArray(orders.status, [...CONVERTED_STATUSES])),
  ]);

  const totalOrdersCount = totalOrders?.count ?? 0;
  const totalRevenueCents = revenue?.total ?? 0;
  const approvedPayments = approvedPaymentCount?.count ?? 0;
  const completed = completedOrders?.count ?? 0;
  const cancelled = cancelledOrders?.count ?? 0;

  return {
    pendingReviews: pendingReviews?.count ?? 0,
    pendingPayments: pendingPayments?.count ?? 0,
    openTickets: openTickets?.count ?? 0,
    totalOrders: totalOrdersCount,
    totalUsers: totalUsers?.count ?? 0,
    totalRevenueCents,
    todayRevenueCents: todayRevenue?.total ?? 0,
    monthRevenueCents: monthRevenue?.total ?? 0,
    completedOrders: completed,
    cancelledOrders: cancelled,
    pendingOrders: Math.max(totalOrdersCount - completed - cancelled, 0),
    avgOrderValueCents: approvedPayments > 0 ? Math.round(totalRevenueCents / approvedPayments) : 0,
    // Checkout-conversion proxy: no visit/lead tracking exists, so this is
    // "orders that reached at least `paid`" over all orders ever created.
    conversionRate:
      totalOrdersCount > 0 ? Math.round(((convertedOrders?.count ?? 0) / totalOrdersCount) * 1000) / 10 : 0,
  };
}

export async function getOrdersByDay(days = 30) {
  const db = getDb();
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

  const rows = await db
    .select({
      day: sql<string>`to_char(${orders.createdAt}, 'YYYY-MM-DD')`,
      count: count(),
    })
    .from(orders)
    .where(gte(orders.createdAt, since))
    .groupBy(sql`to_char(${orders.createdAt}, 'YYYY-MM-DD')`)
    .orderBy(sql`to_char(${orders.createdAt}, 'YYYY-MM-DD')`);

  return rows.map((r) => ({ day: r.day, count: r.count }));
}

export async function getLatestOrders(limit = 10) {
  const db = getDb();
  const rows = await db
    .select({ order: orders, user: safeUserColumns })
    .from(orders)
    .innerJoin(users, eq(orders.userId, users.id))
    .orderBy(desc(orders.createdAt))
    .limit(limit);

  return rows;
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
