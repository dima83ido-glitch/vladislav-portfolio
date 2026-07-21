import { asc, eq } from "drizzle-orm";
import { getDb } from "@/db/client";
import { aboutContent, services, skillGroups, skills } from "@/db/schema";

export async function getAboutContent() {
  try {
    const [row] = await getDb().select().from(aboutContent).where(eq(aboutContent.id, 1)).limit(1);
    return row ?? null;
  } catch (error) {
    console.error("Failed to load about content:", error);
    return null;
  }
}

export async function getPublishedServices() {
  try {
    return await getDb()
      .select()
      .from(services)
      .where(eq(services.status, "published"))
      .orderBy(asc(services.sortOrder));
  } catch (error) {
    console.error("Failed to load services:", error);
    return [];
  }
}

export async function getAllServicesAdmin() {
  return getDb().select().from(services).orderBy(asc(services.sortOrder));
}

export async function getServiceById(id: string) {
  const [row] = await getDb().select().from(services).where(eq(services.id, id)).limit(1);
  return row ?? null;
}

export async function getPublishedSkillGroups() {
  try {
    const groups = await getDb().select().from(skillGroups).orderBy(asc(skillGroups.sortOrder));
    if (groups.length === 0) return [];

    const allSkills = await getDb().select().from(skills).orderBy(asc(skills.sortOrder));
    return groups.map((group) => ({
      ...group,
      skills: allSkills.filter((s) => s.groupId === group.id),
    }));
  } catch (error) {
    console.error("Failed to load skills:", error);
    return [];
  }
}

export async function getAllSkillGroupsAdmin() {
  const groups = await getDb().select().from(skillGroups).orderBy(asc(skillGroups.sortOrder));
  const allSkills = await getDb().select().from(skills).orderBy(asc(skills.sortOrder));
  return groups.map((group) => ({ ...group, skills: allSkills.filter((s) => s.groupId === group.id) }));
}

export async function getSkillGroupById(id: string) {
  const [group] = await getDb().select().from(skillGroups).where(eq(skillGroups.id, id)).limit(1);
  if (!group) return null;
  const groupSkills = await getDb().select().from(skills).where(eq(skills.groupId, id)).orderBy(asc(skills.sortOrder));
  return { ...group, skills: groupSkills };
}
