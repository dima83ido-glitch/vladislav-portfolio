"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { getDb } from "@/db/client";
import { aboutContent, services, skillGroups, skills } from "@/db/schema";
import { requireAdmin } from "@/lib/auth/session";
import { routing } from "@/i18n/routing";
import {
  aboutContentSchema,
  serviceSchema,
  skillGroupSchema,
  type AboutContentInput,
  type ServiceInput,
  type SkillGroupInput,
} from "./validation";

function revalidateHomepages() {
  for (const locale of routing.locales) {
    revalidatePath(locale === routing.defaultLocale ? "/" : `/${locale}`);
  }
}

// ---------- About ----------

export async function updateAboutContent(
  input: AboutContentInput
): Promise<{ ok: true } | { ok: false; error: "invalid" | "generic" }> {
  await requireAdmin();

  const parsed = aboutContentSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: "invalid" };
  }

  try {
    await getDb()
      .insert(aboutContent)
      .values({
        id: 1,
        biography: parsed.data.biography,
        philosophyCards: parsed.data.philosophyCards,
        heroStats: parsed.data.heroStats,
      })
      .onConflictDoUpdate({
        target: aboutContent.id,
        set: {
          biography: parsed.data.biography,
          philosophyCards: parsed.data.philosophyCards,
          heroStats: parsed.data.heroStats,
          updatedAt: new Date(),
        },
      });

    revalidateHomepages();
    return { ok: true };
  } catch (error) {
    console.error("Failed to update about content:", error);
    return { ok: false, error: "generic" };
  }
}

// ---------- Services ----------

export async function createService(
  input: ServiceInput
): Promise<{ ok: true } | { ok: false; error: "invalid" | "slugTaken" | "generic" }> {
  await requireAdmin();

  const parsed = serviceSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "invalid" };

  const db = getDb();
  const [existing] = await db.select({ id: services.id }).from(services).where(eq(services.slug, parsed.data.slug)).limit(1);
  if (existing) return { ok: false, error: "slugTaken" };

  try {
    await db.insert(services).values(parsed.data);
    revalidateHomepages();
    return { ok: true };
  } catch (error) {
    console.error("Failed to create service:", error);
    return { ok: false, error: "generic" };
  }
}

export async function updateService(
  id: string,
  input: ServiceInput
): Promise<{ ok: true } | { ok: false; error: "invalid" | "slugTaken" | "generic" }> {
  await requireAdmin();

  const parsed = serviceSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "invalid" };

  const db = getDb();
  const [existing] = await db.select({ id: services.id }).from(services).where(eq(services.slug, parsed.data.slug)).limit(1);
  if (existing && existing.id !== id) return { ok: false, error: "slugTaken" };

  try {
    await db.update(services).set({ ...parsed.data, updatedAt: new Date() }).where(eq(services.id, id));
    revalidateHomepages();
    return { ok: true };
  } catch (error) {
    console.error("Failed to update service:", error);
    return { ok: false, error: "generic" };
  }
}

export async function deleteService(id: string) {
  await requireAdmin();
  await getDb().delete(services).where(eq(services.id, id));
  revalidateHomepages();
}

// ---------- Skill groups ----------

export async function createSkillGroup(
  input: SkillGroupInput
): Promise<{ ok: true } | { ok: false; error: "invalid" | "generic" }> {
  await requireAdmin();

  const parsed = skillGroupSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "invalid" };

  try {
    const db = getDb();
    const [group] = await db
      .insert(skillGroups)
      .values({ category: parsed.data.category, sortOrder: parsed.data.sortOrder })
      .returning();

    await db.insert(skills).values(parsed.data.skills.map((s) => ({ ...s, groupId: group.id })));

    revalidateHomepages();
    return { ok: true };
  } catch (error) {
    console.error("Failed to create skill group:", error);
    return { ok: false, error: "generic" };
  }
}

export async function updateSkillGroup(
  id: string,
  input: SkillGroupInput
): Promise<{ ok: true } | { ok: false; error: "invalid" | "generic" }> {
  await requireAdmin();

  const parsed = skillGroupSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "invalid" };

  try {
    const db = getDb();
    await db
      .update(skillGroups)
      .set({ category: parsed.data.category, sortOrder: parsed.data.sortOrder })
      .where(eq(skillGroups.id, id));

    await db.delete(skills).where(eq(skills.groupId, id));
    await db.insert(skills).values(parsed.data.skills.map((s) => ({ ...s, groupId: id })));

    revalidateHomepages();
    return { ok: true };
  } catch (error) {
    console.error("Failed to update skill group:", error);
    return { ok: false, error: "generic" };
  }
}

export async function deleteSkillGroup(id: string) {
  await requireAdmin();
  await getDb().delete(skillGroups).where(eq(skillGroups.id, id));
  revalidateHomepages();
}
