"use server";

import { getDb } from "@/db/client";
import { orders } from "@/db/schema";
import { requireUser } from "@/lib/auth/session";
import { PRICING_PLANS, PRICING_PLANS_FULL } from "@/lib/data/pricing";
import { getPlanBySlug } from "@/db/queries/pricingPlans";

type PlanSource = "home" | "full";

/**
 * Plan price is ALWAYS resolved here, server-side — never trust a
 * client-supplied price. The client only ever sends which plan (source +
 * id) it wants. Admin-managed DB plans (by slug) take precedence; the
 * static data file is the fallback for as long as the CMS table is empty,
 * matching the same fallback convention used for Portfolio/Services/etc.
 */
async function resolvePlan(
  source: PlanSource,
  planId: string
): Promise<{ title: string; priceCents: number } | null> {
  const dbPlan = await getPlanBySlug(planId).catch(() => null);
  if (dbPlan && dbPlan.status === "published" && dbPlan.priceCents) {
    return { title: dbPlan.name.en, priceCents: dbPlan.priceCents };
  }

  const list = source === "home" ? PRICING_PLANS : PRICING_PLANS_FULL;
  const staticPlan = list.find((plan) => plan.id === planId);
  if (staticPlan?.priceCents) {
    return {
      title: `${staticPlan.id.charAt(0).toUpperCase()}${staticPlan.id.slice(1)} plan`,
      priceCents: staticPlan.priceCents,
    };
  }

  return null;
}

export async function createOrderFromPlan(
  source: PlanSource,
  planId: string
): Promise<{ ok: true; orderId: string } | { ok: false; error: "unauthorized" | "invalidPlan" | "generic" }> {
  const session = await requireUser().catch(() => null);
  if (!session) {
    return { ok: false, error: "unauthorized" };
  }

  const plan = await resolvePlan(source, planId);
  if (!plan) {
    return { ok: false, error: "invalidPlan" };
  }

  try {
    const [order] = await getDb()
      .insert(orders)
      .values({
        userId: session.user.id,
        title: plan.title,
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
