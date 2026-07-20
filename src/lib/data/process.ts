import type { ProcessStep } from "@/types";

export const PROCESS_STEPS: ProcessStep[] = [
  {
    id: "discovery",
    number: "01",
    title: "Discovery",
    description:
      "We start with a deep conversation about your goals, audience, and constraints — clarifying what success actually looks like before anything is designed.",
  },
  {
    id: "planning",
    number: "02",
    title: "Planning",
    description:
      "Scope, sitemap, and technical architecture are locked in. You get a clear timeline and a shared understanding of every deliverable.",
  },
  {
    id: "design",
    number: "03",
    title: "Design",
    description:
      "High-fidelity interfaces are crafted around your brand — typography, motion, and layout composed to feel premium on every screen size.",
  },
  {
    id: "development",
    number: "04",
    title: "Development",
    description:
      "Pixel-accurate, type-safe code brings the design to life — built on a modern stack chosen for speed, stability, and long-term maintainability.",
  },
  {
    id: "testing",
    number: "05",
    title: "Testing",
    description:
      "Cross-browser, cross-device QA, performance audits, and accessibility checks — nothing ships until it holds up under real conditions.",
  },
  {
    id: "launch",
    number: "06",
    title: "Launch",
    description:
      "Deployment, monitoring, and a handover walkthrough — plus a window of post-launch support to catch anything real users surface first.",
  },
];
