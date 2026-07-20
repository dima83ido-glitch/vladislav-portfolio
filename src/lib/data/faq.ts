import type { FaqItem } from "@/types";

export const FAQ_ITEMS: FaqItem[] = [
  {
    id: "timeline",
    question: "How long does a typical project take?",
    answer:
      "A landing page usually takes 1–2 weeks, a full business website 4–5 weeks, and dashboards or custom platforms 6–10 weeks depending on scope. You'll get a firm timeline after the discovery call, before any work begins.",
  },
  {
    id: "process",
    question: "What does the working process look like?",
    answer:
      "Every project follows six stages: discovery, planning, design, development, testing, and launch. You'll see progress at each milestone and approve designs before development starts, so there are no surprises at delivery.",
  },
  {
    id: "revisions",
    question: "How many revisions are included?",
    answer:
      "Each plan includes a set number of revision rounds — 2 on Starter, 4 on Business, and unlimited on Premium. Revisions are scoped to refining what's been designed, not reworking the brief mid-project.",
  },
  {
    id: "stack",
    question: "What technology do you build with?",
    answer:
      "Next.js and TypeScript for the frontend, Tailwind CSS for styling, and Framer Motion or GSAP for animation. Backends are built with Node.js, PostgreSQL, and Prisma — chosen for performance, type safety, and long-term maintainability.",
  },
  {
    id: "maintenance",
    question: "Do you offer support after launch?",
    answer:
      "Yes — every plan includes a post-launch support window (30 days on Business, 90 on Premium) covering bug fixes and small adjustments. Ongoing maintenance and feature retainers are available after that.",
  },
  {
    id: "payment",
    question: "How does payment work?",
    answer:
      "Projects are split into milestones — typically 50% upfront to begin, and the remainder on delivery. Larger platform builds are split across three milestones tied to discovery, development, and launch.",
  },
  {
    id: "existing-site",
    question: "Can you redesign or rebuild an existing site?",
    answer:
      "Absolutely. Migrations and redesigns start with an audit of your current site's structure, content, and analytics, so nothing that's already working gets lost in the rebuild.",
  },
];
