"use client";

import { useEffect, useRef } from "react";
import { motion, useMotionTemplate, useMotionValue, useSpring } from "framer-motion";
import { FiArrowDown, FiArrowUpRight } from "react-icons/fi";
import { useTranslations } from "next-intl";
import { GlowBackground } from "@/components/ui/GlowBackground";
import { MagneticButton } from "@/components/ui/MagneticButton";
import { AnimatedCounter } from "@/components/ui/AnimatedCounter";

export function Hero() {
  const t = useTranslations("hero");
  const siteT = useTranslations("site");

  const STATS = [
    { value: 150, suffix: "+", label: t("stats.projects") },
    { value: 5, suffix: "+", label: t("stats.experience") },
    { value: 98, suffix: "%", label: t("stats.satisfaction") },
  ];

  const sectionRef = useRef<HTMLElement>(null);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springX = useSpring(mouseX, { damping: 40, stiffness: 60 });
  const springY = useSpring(mouseY, { damping: 40, stiffness: 60 });

  const translateGlowX = useMotionTemplate`${springX}px`;
  const translateGlowY = useMotionTemplate`${springY}px`;

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const handleMove = (event: MouseEvent) => {
      const rect = section.getBoundingClientRect();
      const relX = event.clientX - rect.left - rect.width / 2;
      const relY = event.clientY - rect.top - rect.height / 2;
      mouseX.set(relX * 0.04);
      mouseY.set(relY * 0.04);
    };

    window.addEventListener("mousemove", handleMove, { passive: true });
    return () => window.removeEventListener("mousemove", handleMove);
  }, [mouseX, mouseY]);

  return (
    <section
      ref={sectionRef}
      id="hero"
      className="relative flex min-h-[100svh] flex-col justify-center overflow-hidden pt-28"
    >
      <GlowBackground variant="hero" />

      <motion.div
        style={{ x: translateGlowX, y: translateGlowY }}
        className="pointer-events-none absolute inset-0"
        aria-hidden="true"
      >
        <div className="absolute left-1/4 top-1/3 h-2 w-2 rounded-full bg-blue-soft/70 blur-[1px]" />
        <div className="absolute right-1/3 top-1/4 h-1.5 w-1.5 rounded-full bg-blue-soft/50 blur-[1px]" />
        <div className="absolute bottom-1/3 right-1/4 h-2 w-2 rounded-full bg-blue-soft/60 blur-[1px]" />
      </motion.div>

      <div className="relative mx-auto flex w-full max-w-7xl flex-1 flex-col justify-center px-6 lg:px-12">
        <motion.span
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 2 }}
          className="mb-8 flex items-center gap-3 text-sm font-medium uppercase tracking-[0.35em] text-blue-soft"
        >
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-blue-soft opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-blue-soft" />
          </span>
          {siteT("role")} · {siteT("location")}
        </motion.span>

        <h1 className="flex flex-col text-[16vw] font-extrabold leading-[0.92] tracking-tighter text-foreground sm:text-[11vw] lg:text-[8.5vw]">
          <motion.span
            className="overflow-hidden"
            initial={{ y: "110%" }}
            animate={{ y: "0%" }}
            transition={{ duration: 1, delay: 2.1, ease: [0.16, 1, 0.3, 1] }}
          >
            <span className="block">{t("headline1")}</span>
          </motion.span>
          <motion.span
            className="overflow-hidden"
            initial={{ y: "110%" }}
            animate={{ y: "0%" }}
            transition={{ duration: 1, delay: 2.25, ease: [0.16, 1, 0.3, 1] }}
          >
            <span className="block font-thin text-foreground/90">{t("headline2")}</span>
          </motion.span>
          <motion.span
            className="overflow-hidden"
            initial={{ y: "110%" }}
            animate={{ y: "0%" }}
            transition={{ duration: 1, delay: 2.4, ease: [0.16, 1, 0.3, 1] }}
          >
            <span className="font-serif-italic block font-normal text-blue-soft">
              {t("headline3")}
            </span>
          </motion.span>
        </h1>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 2.7 }}
          className="mt-10 max-w-lg text-balance text-lg leading-relaxed text-muted"
        >
          {siteT("description")}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 2.85 }}
          className="mt-12 flex flex-wrap items-center gap-5"
        >
          <MagneticButton
            as="a"
            href="#portfolio"
            className="group rounded-full bg-foreground px-8 py-4 text-sm font-semibold text-background transition-colors hover:bg-blue-soft"
          >
            {t("viewProjects")}
            <FiArrowUpRight className="transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1" />
          </MagneticButton>

          <MagneticButton
            as="a"
            href="#contact"
            className="group rounded-full border border-line-strong px-8 py-4 text-sm font-semibold text-foreground transition-colors hover:border-blue-soft hover:text-blue-soft"
          >
            {t("contactMe")}
            <FiArrowUpRight className="transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1" />
          </MagneticButton>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 3 }}
          className="mt-20 grid max-w-lg grid-cols-3 gap-6 border-t border-line pt-8"
        >
          {STATS.map((stat) => (
            <div key={stat.label} className="flex flex-col gap-1">
              <span className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
                <AnimatedCounter value={stat.value} suffix={stat.suffix} />
              </span>
              <span className="text-xs leading-snug text-muted">{stat.label}</span>
            </div>
          ))}
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.7, delay: 3.2 }}
        className="relative mx-auto mb-10 flex flex-col items-center gap-3 text-muted"
      >
        <span className="text-[11px] uppercase tracking-[0.3em]">{t("scroll")}</span>
        <motion.span
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
        >
          <FiArrowDown size={16} />
        </motion.span>
      </motion.div>
    </section>
  );
}
