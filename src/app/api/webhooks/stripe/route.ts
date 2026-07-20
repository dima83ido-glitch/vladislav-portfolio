import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { getDb } from "@/db/client";
import { orders, payments } from "@/db/schema";
import { getStripeClient, isStripeConfigured } from "@/lib/payments/stripe";
import { sendOrderPaidEmail } from "@/lib/email/resend";

/**
 * Stripe calls this directly over HTTP with a `stripe-signature` header —
 * there's no session/cookie to check, so this is a genuine Route Handler
 * rather than a Server Action (Server Actions have no mechanism to receive
 * or verify a webhook signature). Authenticity comes entirely from
 * `stripe.webhooks.constructEvent` verifying the signature against
 * STRIPE_WEBHOOK_SECRET.
 */
export async function POST(request: NextRequest) {
  if (!isStripeConfigured() || !process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({ error: "Stripe is not configured" }, { status: 503 });
  }

  const signature = request.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  const body = await request.text();
  const stripe = getStripeClient();

  let event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (error) {
    console.error("Stripe webhook signature verification failed:", error);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const db = getDb();

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const orderId = session.metadata?.orderId;
    if (orderId && session.payment_status === "paid") {
      await db
        .update(payments)
        .set({ status: "approved", reviewedAt: new Date() })
        .where(eq(payments.stripeSessionId, session.id));

      await db.update(orders).set({ status: "paid", updatedAt: new Date() }).where(eq(orders.id, orderId));

      const [row] = await db.select().from(orders).where(eq(orders.id, orderId)).limit(1);
      if (row && session.customer_email) {
        try {
          await sendOrderPaidEmail(session.customer_email, row.title);
        } catch (error) {
          console.error("Failed to send order-paid email:", error);
        }
      }
    }
  }

  if (event.type === "checkout.session.expired" || event.type === "payment_intent.payment_failed") {
    const object = event.data.object as { id: string; metadata?: Record<string, string> };
    const sessionId = event.type === "checkout.session.expired" ? object.id : undefined;
    if (sessionId) {
      await db
        .update(payments)
        .set({ status: "failed" })
        .where(eq(payments.stripeSessionId, sessionId));
    }
  }

  return NextResponse.json({ received: true });
}
