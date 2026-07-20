"use client";

import { useTranslations } from "next-intl";
import { Reveal } from "@/components/ui/Reveal";
import { PricingCard } from "@/components/ui/PricingCard";
import { PRICING_PLANS_FULL } from "@/lib/data/pricing";

export function PricingGrid() {
  const t = useTranslations("pricingPage");

  return (
    <div className="mt-20 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
      {PRICING_PLANS_FULL.map((plan, i) => {
        const isCustom = plan.id === "custom";

        return (
          <Reveal key={plan.id} variant="up" delay={(i % 3) * 0.1}>
            <PricingCard
              name={t(`plans.${plan.id}.name`)}
              description={t(`plans.${plan.id}.description`)}
              price={plan.price}
              period={t(`periods.${plan.periodKey}`)}
              customNote={isCustom ? t("customCtaNote") : undefined}
              features={t.raw(`plans.${plan.id}.features`)}
              cta={t(`plans.${plan.id}.cta`)}
              ctaHref={isCustom ? "/#contact" : "#contact"}
              highlighted={plan.highlighted}
              mostPopularLabel={t("mostPopular")}
            />
          </Reveal>
        );
      })}
    </div>
  );
}
