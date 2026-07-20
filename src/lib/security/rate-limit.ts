import { and, eq, gt, sql } from "drizzle-orm";
import { getDb } from "@/db/client";
import { rateLimitHits } from "@/db/schema";

/**
 * Generic Postgres-backed rate limiter. Records a hit under `key` and
 * reports whether the caller has exceeded `limit` occurrences of that key
 * within the trailing `windowMs`. Deliberately not in-memory (which would
 * reset on every deploy/restart) and deliberately not a separate Redis
 * service (there's no need for one at this scale, and it would be another
 * external dependency + credential to manage).
 *
 * Every call both checks AND records — callers should call this once per
 * attempt, before doing the actual work, and bail out if `limited` is true.
 */
export async function checkRateLimit(
  key: string,
  limit: number,
  windowMs: number
): Promise<{ limited: boolean }> {
  const db = getDb();
  const windowStart = new Date(Date.now() - windowMs);

  const [{ count }] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(rateLimitHits)
    .where(and(eq(rateLimitHits.key, key), gt(rateLimitHits.createdAt, windowStart)));

  if (count >= limit) {
    return { limited: true };
  }

  await db.insert(rateLimitHits).values({ key });
  return { limited: false };
}
