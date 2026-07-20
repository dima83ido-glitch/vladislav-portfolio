import type { IconType } from "react-icons";

export type TechStack = {
  name: string;
  icon: IconType;
};

export type Service = {
  id: string;
  title: string;
  description: string;
  icon: IconType;
  features: string[];
  index: string;
};

export type Project = {
  id: string;
  title: string;
  category: string;
  description: string;
  image: string;
  tech: string[];
  year: string;
  href: string;
};

export type ProcessStep = {
  id: string;
  number: string;
  title: string;
  description: string;
};

export type PricingPlan = {
  id: string;
  name: string;
  price: string;
  period: string;
  description: string;
  features: string[];
  highlighted: boolean;
  cta: string;
};

export type FaqItem = {
  id: string;
  question: string;
  answer: string;
};

export type SkillGroup = {
  category: string;
  skills: {
    name: string;
    level: number;
  }[];
};
