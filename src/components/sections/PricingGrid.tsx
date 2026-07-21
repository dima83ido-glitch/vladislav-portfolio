import { getLocale, getTranslations } from "next-intl/server";
import { PricingCardsGrid, type NormalizedPlan } from "@/components/sections/PricingCardsGrid";
import { PRICING_PLANS_FULL } from "@/lib/data/pricing";
import { getPublishedPlans } from "@/db/queries/pricingPlans";
import { resolveLocalizedList, resolveLocalizedText } from "@/lib/cms/localized";

export async function PricingGrid() {
  const t = await getTranslations("pricingPage");
  const locale = await getLocale();
  const dbPlans = await getPublishedPlans();

  const plans: NormalizedPlan[] =
    dbPlans.length > 0
      ? dbPlans.map((p) => ({
          id: p.slug,
          name: resolveLocalizedText(p.name, locale),
          description: resolveLocalizedText(p.description, locale),
          features: resolveLocalizedList(p.features, locale),
          price: p.price,
          periodLabel: t(`periods.${p.periodKey}`),
          customNote: p.priceCents ? undefined : t("customCtaNote"),
          highlighted: p.highlighted,
          orderable: Boolean(p.priceCents),
          ctaLabel: p.priceCents ? t("genericCta") : t("customCtaNote"),
          ctaHref: p.ctaOverrideHref ?? "/#contact",
        }))
      : PRICING_PLANS_FULL.map((p) => {
          const isCustom = p.id === "custom";
          return {
            id: p.id,
            name: t(`plans.${p.id}.name`),
            description: t(`plans.${p.id}.description`),
            features: t.raw(`plans.${p.id}.features`),
            price: p.price,
            periodLabel: t(`periods.${p.periodKey}`),
            customNote: isCustom ? t("customCtaNote") : undefined,
            highlighted: p.highlighted,
            orderable: Boolean(p.priceCents),
            ctaLabel: t(`plans.${p.id}.cta`),
            ctaHref: "/#contact",
          };
        });

  return (
    <div className="mt-20">
      <PricingCardsGrid
        plans={plans}
        source="full"
        mostPopularLabel={t("mostPopular")}
        gridClassName="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3"
        errorNamespace="pricingPage"
      />
    </div>
  );
}
