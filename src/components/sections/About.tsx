"use client";

import { motion } from "framer-motion";
import { FiLayers, FiPenTool, FiUsers, FiZap } from "react-icons/fi";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/ui/Reveal";
import { Marquee } from "@/components/ui/Marquee";
import { SITE } from "@/lib/data/site";
import { TECH_STACK } from "@/lib/data/skills";

const PHILOSOPHY_CARDS = [
  {
    icon: FiPenTool,
    title: "Design-first",
    description: "Every build starts as a design problem, not a coding task.",
  },
  {
    icon: FiZap,
    title: "Performance-obsessed",
    description: "Fast sites convert better — speed is treated as a feature.",
  },
  {
    icon: FiLayers,
    title: "Full-stack ownership",
    description: "One developer, one vision, from database to pixel.",
  },
  {
    icon: FiUsers,
    title: "Long-term partner",
    description: "Support doesn't end at launch — it's the start of a relationship.",
  },
];

export function About() {
  return (
    <section id="about" className="relative py-32 lg:py-40">
      <div className="mx-auto max-w-7xl px-6 lg:px-12">
        <div className="grid gap-16 lg:grid-cols-2 lg:gap-12">
          <div className="flex flex-col gap-8">
            <SectionHeading
              eyebrow="About"
              title="Crafting digital products that feel premium"
              italicWord="premium"
            />

            <Reveal variant="up" delay={0.1}>
              <div className="flex flex-col gap-5 text-base leading-relaxed text-muted sm:text-lg">
                <p>
                  I&apos;m {SITE.name}, a freelance full-stack developer who partners
                  directly with founders and teams to design and build web products
                  end-to-end — no handoffs, no diluted vision.
                </p>
                <p>
                  My background spans landing pages, dashboards, and Telegram Web
                  Apps, but the constant across every project is the same: obsess
                  over the details most developers skip.
                </p>
              </div>
            </Reveal>

            <Reveal variant="left" delay={0.2}>
              <blockquote className="border-l-2 border-blue-soft/60 pl-6">
                <p className="font-serif-italic text-xl text-foreground sm:text-2xl">
                  &ldquo;Good code is invisible. Great design is unforgettable.&rdquo;
                </p>
              </blockquote>
            </Reveal>
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            {PHILOSOPHY_CARDS.map((card, i) => (
              <Reveal key={card.title} variant="scale" delay={i * 0.1}>
                <motion.div
                  whileHover={{ y: -6, borderColor: "rgba(122,162,255,0.5)" }}
                  transition={{ duration: 0.3 }}
                  className="flex h-full flex-col gap-4 rounded-2xl border border-line bg-surface/60 p-7"
                >
                  <span className="flex h-11 w-11 items-center justify-center rounded-full bg-blue-soft/10 text-blue-soft">
                    <card.icon size={18} />
                  </span>
                  <h3 className="text-lg font-bold text-foreground">{card.title}</h3>
                  <p className="text-sm leading-relaxed text-muted">
                    {card.description}
                  </p>
                </motion.div>
              </Reveal>
            ))}
          </div>
        </div>

        <Reveal variant="blur" delay={0.1} className="mt-24">
          <div className="flex flex-col gap-6">
            <span className="text-xs font-medium uppercase tracking-[0.3em] text-muted">
              Working with
            </span>
            <Marquee>
              {TECH_STACK.map((tech) => (
                <span
                  key={tech}
                  className="text-2xl font-extrabold tracking-tight text-foreground/25 sm:text-3xl"
                >
                  {tech}
                </span>
              ))}
            </Marquee>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
