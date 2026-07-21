import { and, asc, eq } from "drizzle-orm";
import { getDb } from "@/db/client";
import { pricingPlans } from "@/db/schema";

export async function getPublishedPlans() {
  try {
    return await getDb()
      .select()
      .from(pricingPlans)
      .where(eq(pricingPlans.status, "published"))
      .orderBy(asc(pricingPlans.sortOrder));
  } catch (error) {
    console.error("Failed to load pricing plans:", error);
    return [];
  }
}

export async function getHomepagePlans() {
  try {
    return await getDb()
      .select()
      .from(pricingPlans)
      .where(and(eq(pricingPlans.status, "published"), eq(pricingPlans.showOnHomepage, true)))
      .orderBy(asc(pricingPlans.sortOrder));
  } catch (error) {
    console.error("Failed to load homepage pricing plans:", error);
    return [];
  }
}

export async function getAllPlansAdmin() {
  return getDb().select().from(pricingPlans).orderBy(asc(pricingPlans.sortOrder));
}

export async function getPlanById(id: string) {
  const [row] = await getDb().select().from(pricingPlans).where(eq(pricingPlans.id, id)).limit(1);
  return row ?? null;
}

export async function getPlanBySlug(slug: string) {
  const [row] = await getDb().select().from(pricingPlans).where(eq(pricingPlans.slug, slug)).limit(1);
  return row ?? null;
}
