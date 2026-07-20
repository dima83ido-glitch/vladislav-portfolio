"use server";

import { getDb } from "@/db/client";
import { orders } from "@/db/schema";
import { requireUser } from "@/lib/auth/session";
import { PRICING_PLANS, PRICING_PLANS_FULL } from "@/lib/data/pricing";

type PlanSource = "home" | "full";

/**
 * Plan price is ALWAYS resolved here, server-side, from the trusted static
 * data file — never trust a client-supplied price. The client only ever
 * sends which plan (source + id) it wants.
 */
function resolvePlan(source: PlanSource, planId: string) {
  const list = source === "home" ? PRICING_PLANS : PRICING_PLANS_FULL;
  return list.find((plan) => plan.id === planId) ?? null;
}

export async function createOrderFromPlan(
  source: PlanSource,
  planId: string
): Promise<{ ok: true; orderId: string } | { ok: false; error: "unauthorized" | "invalidPlan" | "generic" }> {
  const session = await requireUser().catch(() => null);
  if (!session) {
    return { ok: false, error: "unauthorized" };
  }

  const plan = resolvePlan(source, planId);
  if (!plan || !plan.priceCents) {
    return { ok: false, error: "invalidPlan" };
  }

  try {
    const [order] = await getDb()
      .insert(orders)
      .values({
        userId: session.user.id,
        title: `${plan.id.charAt(0).toUpperCase()}${plan.id.slice(1)} plan`,
        price: plan.priceCents,
        currency: "usd",
        status: "pending_payment",
      })
      .returning();

    return { ok: true, orderId: order.id };
  } catch (error) {
    console.error("Failed to create order:", error);
    return { ok: false, error: "generic" };
  }
}
