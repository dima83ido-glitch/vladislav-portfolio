"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { getDb } from "@/db/client";
import { portfolioProjects } from "@/db/schema";
import { requireAdmin } from "@/lib/auth/session";
import { routing } from "@/i18n/routing";
import { deleteMedia, isCloudinaryConfigured, uploadMedia } from "@/lib/media/cloudinary";
import { detectFileType } from "@/lib/media/validation";
import { checkRateLimit } from "@/lib/security/rate-limit";
import type { LocalizedText } from "@/db/schema";
import { projectSchema, type ProjectInput } from "./validation";

const COVER_IMAGE_MAX_BYTES = 8 * 1024 * 1024;
const COVER_IMAGE_ALLOWED_TYPES = ["png", "jpeg", "webp"] as const;
const COVER_IMAGE_ALLOWED_MIME = ["image/png", "image/jpeg", "image/webp"] as const;

const COVER_IMAGE_UPLOAD_RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000;
const COVER_IMAGE_UPLOAD_RATE_LIMIT = 30;

function revalidateHomepages() {
  for (const locale of routing.locales) {
    revalidatePath(locale === routing.defaultLocale ? "/" : `/${locale}`);
  }
}

function cleanOptionalLocalized(field?: {
  en?: string;
  uk?: string;
  ru?: string;
}): LocalizedText | null {
  if (!field || !field.en) return null;
  return { en: field.en, uk: field.uk, ru: field.ru };
}

function cleanUrl(url?: string) {
  return url ? url : null;
}

export async function createProject(
  input: ProjectInput
): Promise<{ ok: true; id: string } | { ok: false; error: "invalid" | "slugTaken" | "generic" }> {
  await requireAdmin();

  const parsed = projectSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: "invalid" };
  }

  const db = getDb();
  const [existing] = await db
    .select({ id: portfolioProjects.id })
    .from(portfolioProjects)
    .where(eq(portfolioProjects.slug, parsed.data.slug))
    .limit(1);
  if (existing) {
    return { ok: false, error: "slugTaken" };
  }

  try {
    const [project] = await db
      .insert(portfolioProjects)
      .values({
        slug: parsed.data.slug,
        title: parsed.data.title,
        category: parsed.data.category,
        description: parsed.data.description,
        results: cleanOptionalLocalized(parsed.data.results),
        technologies: parsed.data.technologies,
        coverImageUrl: cleanUrl(parsed.data.coverImageUrl),
        coverImagePublicId: cleanUrl(parsed.data.coverImagePublicId),
        videoUrl: cleanUrl(parsed.data.videoUrl),
        liveUrl: cleanUrl(parsed.data.liveUrl),
        githubUrl: cleanUrl(parsed.data.githubUrl),
        seoTitle: cleanOptionalLocalized(parsed.data.seoTitle),
        seoDescription: cleanOptionalLocalized(parsed.data.seoDescription),
        sortOrder: parsed.data.sortOrder,
        status: parsed.data.status,
      })
      .returning();

    revalidateHomepages();
    return { ok: true, id: project.id };
  } catch (error) {
    console.error("Failed to create project:", error);
    return { ok: false, error: "generic" };
  }
}

export async function updateProject(
  id: string,
  input: ProjectInput
): Promise<{ ok: true } | { ok: false; error: "invalid" | "slugTaken" | "generic" }> {
  await requireAdmin();

  const parsed = projectSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: "invalid" };
  }

  const db = getDb();
  const [existing] = await db
    .select({ id: portfolioProjects.id })
    .from(portfolioProjects)
    .where(eq(portfolioProjects.slug, parsed.data.slug))
    .limit(1);
  if (existing && existing.id !== id) {
    return { ok: false, error: "slugTaken" };
  }

  const [current] = await db
    .select({ coverImagePublicId: portfolioProjects.coverImagePublicId })
    .from(portfolioProjects)
    .where(eq(portfolioProjects.id, id))
    .limit(1);

  const newPublicId = cleanUrl(parsed.data.coverImagePublicId);

  try {
    await db
      .update(portfolioProjects)
      .set({
        slug: parsed.data.slug,
        title: parsed.data.title,
        category: parsed.data.category,
        description: parsed.data.description,
        results: cleanOptionalLocalized(parsed.data.results),
        technologies: parsed.data.technologies,
        coverImageUrl: cleanUrl(parsed.data.coverImageUrl),
        coverImagePublicId: newPublicId,
        videoUrl: cleanUrl(parsed.data.videoUrl),
        liveUrl: cleanUrl(parsed.data.liveUrl),
        githubUrl: cleanUrl(parsed.data.githubUrl),
        seoTitle: cleanOptionalLocalized(parsed.data.seoTitle),
        seoDescription: cleanOptionalLocalized(parsed.data.seoDescription),
        sortOrder: parsed.data.sortOrder,
        status: parsed.data.status,
        updatedAt: new Date(),
      })
      .where(eq(portfolioProjects.id, id));

    if (current?.coverImagePublicId && current.coverImagePublicId !== newPublicId) {
      await deleteMedia(current.coverImagePublicId);
    }

    revalidateHomepages();
    return { ok: true };
  } catch (error) {
    console.error("Failed to update project:", error);
    return { ok: false, error: "generic" };
  }
}

export async function deleteProject(id: string) {
  await requireAdmin();

  const db = getDb();
  const [project] = await db
    .select({ coverImagePublicId: portfolioProjects.coverImagePublicId })
    .from(portfolioProjects)
    .where(eq(portfolioProjects.id, id))
    .limit(1);

  await db.delete(portfolioProjects).where(eq(portfolioProjects.id, id));

  if (project?.coverImagePublicId) {
    await deleteMedia(project.coverImagePublicId);
  }

  revalidateHomepages();
}

export async function uploadProjectCoverImage(formData: FormData): Promise<
  | { ok: true; url: string; publicId: string }
  | { ok: false; error: "notConfigured" | "invalid" | "tooLarge" | "unsupportedFormat" | "broken" | "rateLimited" | "generic" }
> {
  const session = await requireAdmin();

  if (!isCloudinaryConfigured()) {
    return { ok: false, error: "notConfigured" };
  }

  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return { ok: false, error: "invalid" };
  }

  if (file.size > COVER_IMAGE_MAX_BYTES) {
    return { ok: false, error: "tooLarge" };
  }

  if (!(COVER_IMAGE_ALLOWED_MIME as readonly string[]).includes(file.type)) {
    return { ok: false, error: "unsupportedFormat" };
  }

  const { limited } = await checkRateLimit(
    `portfolio-cover-upload:${session.user.id}`,
    COVER_IMAGE_UPLOAD_RATE_LIMIT,
    COVER_IMAGE_UPLOAD_RATE_LIMIT_WINDOW_MS
  );
  if (limited) {
    return { ok: false, error: "rateLimited" };
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const detectedType = detectFileType(buffer);
  if (!detectedType || !(COVER_IMAGE_ALLOWED_TYPES as readonly string[]).includes(detectedType)) {
    return { ok: false, error: "broken" };
  }

  try {
    const { url, publicId } = await uploadMedia(file, "portfolio");
    return { ok: true, url, publicId };
  } catch (error) {
    console.error("Failed to upload project image:", error);
    return { ok: false, error: "generic" };
  }
}
