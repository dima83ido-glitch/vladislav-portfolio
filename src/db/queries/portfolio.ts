import { asc, eq } from "drizzle-orm";
import { getDb } from "@/db/client";
import { portfolioProjects } from "@/db/schema";

export async function getPublishedProjects() {
  try {
    return await getDb()
      .select()
      .from(portfolioProjects)
      .where(eq(portfolioProjects.status, "published"))
      .orderBy(asc(portfolioProjects.sortOrder));
  } catch (error) {
    console.error("Failed to load portfolio projects:", error);
    return [];
  }
}

export async function getAllProjectsAdmin() {
  return getDb().select().from(portfolioProjects).orderBy(asc(portfolioProjects.sortOrder));
}

export async function getProjectById(id: string) {
  const [row] = await getDb()
    .select()
    .from(portfolioProjects)
    .where(eq(portfolioProjects.id, id))
    .limit(1);
  return row ?? null;
}
