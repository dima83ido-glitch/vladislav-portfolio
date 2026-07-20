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
  { id: "landing-pages", index: "01", icon: FiLayout },
  { id: "business-websites", index: "02", icon: FiBriefcase },
  { id: "corporate-websites", index: "03", icon: FiGrid },
  { id: "dashboards", index: "04", icon: FiActivity },
  { id: "telegram-web-apps", index: "05", icon: FiSend },
  { id: "custom-development", index: "06", icon: FiCode },
];
