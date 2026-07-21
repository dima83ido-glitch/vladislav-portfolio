import {
  FiActivity,
  FiAward,
  FiBriefcase,
  FiCode,
  FiCompass,
  FiGrid,
  FiLayers,
  FiLayout,
  FiPenTool,
  FiSend,
  FiShield,
  FiStar,
  FiTarget,
  FiUsers,
  FiZap,
} from "react-icons/fi";
import type { IconType } from "react-icons";

/**
 * DB-driven content (services, About philosophy cards) stores an icon as
 * a plain string name rather than a component reference, since JSON/JSONB
 * can't hold a component. This is the fixed, curated registry both the
 * admin form (as a <select>) and the public renderer resolve against.
 */
export const ICON_REGISTRY: Record<string, IconType> = {
  layout: FiLayout,
  briefcase: FiBriefcase,
  grid: FiGrid,
  activity: FiActivity,
  send: FiSend,
  code: FiCode,
  "pen-tool": FiPenTool,
  zap: FiZap,
  layers: FiLayers,
  users: FiUsers,
  compass: FiCompass,
  target: FiTarget,
  award: FiAward,
  shield: FiShield,
  star: FiStar,
};

export const ICON_NAMES = Object.keys(ICON_REGISTRY);

export function resolveIcon(name: string): IconType {
  return ICON_REGISTRY[name] ?? FiLayers;
}
