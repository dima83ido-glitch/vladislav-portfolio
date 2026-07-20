"use client";

import { useTranslations } from "next-intl";
import { FiArrowUpRight } from "react-icons/fi";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/ui/Reveal";
import { PricingCard } from "@/components/ui/PricingCard";
import { MagneticButton } from "@/components/ui/MagneticButton";
import { PRICING_PLANS } from "@/lib/data/pricing";
import { usePlanOrder } from "@/components/pricing/usePlanOrder";

export function Pricing() {
  const t = useTranslations("pricing");
  const { order, pendingPlanId, errorKey } = usePlanOrder("home");

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

        <div className="mt-20 grid grid-cols-1 gap-6 lg:grid-cols-3 lg:items-center">
          {PRICING_PLANS.map((plan, i) => (
            <Reveal key={plan.id} variant="up" delay={i * 0.1}>
              <PricingCard
                name={t(`plans.${plan.id}.name`)}
                description={t(`plans.${plan.id}.description`)}
                price={plan.price}
                period={t(`periods.${plan.periodKey}`)}
                features={t.raw(`plans.${plan.id}.features`)}
                cta={t(`plans.${plan.id}.cta`)}
                ctaHref={plan.priceCents ? undefined : "#contact"}
                onCtaClick={plan.priceCents ? () => order(plan.id) : undefined}
                ctaPending={pendingPlanId === plan.id}
                highlighted={plan.highlighted}
                mostPopularLabel={t("mostPopular")}
              />
            </Reveal>
          ))}
        </div>

        {errorKey ? (
          <p className="mt-6 text-center text-sm text-red-400">{t(`errors.${errorKey}`)}</p>
        ) : null}

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
