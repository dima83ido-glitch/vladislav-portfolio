import type { PricingPlan } from "@/types";

/** The 3-plan teaser shown on the homepage — unchanged from the original site. */
export const PRICING_PLANS: PricingPlan[] = [
  { id: "starter", price: "$1,200", priceCents: 120_000, periodKey: "oneTime", highlighted: false },
  { id: "business", price: "$3,200", priceCents: 320_000, periodKey: "oneTime", highlighted: true },
  { id: "premium", price: "Custom", periodKey: "quote", highlighted: false },
];

/** The full 6-plan ladder shown on the dedicated /pricing page. */
export const PRICING_PLANS_FULL: PricingPlan[] = [
  { id: "starter", price: "$900", priceCents: 90_000, periodKey: "oneTime", highlighted: false },
  { id: "growth", price: "$1,800", priceCents: 180_000, periodKey: "oneTime", highlighted: false },
  { id: "business", price: "$3,200", priceCents: 320_000, periodKey: "oneTime", highlighted: true },
  {
    id: "professional",
    price: "$5,500",
    priceCents: 550_000,
    periodKey: "oneTime",
    highlighted: false,
  },
  { id: "premium", price: "$9,800", priceCents: 980_000, periodKey: "oneTime", highlighted: false },
  { id: "custom", price: "", periodKey: "quote", highlighted: false },
];
