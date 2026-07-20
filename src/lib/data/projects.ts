import type { Project } from "@/types";

export const PROJECTS: Project[] = [
  {
    id: "nordholm",
    title: "Nordholm Capital",
    category: "Corporate Website",
    description:
      "A confidence-building presence for a private investment firm — restrained typography, real-time market data widgets, and a data room gated behind secure access.",
    image: "/projects/nordholm.svg",
    tech: ["Next.js", "TypeScript", "Framer Motion", "Sanity CMS"],
    year: "2025",
    href: "#",
  },
  {
    id: "auravest",
    title: "Auravest Dashboard",
    category: "Dashboard",
    description:
      "A portfolio analytics dashboard for retail investors — live positions, risk breakdowns, and custom alerting rendered through streaming WebSocket data.",
    image: "/projects/auravest.svg",
    tech: ["React", "TypeScript", "TanStack Query", "WebSocket"],
    year: "2025",
    href: "#",
  },
  {
    id: "loop-market",
    title: "Loop Market",
    category: "Business Website",
    description:
      "E-commerce storefront for a direct-to-consumer skincare brand — built for speed, with sub-second product transitions and a checkout tuned for mobile.",
    image: "/projects/loop-market.svg",
    tech: ["Next.js", "Stripe", "Tailwind CSS", "Contentful"],
    year: "2024",
    href: "#",
  },
  {
    id: "havenly",
    title: "Havenly Stays",
    category: "Landing Page",
    description:
      "A single-page launch site for a boutique hospitality brand — cinematic imagery, scroll-driven storytelling, and a waitlist that converted at 12%.",
    image: "/projects/havenly.svg",
    tech: ["Next.js", "GSAP", "Framer Motion"],
    year: "2024",
    href: "#",
  },
  {
    id: "pulsepay",
    title: "PulsePay Mini App",
    category: "Telegram Web App",
    description:
      "A peer-to-peer payments Mini App living entirely inside Telegram — balance management, transfer flows, and biometric-style confirmation, all native-feeling.",
    image: "/projects/pulsepay.svg",
    tech: ["Telegram SDK", "React", "Node.js", "PostgreSQL"],
    year: "2025",
    href: "#",
  },
  {
    id: "atlasops",
    title: "AtlasOps",
    category: "Custom Development",
    description:
      "An internal logistics platform replacing three disconnected spreadsheets — route planning, fleet status, and automated client reporting in one system.",
    image: "/projects/atlasops.svg",
    tech: ["Next.js", "PostgreSQL", "Prisma", "tRPC"],
    year: "2024",
    href: "#",
  },
];
