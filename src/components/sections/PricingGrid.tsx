"use client";

import { useTranslations } from "next-intl";
import { Reveal } from "@/components/ui/Reveal";
import { PricingCard } from "@/components/ui/PricingCard";
import { PRICING_PLANS_FULL } from "@/lib/data/pricing";
import { usePlanOrder } from "@/components/pricing/usePlanOrder";

export function PricingGrid() {
  const t = useTranslations("pricingPage");
  const { order, pendingPlanId, errorKey } = usePlanOrder("full");

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
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
                ctaHref={isCustom ? "/#contact" : undefined}
                onCtaClick={plan.priceCents ? () => order(plan.id) : undefined}
                ctaPending={pendingPlanId === plan.id}
                highlighted={plan.highlighted}
                mostPopularLabel={t("mostPopular")}
              />
            </Reveal>
          );
        })}
      </div>

      {errorKey ? (
        <p className="text-center text-sm text-red-400">{t(`errors.${errorKey}`)}</p>
      ) : null}
    </div>
  );
}
