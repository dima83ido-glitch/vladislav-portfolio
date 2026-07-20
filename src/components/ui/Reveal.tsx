"use client";

import { motion, type Variants } from "framer-motion";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type RevealVariant = "up" | "down" | "left" | "right" | "scale" | "blur";

type RevealProps = {
  children: ReactNode;
  variant?: RevealVariant;
  delay?: number;
  duration?: number;
  className?: string;
  as?: "div" | "span" | "li";
  once?: boolean;
  amount?: number;
};

const offsets: Record<RevealVariant, Variants> = {
  up: {
    hidden: { opacity: 0, y: 48 },
    visible: { opacity: 1, y: 0 },
  },
  down: {
    hidden: { opacity: 0, y: -48 },
    visible: { opacity: 1, y: 0 },
  },
  left: {
    hidden: { opacity: 0, x: 48 },
    visible: { opacity: 1, x: 0 },
  },
  right: {
    hidden: { opacity: 0, x: -48 },
    visible: { opacity: 1, x: 0 },
  },
  scale: {
    hidden: { opacity: 0, scale: 0.9 },
    visible: { opacity: 1, scale: 1 },
  },
  blur: {
    hidden: { opacity: 0, filter: "blur(12px)", y: 24 },
    visible: { opacity: 1, filter: "blur(0px)", y: 0 },
  },
};

export function Reveal({
  children,
  variant = "up",
  delay = 0,
  duration = 0.8,
  className,
  as = "div",
  once = true,
  amount = 0.3,
}: RevealProps) {
  const sharedProps = {
    className: cn(className),
    initial: "hidden",
    whileInView: "visible",
    viewport: { once, amount },
    variants: offsets[variant],
    transition: {
      duration,
      delay,
      ease: [0.16, 1, 0.3, 1] as const,
    },
  };

  if (as === "span") {
    return <motion.span {...sharedProps}>{children}</motion.span>;
  }

  if (as === "li") {
    return <motion.li {...sharedProps}>{children}</motion.li>;
  }

  return <motion.div {...sharedProps}>{children}</motion.div>;
}
