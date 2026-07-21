import { desc, ilike } from "drizzle-orm";
import { getDb } from "@/db/client";
import { users } from "@/db/schema";

export async function searchUsers(query?: string) {
  const db = getDb();
  if (query && query.trim()) {
    return db
      .select()
      .from(users)
      .where(ilike(users.email, `%${query.trim()}%`))
      .orderBy(desc(users.createdAt))
      .limit(100);
  }
  return db.select().from(users).orderBy(desc(users.createdAt)).limit(100);
}
