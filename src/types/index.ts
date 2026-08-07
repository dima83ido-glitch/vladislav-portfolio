import type { IconType } from "react-icons";

export type TechStack = {
  name: string;
  icon: IconType;
};

export type Service = {
  id: string;
  /** Icon name resolved via src/lib/cms/icons.ts — a string, not a component reference (see Services.tsx for why). */
  icon: string;
  index: string;
};

export type ProcessStep = {
  id: string;
  number: string;
};

export type PricingPlan = {
  id: string;
  price: string;
  /** Cents; absent for quote-only plans (e.g. "Custom Solution") that aren't directly orderable. */
  priceCents?: number;
  periodKey: "oneTime" | "quote";
  highlighted: boolean;
};

export type SkillGroup = {
  id: string;
  skills: {
    name: string;
    level: number;
  }[];
};
