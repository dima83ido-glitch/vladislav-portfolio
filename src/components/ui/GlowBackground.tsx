"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

type GlowBackgroundProps = {
  className?: string;
  variant?: "hero" | "section";
};

export function GlowBackground({ className, variant = "section" }: GlowBackgroundProps) {
  const isHero = variant === "hero";

  return (
    <div
      className={cn(
        "pointer-events-none absolute inset-0 overflow-hidden",
        className
      )}
      aria-hidden="true"
    >
      <motion.div
        className="absolute rounded-full blur-[110px]"
        style={{
          width: isHero ? 640 : 420,
          height: isHero ? 640 : 420,
          top: isHero ? "-10%" : "-20%",
          left: isHero ? "-10%" : "10%",
          background:
            "radial-gradient(circle, rgba(77,125,255,0.35) 0%, rgba(77,125,255,0) 70%)",
        }}
        animate={{ opacity: [0.5, 0.9, 0.5], scale: [1, 1.08, 1] }}
        transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute rounded-full blur-[110px]"
        style={{
          width: isHero ? 560 : 360,
          height: isHero ? 560 : 360,
          bottom: isHero ? "-15%" : "-25%",
          right: isHero ? "-5%" : "5%",
          background:
            "radial-gradient(circle, rgba(122,162,255,0.28) 0%, rgba(122,162,255,0) 70%)",
        }}
        animate={{ opacity: [0.4, 0.8, 0.4], scale: [1, 1.1, 1] }}
        transition={{ duration: 11, repeat: Infinity, ease: "easeInOut", delay: 1 }}
      />
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            "linear-gradient(to right, white 1px, transparent 1px), linear-gradient(to bottom, white 1px, transparent 1px)",
          backgroundSize: "64px 64px",
        }}
      />
    </div>
  );
}
