import { neon } from "@neondatabase/serverless";
import { drizzle, type NeonHttpDatabase } from "drizzle-orm/neon-http";
import * as schema from "./schema";

let cached: NeonHttpDatabase<typeof schema> | undefined;

/**
 * Lazy singleton: the client is only constructed (and DATABASE_URL only
 * required) the first time a query actually runs, not at module import
 * time. This keeps `next build`'s static-generation pass from failing in
 * environments where the database isn't configured yet.
 */
export function getDb() {
  if (!cached) {
    const url = process.env.DATABASE_URL;
    if (!url) {
      throw new Error("DATABASE_URL is not set");
    }
    cached = drizzle(neon(url), { schema });
  }
  return cached;
}
