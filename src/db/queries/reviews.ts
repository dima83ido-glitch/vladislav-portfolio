import { desc, eq } from "drizzle-orm";
import { getDb } from "@/db/client";
import { reviews } from "@/db/schema";
import type { Review } from "@/db/schema";

export async function getApprovedReviews(): Promise<Review[]> {
  try {
    return await getDb()
      .select()
      .from(reviews)
      .where(eq(reviews.status, "approved"))
      .orderBy(desc(reviews.createdAt));
  } catch (error) {
    console.error("Failed to load reviews:", error);
    return [];
  }
}

export async function getReviewsByStatus(
  status: "pending" | "approved" | "rejected" | "all"
): Promise<Review[]> {
  const db = getDb();
  const query = db.select().from(reviews).orderBy(desc(reviews.createdAt));
  if (status === "all") return query;
  return db.select().from(reviews).where(eq(reviews.status, status)).orderBy(desc(reviews.createdAt));
}
