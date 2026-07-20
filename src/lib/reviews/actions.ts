"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { getDb } from "@/db/client";
import { reviews } from "@/db/schema";
import { routing } from "@/i18n/routing";
import { requireAdmin, requireUser } from "@/lib/auth/session";
import { checkRateLimit } from "@/lib/security/rate-limit";
import { reviewSubmissionSchema, type ReviewSubmissionInput } from "./validation";

const REVIEW_RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;

function revalidateHomepages() {
  for (const locale of routing.locales) {
    revalidatePath(locale === routing.defaultLocale ? "/" : `/${locale}`);
  }
}

export async function submitReview(
  input: ReviewSubmissionInput
): Promise<
  { ok: true } | { ok: false; error: "invalid" | "rateLimited" | "unauthorized" | "generic" }
> {
  const session = await requireUser().catch(() => null);
  if (!session) {
    return { ok: false, error: "unauthorized" };
  }

  const parsed = reviewSubmissionSchema.safeParse(input);
  if (!parsed.success || parsed.data.website) {
    return { ok: false, error: "invalid" };
  }

  const { rating, body, locale } = parsed.data;

  try {
    const { limited } = await checkRateLimit(
      `review:${session.user.id}`,
      1,
      REVIEW_RATE_LIMIT_WINDOW_MS
    );
    if (limited) {
      return { ok: false, error: "rateLimited" };
    }

    await getDb()
      .insert(reviews)
      .values({
        authorName: session.user.displayName || session.user.email.split("@")[0],
        authorEmail: session.user.email,
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
