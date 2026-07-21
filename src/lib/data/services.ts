import type { Service } from "@/types";

// Icon names resolve via src/lib/cms/icons.ts's ICON_REGISTRY — kept as
// strings (not component references) here even for this static fallback
// data, because this ultimately flows through a Server → Client Component
// boundary (Services.tsx → ServicesGrid.tsx) where only serializable
// values are allowed; components/functions are not.
export const SERVICES: Service[] = [
  { id: "landing-pages", index: "01", icon: "layout" },
  { id: "business-websites", index: "02", icon: "briefcase" },
  { id: "corporate-websites", index: "03", icon: "grid" },
  { id: "dashboards", index: "04", icon: "activity" },
  { id: "telegram-web-apps", index: "05", icon: "send" },
  { id: "custom-development", index: "06", icon: "code" },
];
