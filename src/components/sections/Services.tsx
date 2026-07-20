"use client";

import { motion } from "framer-motion";
import { FiCheck } from "react-icons/fi";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/ui/Reveal";
import { SERVICES } from "@/lib/data/services";

export function Services() {
  return (
    <section id="services" className="relative py-32 lg:py-40">
      <div className="mx-auto max-w-7xl px-6 lg:px-12">
        <SectionHeading
          eyebrow="Services"
          title="What I can build for you"
          italicWord="build"
          description="From a single high-converting page to a full internal platform — scoped and built around what your business actually needs."
        />

        <div className="mt-20 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {SERVICES.map((service, i) => (
            <Reveal key={service.id} variant="up" delay={(i % 3) * 0.1}>
              <motion.div
                whileHover={{ y: -8 }}
                transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                className="group relative flex h-full flex-col gap-6 overflow-hidden rounded-2xl border border-line bg-surface/60 p-8"
              >
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-blue-soft/0 via-blue-soft/0 to-blue-soft/0 opacity-0 transition-opacity duration-500 group-hover:from-blue-soft/[0.06] group-hover:opacity-100" />

                <div className="relative flex items-start justify-between">
                  <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-soft/10 text-blue-soft transition-colors duration-300 group-hover:bg-blue-soft group-hover:text-background">
                    <service.icon size={20} />
                  </span>
                  <span className="font-mono text-xs text-muted/60">
                    {service.index}
                  </span>
                </div>

                <div className="relative flex flex-col gap-3">
                  <h3 className="text-xl font-bold text-foreground">
                    {service.title}
                  </h3>
                  <p className="text-sm leading-relaxed text-muted">
                    {service.description}
                  </p>
                </div>

                <ul className="relative mt-auto flex flex-col gap-2 border-t border-line pt-5">
                  {service.features.map((feature) => (
                    <li
                      key={feature}
                      className="flex items-center gap-2 text-xs text-foreground/70"
                    >
                      <FiCheck className="shrink-0 text-blue-soft" size={13} />
                      {feature}
                    </li>
                  ))}
                </ul>
              </motion.div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
