"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { FiArrowUpRight, FiFolder } from "react-icons/fi";
import { Reveal } from "@/components/ui/Reveal";

export type NormalizedProject = {
  id: string;
  title: string;
  category: string;
  description: string;
  year: string;
  image: string | null;
  tech: string[];
  href: string;
};

export function PortfolioGrid({ projects }: { projects: NormalizedProject[] }) {
  const t = useTranslations("portfolio");

  if (projects.length === 0) {
    return (
      <Reveal variant="up" className="mt-20">
        <div className="flex flex-col items-center gap-4 rounded-3xl border border-dashed border-line-strong bg-surface/40 px-8 py-24 text-center">
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-blue-soft/10 text-blue-soft">
            <FiFolder size={24} />
          </span>
          <p className="text-lg font-semibold text-foreground">{t("empty")}</p>
          <p className="max-w-sm text-sm text-muted">{t("emptyDescription")}</p>
        </div>
      </Reveal>
    );
  }

  return (
    <div className="mt-20 grid grid-cols-1 gap-x-8 gap-y-20 md:grid-cols-2">
      {projects.map((project, i) => {
        const isExternal = project.href !== "#";

        return (
          <Reveal key={project.id} variant="up" delay={(i % 2) * 0.12}>
            <a
              href={project.href}
              onClick={isExternal ? undefined : (e) => e.preventDefault()}
              target={isExternal ? "_blank" : undefined}
              rel={isExternal ? "noreferrer noopener" : undefined}
              className="group flex flex-col gap-6"
              data-cursor-pointer
            >
              <div className="relative aspect-[4/3] overflow-hidden rounded-2xl border border-line bg-surface">
                <motion.div className="h-full w-full" whileHover="hover" initial="rest" animate="rest">
                  <motion.div
                    variants={{ rest: { scale: 1 }, hover: { scale: 1.08 } }}
                    transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                    className="relative h-full w-full"
                  >
                    {project.image ? (
                      <Image
                        src={project.image}
                        alt={`${project.title} — ${project.category} project preview`}
                        fill
                        sizes="(max-width: 768px) 100vw, 50vw"
                        className="object-cover"
                      />
                    ) : (
                      <div className="h-full w-full bg-gradient-to-br from-blue-soft/15 via-surface to-line" />
                    )}
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
                    {project.category}
                  </span>
                  <span className="font-mono text-xs text-muted">{project.year}</span>
                </div>
                <h3 className="text-2xl font-bold text-foreground transition-colors group-hover:text-blue-soft">
                  {project.title}
                </h3>
                <p className="text-sm leading-relaxed text-muted">{project.description}</p>
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
  );
}
