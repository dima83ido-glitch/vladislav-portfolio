import type { SkillGroup } from "@/types";

export const SKILL_GROUPS: SkillGroup[] = [
  {
    id: "frontend",
    skills: [
      { name: "React / Next.js", level: 97 },
      { name: "TypeScript", level: 95 },
      { name: "Tailwind CSS", level: 96 },
      { name: "Framer Motion / GSAP", level: 92 },
    ],
  },
  {
    id: "backend",
    skills: [
      { name: "Node.js", level: 90 },
      { name: "PostgreSQL", level: 86 },
      { name: "Prisma / tRPC", level: 88 },
      { name: "REST / WebSocket APIs", level: 91 },
    ],
  },
  {
    id: "product",
    skills: [
      { name: "UI / UX Design", level: 93 },
      { name: "Motion Design", level: 90 },
      { name: "Performance Engineering", level: 89 },
      { name: "Accessibility (WCAG)", level: 85 },
    ],
  },
];

export const TECH_STACK = [
  "Next.js",
  "TypeScript",
  "React",
  "Tailwind CSS",
  "Framer Motion",
  "GSAP",
  "Node.js",
  "PostgreSQL",
  "Prisma",
  "tRPC",
  "Telegram SDK",
  "Figma",
] as const;
