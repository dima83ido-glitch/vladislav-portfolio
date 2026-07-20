import type { IconType } from "react-icons";

export type TechStack = {
  name: string;
  icon: IconType;
};

export type Service = {
  id: string;
  icon: IconType;
  index: string;
};

export type Project = {
  id: string;
  image: string;
  tech: string[];
  year: string;
  href: string;
};

export type ProcessStep = {
  id: string;
  number: string;
};

export type PricingPlan = {
  id: string;
  price: string;
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
