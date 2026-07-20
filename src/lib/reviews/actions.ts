"use server";

import { revalidatePath } from "next/cache";
import { and, eq, gt } from "drizzle-orm";
import { getDb } from "@/db/client";
import { reviews } from "@/db/schema";
import { routing } from "@/i18n/routing";
import { getSession } from "@/lib/auth/session";
import { reviewSubmissionSchema, type ReviewSubmissionInput } from "./validation";

const REVIEW_RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;

function revalidateHomepages() {
  for (const locale of routing.locales) {
    revalidatePath(locale === routing.defaultLocale ? "/" : `/${locale}`);
  }
}

export async function submitReview(
  input: ReviewSubmissionInput
): Promise<{ ok: true } | { ok: false; error: "invalid" | "rateLimited" | "generic" }> {
  const parsed = reviewSubmissionSchema.safeParse(input);
  if (!parsed.success || parsed.data.website) {
    return { ok: false, error: "invalid" };
  }

  const { authorName, authorEmail, rating, body, locale } = parsed.data;
  const db = getDb();

  try {
    const windowStart = new Date(Date.now() - REVIEW_RATE_LIMIT_WINDOW_MS);
    const recent = await db
      .select({ id: reviews.id })
      .from(reviews)
      .where(and(eq(reviews.authorEmail, authorEmail), gt(reviews.createdAt, windowStart)));

    if (recent.length > 0) {
      return { ok: false, error: "rateLimited" };
    }

    await db.insert(reviews).values({
      authorName,
      authorEmail,
      rating,
      body,
      locale,
      status: "pending",
    });

    return { ok: true };
  } catch (error) {
    console.error("Failed to submit review:", error);
    return { ok: false, error: "generic" };
  }
}

async function requireAdmin() {
  const session = await getSession();
  if (!session || session.user.role !== "admin") {
    throw new Error("Forbidden");
  }
  return session;
}

export async function approveReview(id: string) {
  const session = await requireAdmin();
  await getDb()
    .update(reviews)
    .set({ status: "approved", moderatedAt: new Date(), moderatedBy: session.user.id })
    .where(eq(reviews.id, id));
  revalidateHomepages();
}

export async function rejectReview(id: string) {
  const session = await requireAdmin();
  await getDb()
    .update(reviews)
    .set({ status: "rejected", moderatedAt: new Date(), moderatedBy: session.user.id })
    .where(eq(reviews.id, id));
  revalidateHomepages();
}

export async function updateReview(
  id: string,
  data: { authorName: string; body: string; rating: number }
) {
  await requireAdmin();
  await getDb()
    .update(reviews)
    .set({
      authorName: data.authorName,
      body: data.body,
      rating: data.rating,
      updatedAt: new Date(),
    })
    .where(eq(reviews.id, id));
  revalidateHomepages();
}

export async function deleteReview(id: string) {
  await requireAdmin();
  await getDb().delete(reviews).where(eq(reviews.id, id));
  revalidateHomepages();
}
