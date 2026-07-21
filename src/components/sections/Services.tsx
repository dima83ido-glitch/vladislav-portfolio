import { getLocale, getTranslations } from "next-intl/server";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { ServicesGrid, type NormalizedService } from "@/components/sections/ServicesGrid";
import { SERVICES } from "@/lib/data/services";
import { getPublishedServices } from "@/db/queries/content";
import { resolveLocalizedList, resolveLocalizedText } from "@/lib/cms/localized";
import { resolveIcon } from "@/lib/cms/icons";

export async function Services() {
  const t = await getTranslations("services");
  const locale = await getLocale();
  const dbServices = await getPublishedServices();

  const items: NormalizedService[] =
    dbServices.length > 0
      ? dbServices.map((s, i) => ({
          id: s.id,
          icon: resolveIcon(s.icon),
          index: String(i + 1).padStart(2, "0"),
          title: resolveLocalizedText(s.title, locale),
          description: resolveLocalizedText(s.description, locale),
          features: resolveLocalizedList(s.features, locale),
        }))
      : SERVICES.map((s) => ({
          id: s.id,
          icon: s.icon,
          index: s.index,
          title: t(`items.${s.id}.title`),
          description: t(`items.${s.id}.description`),
          features: t.raw(`items.${s.id}.features`) as string[],
        }));

  return (
    <section id="services" className="relative py-32 lg:py-40">
      <div className="mx-auto max-w-7xl px-6 lg:px-12">
        <SectionHeading
          eyebrow={t("eyebrow")}
          title={t("title")}
          italicWord={t("italicWord")}
          description={t("description")}
        />

        <ServicesGrid services={items} />
      </div>
    </section>
  );
}
