"use client";

import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/ui/Reveal";
import { SKILL_GROUPS } from "@/lib/data/skills";

export function Skills() {
  const t = useTranslations("skills");

  return (
    <section id="skills" className="relative py-32 lg:py-40">
      <div className="mx-auto max-w-7xl px-6 lg:px-12">
        <SectionHeading
          eyebrow={t("eyebrow")}
          title={t("title")}
          italicWord={t("italicWord")}
          description={t("description")}
        />

        <div className="mt-20 grid gap-x-12 gap-y-16 lg:grid-cols-3">
          {SKILL_GROUPS.map((group, groupIndex) => (
            <Reveal key={group.id} variant="up" delay={groupIndex * 0.12}>
              <div className="flex flex-col gap-8">
                <h3 className="text-sm font-medium uppercase tracking-[0.25em] text-blue-soft">
                  {t(`categories.${group.id}`)}
                </h3>
                <div className="flex flex-col gap-7">
                  {group.skills.map((skill, skillIndex) => (
                    <div key={skill.name} className="flex flex-col gap-3">
                      <div className="flex items-baseline justify-between">
                        <span className="text-base font-semibold text-foreground">
                          {skill.name}
                        </span>
                        <span className="font-mono text-xs text-muted">
                          {skill.level}%
                        </span>
                      </div>
                      <div className="h-[3px] w-full overflow-hidden rounded-full bg-line">
                        <motion.div
                          className="h-full rounded-full bg-gradient-to-r from-blue-dim to-blue-soft"
                          initial={{ width: "0%" }}
                          whileInView={{ width: `${skill.level}%` }}
                          viewport={{ once: true, amount: 0.6 }}
                          transition={{
                            duration: 1.2,
                            delay: skillIndex * 0.1,
                            ease: [0.16, 1, 0.3, 1],
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
