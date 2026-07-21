import { getLocale, getTranslations } from "next-intl/server";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { SkillsGrid, type NormalizedSkillGroup } from "@/components/sections/SkillsGrid";
import { SKILL_GROUPS } from "@/lib/data/skills";
import { getPublishedSkillGroups } from "@/db/queries/content";
import { resolveLocalizedText } from "@/lib/cms/localized";

export async function Skills() {
  const t = await getTranslations("skills");
  const locale = await getLocale();
  const dbGroups = await getPublishedSkillGroups();

  const groups: NormalizedSkillGroup[] =
    dbGroups.length > 0
      ? dbGroups.map((g) => ({
          id: g.id,
          category: resolveLocalizedText(g.category, locale),
          skills: g.skills.map((s) => ({ name: s.name, level: s.level })),
        }))
      : SKILL_GROUPS.map((g) => ({
          id: g.id,
          category: t(`categories.${g.id}`),
          skills: g.skills,
        }));

  return (
    <section id="skills" className="relative py-32 lg:py-40">
      <div className="mx-auto max-w-7xl px-6 lg:px-12">
        <SectionHeading
          eyebrow={t("eyebrow")}
          title={t("title")}
          italicWord={t("italicWord")}
          description={t("description")}
        />

        <SkillsGrid groups={groups} />
      </div>
    </section>
  );
}
