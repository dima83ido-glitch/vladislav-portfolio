"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { FiArrowUpRight } from "react-icons/fi";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/ui/Reveal";
import { PROJECTS } from "@/lib/data/projects";

export function Portfolio() {
  const t = useTranslations("portfolio");

  return (
    <section id="portfolio" className="relative py-32 lg:py-40">
      <div className="mx-auto max-w-7xl px-6 lg:px-12">
        <SectionHeading
          eyebrow={t("eyebrow")}
          title={t("title")}
          italicWord={t("italicWord")}
          description={t("description")}
        />

        <div className="mt-20 grid grid-cols-1 gap-x-8 gap-y-20 md:grid-cols-2">
          {PROJECTS.map((project, i) => {
            const title = t(`items.${project.id}.title`);
            const category = t(`items.${project.id}.category`);

            return (
              <Reveal key={project.id} variant="up" delay={(i % 2) * 0.12}>
                <a
                  href={project.href}
                  onClick={(e) => e.preventDefault()}
                  className="group flex flex-col gap-6"
                  data-cursor-pointer
                >
                  <div className="relative aspect-[4/3] overflow-hidden rounded-2xl border border-line bg-surface">
                    <motion.div
                      className="h-full w-full"
                      whileHover="hover"
                      initial="rest"
                      animate="rest"
                    >
                      <motion.div
                        variants={{ rest: { scale: 1 }, hover: { scale: 1.08 } }}
                        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                        className="relative h-full w-full"
                      >
                        <Image
                          src={project.image}
                          alt={`${title} — ${category} project preview`}
                          fill
                          sizes="(max-width: 768px) 100vw, 50vw"
                          className="object-cover"
                        />
                      </motion.div>
                      <motion.div
                        variants={{ rest: { opacity: 0 }, hover: { opacity: 1 } }}
                        transition={{ duration: 0.4 }}
                        className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/10 to-transparent"
                      />
                      <motion.div
                        variants={{
                          rest: { opacity: 0, scale: 0.7, rotate: -20 },
                          hover: { opacity: 1, scale: 1, rotate: 0 },
                        }}
                        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                        className="absolute bottom-5 right-5 flex h-12 w-12 items-center justify-center rounded-full bg-blue-soft text-background"
                      >
                        <FiArrowUpRight size={20} />
                      </motion.div>
                    </motion.div>
                  </div>

                  <div className="flex flex-col gap-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium uppercase tracking-[0.2em] text-blue-soft">
                        {category}
                      </span>
                      <span className="font-mono text-xs text-muted">{project.year}</span>
                    </div>
                    <h3 className="text-2xl font-bold text-foreground transition-colors group-hover:text-blue-soft">
                      {title}
                    </h3>
                    <p className="text-sm leading-relaxed text-muted">
                      {t(`items.${project.id}.description`)}
                    </p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {project.tech.map((tech) => (
                        <span
                          key={tech}
                          className="rounded-full border border-line px-3 py-1 text-xs text-foreground/70"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>
                </a>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
