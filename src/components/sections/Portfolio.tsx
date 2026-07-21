import { getLocale, getTranslations } from "next-intl/server";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { PortfolioGrid, type NormalizedProject } from "@/components/sections/PortfolioGrid";
import { PROJECTS } from "@/lib/data/projects";
import { getPublishedProjects } from "@/db/queries/portfolio";
import { resolveLocalizedText } from "@/lib/cms/localized";

export async function Portfolio() {
  const t = await getTranslations("portfolio");
  const locale = await getLocale();
  const dbProjects = await getPublishedProjects();

  const projects: NormalizedProject[] =
    dbProjects.length > 0
      ? dbProjects.map((p) => ({
          id: p.id,
          title: resolveLocalizedText(p.title, locale),
          category: resolveLocalizedText(p.category, locale),
          description: resolveLocalizedText(p.description, locale),
          year: new Date(p.createdAt).getFullYear().toString(),
          image: p.coverImageUrl,
          tech: p.technologies,
          href: p.liveUrl || "#",
        }))
      : PROJECTS.map((p) => ({
          id: p.id,
          title: t(`items.${p.id}.title`),
          category: t(`items.${p.id}.category`),
          description: t(`items.${p.id}.description`),
          year: p.year,
          image: p.image,
          tech: p.tech,
          href: p.href,
        }));

  return (
    <section id="portfolio" className="relative py-32 lg:py-40">
      <div className="mx-auto max-w-7xl px-6 lg:px-12">
        <SectionHeading
          eyebrow={t("eyebrow")}
          title={t("title")}
          italicWord={t("italicWord")}
          description={t("description")}
        />

        <PortfolioGrid projects={projects} />
      </div>
    </section>
  );
}
