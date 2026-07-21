"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { getDb } from "@/db/client";
import { pricingPlans } from "@/db/schema";
import { requireAdmin } from "@/lib/auth/session";
import { routing } from "@/i18n/routing";
import { planSchema, type PlanInput } from "./validation";

function revalidateHomepages() {
  for (const locale of routing.locales) {
    revalidatePath(locale === routing.defaultLocale ? "/" : `/${locale}`);
    revalidatePath(locale === routing.defaultLocale ? "/pricing" : `/${locale}/pricing`);
  }
}

async function assertSlugFree(slug: string, excludeId?: string) {
  const [existing] = await getDb()
    .select({ id: pricingPlans.id })
    .from(pricingPlans)
    .where(eq(pricingPlans.slug, slug))
    .limit(1);
  return !existing || existing.id === excludeId;
}

export async function createPlan(
  input: PlanInput
): Promise<{ ok: true; id: string } | { ok: false; error: "invalid" | "slugTaken" | "generic" }> {
  await requireAdmin();

  const parsed = planSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: "invalid" };
  }

  if (!(await assertSlugFree(parsed.data.slug))) {
    return { ok: false, error: "slugTaken" };
  }

  try {
    const [plan] = await getDb()
      .insert(pricingPlans)
      .values({
        slug: parsed.data.slug,
        name: parsed.data.name,
        description: parsed.data.description,
        features: parsed.data.features,
        price: parsed.data.price,
        priceCents: parsed.data.priceCents ?? null,
        periodKey: parsed.data.periodKey,
        highlighted: parsed.data.highlighted,
        showOnHomepage: parsed.data.showOnHomepage,
        ctaOverrideHref: parsed.data.ctaOverrideHref || null,
        sortOrder: parsed.data.sortOrder,
        status: parsed.data.status,
      })
      .returning();

    revalidateHomepages();
    return { ok: true, id: plan.id };
  } catch (error) {
    console.error("Failed to create plan:", error);
    return { ok: false, error: "generic" };
  }
}

export async function updatePlan(
  id: string,
  input: PlanInput
): Promise<{ ok: true } | { ok: false; error: "invalid" | "slugTaken" | "generic" }> {
  await requireAdmin();

  const parsed = planSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: "invalid" };
  }

  if (!(await assertSlugFree(parsed.data.slug, id))) {
    return { ok: false, error: "slugTaken" };
  }

  try {
    await getDb()
      .update(pricingPlans)
      .set({
        slug: parsed.data.slug,
        name: parsed.data.name,
        description: parsed.data.description,
        features: parsed.data.features,
        price: parsed.data.price,
        priceCents: parsed.data.priceCents ?? null,
        periodKey: parsed.data.periodKey,
        highlighted: parsed.data.highlighted,
        showOnHomepage: parsed.data.showOnHomepage,
        ctaOverrideHref: parsed.data.ctaOverrideHref || null,
        sortOrder: parsed.data.sortOrder,
        status: parsed.data.status,
        updatedAt: new Date(),
      })
      .where(eq(pricingPlans.id, id));

    revalidateHomepages();
    return { ok: true };
  } catch (error) {
    console.error("Failed to update plan:", error);
    return { ok: false, error: "generic" };
  }
}

export async function deletePlan(id: string) {
  await requireAdmin();
  await getDb().delete(pricingPlans).where(eq(pricingPlans.id, id));
  revalidateHomepages();
}
