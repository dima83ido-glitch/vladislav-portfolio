"use client";

import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/ui/Reveal";
import { Marquee } from "@/components/ui/Marquee";
import { SITE } from "@/lib/data/site";
import { TECH_STACK } from "@/lib/data/skills";
import { resolveIcon } from "@/lib/cms/icons";

const DEFAULT_PHILOSOPHY_IDS = ["design-first", "performance", "full-stack", "partner"] as const;
const DEFAULT_ICONS = ["pen-tool", "zap", "layers", "users"];

/** icon is a name (string) — resolved to a component here, never crossed the server/client boundary as a function. */
export type AboutPhilosophyCard = { icon: string; title: string; description: string };

export function About({
  biography,
  philosophyCards,
}: {
  biography?: string[];
  philosophyCards?: AboutPhilosophyCard[];
}) {
  const t = useTranslations("about");

  const paragraphs = biography ?? [t("paragraph1", { name: SITE.name }), t("paragraph2")];
  const cards: AboutPhilosophyCard[] =
    philosophyCards ??
    DEFAULT_PHILOSOPHY_IDS.map((id, i) => ({
      icon: DEFAULT_ICONS[i],
      title: t(`philosophy.${id}.title`),
      description: t(`philosophy.${id}.description`),
    }));

  return (
    <section id="about" className="relative py-32 lg:py-40">
      <div className="mx-auto max-w-7xl px-6 lg:px-12">
        <div className="grid gap-16 lg:grid-cols-2 lg:gap-12">
          <div className="flex flex-col gap-8">
            <SectionHeading
              eyebrow={t("eyebrow")}
              title={t("title")}
              italicWord={t("italicWord")}
            />

            <Reveal variant="up" delay={0.1}>
              <div className="flex flex-col gap-5 text-base leading-relaxed text-muted sm:text-lg">
                {paragraphs.map((p, i) => (
                  <p key={i}>{p}</p>
                ))}
              </div>
            </Reveal>

            <Reveal variant="left" delay={0.2}>
              <blockquote className="border-l-2 border-blue-soft/60 pl-6">
                <p className="font-serif-italic text-xl text-foreground sm:text-2xl">
                  &ldquo;{t("quote")}&rdquo;
                </p>
              </blockquote>
            </Reveal>
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            {cards.map((card, i) => {
              const Icon = resolveIcon(card.icon);
              return (
                <Reveal key={i} variant="scale" delay={i * 0.1}>
                  <motion.div
                    whileHover={{ y: -6, borderColor: "rgba(122,162,255,0.5)" }}
                    transition={{ duration: 0.3 }}
                    className="flex h-full flex-col gap-4 rounded-2xl border border-line bg-surface/60 p-7"
                  >
                    <span className="flex h-11 w-11 items-center justify-center rounded-full bg-blue-soft/10 text-blue-soft">
                      <Icon size={18} />
                    </span>
                    <h3 className="text-lg font-bold text-foreground">{card.title}</h3>
                    <p className="text-sm leading-relaxed text-muted">{card.description}</p>
                  </motion.div>
                </Reveal>
              );
            })}
          </div>
        </div>

        <Reveal variant="blur" delay={0.1} className="mt-24">
          <div className="flex flex-col gap-6">
            <span className="text-xs font-medium uppercase tracking-[0.3em] text-muted">
              {t("workingWith")}
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
