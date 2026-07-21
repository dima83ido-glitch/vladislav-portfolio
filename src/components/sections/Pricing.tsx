import { getLocale, getTranslations } from "next-intl/server";
import { FiArrowUpRight } from "react-icons/fi";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/ui/Reveal";
import { MagneticButton } from "@/components/ui/MagneticButton";
import { PricingCardsGrid, type NormalizedPlan } from "@/components/sections/PricingCardsGrid";
import { PRICING_PLANS } from "@/lib/data/pricing";
import { getHomepagePlans } from "@/db/queries/pricingPlans";
import { resolveLocalizedList, resolveLocalizedText } from "@/lib/cms/localized";

export async function Pricing() {
  const t = await getTranslations("pricing");
  const locale = await getLocale();
  const dbPlans = await getHomepagePlans();

  const plans: NormalizedPlan[] =
    dbPlans.length > 0
      ? dbPlans.map((p) => ({
          id: p.slug,
          name: resolveLocalizedText(p.name, locale),
          description: resolveLocalizedText(p.description, locale),
          features: resolveLocalizedList(p.features, locale),
          price: p.price,
          periodLabel: t(`periods.${p.periodKey}`),
          highlighted: p.highlighted,
          orderable: Boolean(p.priceCents),
          ctaLabel: p.priceCents ? t("genericCta") : t("genericQuoteCta"),
          ctaHref: p.ctaOverrideHref ?? undefined,
        }))
      : PRICING_PLANS.map((p) => ({
          id: p.id,
          name: t(`plans.${p.id}.name`),
          description: t(`plans.${p.id}.description`),
          features: t.raw(`plans.${p.id}.features`),
          price: p.price,
          periodLabel: t(`periods.${p.periodKey}`),
          highlighted: p.highlighted,
          orderable: Boolean(p.priceCents),
          ctaLabel: t(`plans.${p.id}.cta`),
          ctaHref: "#contact",
        }));

  return (
    <section id="pricing" className="relative py-32 lg:py-40">
      <div className="mx-auto max-w-7xl px-6 lg:px-12">
        <SectionHeading
          eyebrow={t("eyebrow")}
          title={t("title")}
          italicWord={t("italicWord")}
          align="center"
          description={t("description")}
          className="mx-auto items-center text-center"
        />

        <div className="mt-20">
          <PricingCardsGrid
            plans={plans}
            source="home"
            mostPopularLabel={t("mostPopular")}
            gridClassName="grid grid-cols-1 gap-6 lg:grid-cols-3 lg:items-center"
            errorNamespace="pricing"
          />
        </div>

        <Reveal variant="up" delay={0.3} className="mt-14 flex justify-center">
          <MagneticButton
            as="link"
            href="/pricing"
            className="group rounded-full border border-line-strong px-8 py-4 text-sm font-semibold text-foreground transition-colors hover:border-blue-soft hover:text-blue-soft"
          >
            {t("morePlans")}
            <FiArrowUpRight className="transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1" />
          </MagneticButton>
        </Reveal>
      </div>
    </section>
  );
}
