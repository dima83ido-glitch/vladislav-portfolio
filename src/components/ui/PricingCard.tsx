"use client";

import { motion } from "framer-motion";
import { FiCheck } from "react-icons/fi";
import { MagneticButton } from "@/components/ui/MagneticButton";
import { cn } from "@/lib/utils";

type PricingCardProps = {
  name: string;
  description: string;
  price: string;
  period: string;
  /** When set, replaces the price/period row entirely (used by the "Custom Solution" plan). */
  customNote?: string;
  features: string[];
  cta: string;
  ctaHref: string;
  highlighted: boolean;
  mostPopularLabel: string;
};

export function PricingCard({
  name,
  description,
  price,
  period,
  customNote,
  features,
  cta,
  ctaHref,
  highlighted,
  mostPopularLabel,
}: PricingCardProps) {
  return (
    <motion.div
      whileHover={{ y: -8 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      className={cn(
        "relative flex h-full flex-col gap-8 rounded-3xl border p-9",
        highlighted
          ? "border-blue-soft/60 bg-surface lg:scale-105 lg:py-12"
          : "border-line bg-surface/50"
      )}
    >
      {highlighted ? (
        <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-blue-soft px-4 py-1 text-xs font-semibold text-background">
          {mostPopularLabel}
        </span>
      ) : null}

      <div className="flex flex-col gap-2">
        <h3 className="text-lg font-bold text-foreground">{name}</h3>
        <p className="text-sm leading-relaxed text-muted">{description}</p>
      </div>

      {customNote ? (
        <p className="text-lg font-semibold leading-relaxed text-foreground">{customNote}</p>
      ) : (
        <div className="flex items-baseline gap-2">
          <span className="text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl">
            {price}
          </span>
          <span className="text-sm text-muted">/ {period}</span>
        </div>
      )}

      <ul className="flex flex-1 flex-col gap-3">
        {features.map((feature) => (
          <li key={feature} className="flex items-start gap-3 text-sm text-foreground/80">
            <FiCheck className="mt-0.5 shrink-0 text-blue-soft" size={15} />
            {feature}
          </li>
        ))}
      </ul>

      <MagneticButton
        as="link"
        href={ctaHref}
        className={cn(
          "w-full rounded-full px-6 py-3.5 text-sm font-semibold transition-colors",
          highlighted
            ? "bg-blue-soft text-background hover:bg-blue-soft/90"
            : "border border-line-strong text-foreground hover:border-blue-soft hover:text-blue-soft"
        )}
      >
        {cta}
      </MagneticButton>
    </motion.div>
  );
}
