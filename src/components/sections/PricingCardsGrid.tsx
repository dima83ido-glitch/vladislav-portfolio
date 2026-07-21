"use client";

import { useTranslations } from "next-intl";
import { Reveal } from "@/components/ui/Reveal";
import { PricingCard } from "@/components/ui/PricingCard";
import { usePlanOrder } from "@/components/pricing/usePlanOrder";

export type NormalizedPlan = {
  id: string;
  name: string;
  description: string;
  features: string[];
  price: string;
  periodLabel: string;
  customNote?: string;
  highlighted: boolean;
  orderable: boolean;
  ctaLabel: string;
  ctaHref?: string;
};

export function PricingCardsGrid({
  plans,
  source,
  mostPopularLabel,
  gridClassName,
  errorNamespace,
}: {
  plans: NormalizedPlan[];
  source: "home" | "full";
  mostPopularLabel: string;
  gridClassName: string;
  errorNamespace: "pricing" | "pricingPage";
}) {
  const t = useTranslations(errorNamespace);
  const { order, pendingPlanId, errorKey } = usePlanOrder(source);

  return (
    <div className="flex flex-col gap-6">
      <div className={gridClassName}>
        {plans.map((plan, i) => (
          <Reveal key={plan.id} variant="up" delay={(i % 3) * 0.1}>
            <PricingCard
              name={plan.name}
              description={plan.description}
              price={plan.price}
              period={plan.periodLabel}
              customNote={plan.customNote}
              features={plan.features}
              cta={plan.ctaLabel}
              ctaHref={plan.orderable ? undefined : (plan.ctaHref ?? "#contact")}
              onCtaClick={plan.orderable ? () => order(plan.id) : undefined}
              ctaPending={pendingPlanId === plan.id}
              highlighted={plan.highlighted}
              mostPopularLabel={mostPopularLabel}
            />
          </Reveal>
        ))}
      </div>

      {errorKey ? <p className="text-center text-sm text-red-400">{t(`errors.${errorKey}`)}</p> : null}
    </div>
  );
}
