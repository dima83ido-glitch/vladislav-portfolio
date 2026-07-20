import {
  FiLayout,
  FiBriefcase,
  FiGrid,
  FiActivity,
  FiSend,
  FiCode,
} from "react-icons/fi";
import type { Service } from "@/types";

export const SERVICES: Service[] = [
  {
    id: "landing-pages",
    index: "01",
    title: "Landing Pages",
    description:
      "High-converting single pages built to turn traffic into customers, engineered with motion and copy that guide every scroll toward one action.",
    icon: FiLayout,
    features: ["Conversion-first layout", "Motion storytelling", "A/B ready structure"],
  },
  {
    id: "business-websites",
    index: "02",
    title: "Business Websites",
    description:
      "Multi-page sites for growing companies that need a credible, fast, and easy-to-manage presence across every device.",
    icon: FiBriefcase,
    features: ["CMS-friendly structure", "SEO foundations", "Scalable page templates"],
  },
  {
    id: "corporate-websites",
    index: "03",
    title: "Corporate Websites",
    description:
      "Large-scale digital presences for established brands — built for performance, accessibility, and long-term maintainability.",
    icon: FiGrid,
    features: ["Design systems", "Multi-locale ready", "Enterprise-grade QA"],
  },
  {
    id: "dashboards",
    index: "04",
    title: "Dashboards",
    description:
      "Data-dense interfaces made effortless to read — real-time charts, tables, and controls designed for daily operational use.",
    icon: FiActivity,
    features: ["Real-time data views", "Role-based access", "Custom charting"],
  },
  {
    id: "telegram-web-apps",
    index: "05",
    title: "Telegram Web Apps",
    description:
      "Native-feeling Mini Apps built on the Telegram Bot API and WebApp SDK — from storefronts to internal tools, shipped inside chat.",
    icon: FiSend,
    features: ["Telegram WebApp SDK", "Bot + backend integration", "Seamless in-chat UX"],
  },
  {
    id: "custom-development",
    index: "06",
    title: "Custom Development",
    description:
      "When the brief doesn't fit a template — bespoke web applications engineered from scratch around your exact workflow.",
    icon: FiCode,
    features: ["Full-stack architecture", "API & integrations", "Long-term ownership"],
  },
];
