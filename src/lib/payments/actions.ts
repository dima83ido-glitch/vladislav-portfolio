"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { getDb } from "@/db/client";
import { orders, payments, users } from "@/db/schema";
import { requireAdmin, requireUser } from "@/lib/auth/session";
import { checkRateLimit } from "@/lib/security/rate-limit";
import { sendOrderPaidEmail } from "@/lib/email/resend";
import { getStripeClient, isStripeConfigured } from "@/lib/payments/stripe";
import { SITE } from "@/lib/data/site";
import { notifyUser } from "@/db/queries/notifications";
import { cryptoPaymentSchema } from "./validation";

const CRYPTO_SUBMIT_RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;

export async function submitCryptoPayment(
  input: unknown
): Promise<
  { ok: true } | { ok: false; error: "invalid" | "forbidden" | "rateLimited" | "generic" }
> {
  const session = await requireUser().catch(() => null);
  if (!session) {
    return { ok: false, error: "invalid" };
  }

  const parsed = cryptoPaymentSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: "invalid" };
  }

  const db = getDb();
  const [order] = await db
    .select()
    .from(orders)
    .where(eq(orders.id, parsed.data.orderId))
    .limit(1);

  if (!order || order.userId !== session.user.id) {
    return { ok: false, error: "forbidden" };
  }

  const { limited } = await checkRateLimit(
    `crypto-payment:${session.user.id}`,
    5,
    CRYPTO_SUBMIT_RATE_LIMIT_WINDOW_MS
  );
  if (limited) {
    return { ok: false, error: "rateLimited" };
  }

  try {
    await db.insert(payments).values({
      orderId: order.id,
      userId: session.user.id,
      method: "crypto",
      amount: order.price,
      currency: order.currency,
      status: "awaiting_confirmation",
      cryptoCurrency: parsed.data.currency,
      cryptoTxHash: parsed.data.txHash,
    });

    revalidatePath(`/account/orders/${order.id}`);
    revalidatePath("/admin/payments");

    return { ok: true };
  } catch (error) {
    console.error("Failed to submit crypto payment:", error);
    return { ok: false, error: "generic" };
  }
}

export async function createStripeCheckoutSession(orderId: string) {
  const session = await requireUser();

  if (!isStripeConfigured()) {
    throw new Error("Stripe is not configured");
  }

  const db = getDb();
  const [order] = await db.select().from(orders).where(eq(orders.id, orderId)).limit(1);

  if (!order || order.userId !== session.user.id) {
    throw new Error("Forbidden");
  }

  const stripe = getStripeClient();
  const checkoutSession = await stripe.checkout.sessions.create({
    mode: "payment",
    payment_method_types: ["card"],
    customer_email: session.user.email,
    line_items: [
      {
        price_data: {
          currency: order.currency,
          unit_amount: order.price,
          product_data: { name: order.title },
        },
        quantity: 1,
      },
    ],
    success_url: `${SITE.url}/account/orders/${order.id}?payment=success`,
    cancel_url: `${SITE.url}/account/orders/${order.id}?payment=cancelled`,
    metadata: { orderId: order.id, userId: session.user.id },
  });

  await db.insert(payments).values({
    orderId: order.id,
    userId: session.user.id,
    method: "stripe",
    amount: order.price,
    currency: order.currency,
    status: "pending",
    stripeSessionId: checkoutSession.id,
  });

  if (!checkoutSession.url) {
    throw new Error("Stripe did not return a checkout URL");
  }

  redirect(checkoutSession.url);
}

async function notifyOrderPaid(orderId: string) {
  const db = getDb();
  const [row] = await db
    .select({ order: orders, userEmail: users.email })
    .from(orders)
    .innerJoin(users, eq(orders.userId, users.id))
    .where(eq(orders.id, orderId))
    .limit(1);
  if (!row) return;

  try {
    await sendOrderPaidEmail(row.userEmail, row.order.title);
  } catch (error) {
    console.error("Failed to send order-paid email:", error);
  }
}

export async function approvePayment(paymentId: string) {
  const session = await requireAdmin();
  const db = getDb();

  const [payment] = await db.select().from(payments).where(eq(payments.id, paymentId)).limit(1);
  if (!payment) throw new Error("Payment not found");

  await db
    .update(payments)
    .set({ status: "approved", reviewedBy: session.user.id, reviewedAt: new Date() })
    .where(eq(payments.id, paymentId));

  await db.update(orders).set({ status: "paid", updatedAt: new Date() }).where(eq(orders.id, payment.orderId));

  await notifyOrderPaid(payment.orderId);
  await notifyUser(payment.userId, "orders", "order_status", payment.orderId);

  revalidatePath("/admin/payments");
  revalidatePath(`/account/orders/${payment.orderId}`);
}

export async function rejectPayment(paymentId: string) {
  const session = await requireAdmin();
  const db = getDb();

  const [payment] = await db.select().from(payments).where(eq(payments.id, paymentId)).limit(1);
  if (!payment) throw new Error("Payment not found");

  await db
    .update(payments)
    .set({ status: "rejected", reviewedBy: session.user.id, reviewedAt: new Date() })
    .where(eq(payments.id, paymentId));

  await db
    .update(orders)
    .set({ status: "payment_rejected", updatedAt: new Date() })
    .where(eq(orders.id, payment.orderId));

  await notifyUser(payment.userId, "orders", "order_status", payment.orderId);

  revalidatePath("/admin/payments");
  revalidatePath(`/account/orders/${payment.orderId}`);
}
