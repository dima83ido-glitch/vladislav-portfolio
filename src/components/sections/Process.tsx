"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useTranslations } from "next-intl";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/ui/Reveal";
import { PROCESS_STEPS } from "@/lib/data/process";

export function Process() {
  const t = useTranslations("process");
  const timelineRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      if (!timelineRef.current || !progressRef.current) return;

      gsap.fromTo(
        progressRef.current,
        { height: "0%" },
        {
          height: "100%",
          ease: "none",
          scrollTrigger: {
            trigger: timelineRef.current,
            start: "top 70%",
            end: "bottom 60%",
            scrub: 0.6,
          },
        }
      );
    }, timelineRef);

    return () => ctx.revert();
  }, []);

  return (
    <section id="process" className="relative py-32 lg:py-40">
      <div className="mx-auto max-w-7xl px-6 lg:px-12">
        <SectionHeading
          eyebrow={t("eyebrow")}
          title={t("title")}
          italicWord={t("italicWord")}
          description={t("description")}
        />

        <div ref={timelineRef} className="relative mt-20">
          {/*
            Line center must sit exactly on the number-circle center: row
            padding (pl-2 = 0.5rem) + circle radius (w-10/h-10 = 2.5rem, so
            1.25rem; sm:w-14/h-14 = 3.5rem, so 1.75rem). left-1/2 + a
            -translate-x-1/2 puts the 1px line's center — not its edge — at
            that x, so it stays correct regardless of the line's own width.
          */}
          <div className="absolute left-[1.75rem] top-0 h-full w-px -translate-x-1/2 bg-line sm:left-[2.25rem]" />
          <div
            ref={progressRef}
            className="absolute left-[1.75rem] top-0 w-px -translate-x-1/2 bg-blue-soft sm:left-[2.25rem]"
            style={{ height: "0%" }}
          />

          <div className="flex flex-col gap-14">
            {PROCESS_STEPS.map((step, i) => (
              <Reveal key={step.id} variant="left" delay={i * 0.06}>
                <div className="relative flex gap-6 pl-2 sm:gap-10 sm:pl-2">
                  <span className="relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-blue-soft/50 bg-background font-mono text-xs text-blue-soft sm:h-14 sm:w-14 sm:text-sm">
                    {step.number}
                  </span>
                  <div className="flex flex-col gap-2 pt-1 sm:pt-2">
                    <h3 className="text-2xl font-bold text-foreground sm:text-3xl">
                      {t(`steps.${step.id}.title`)}
                    </h3>
                    <p className="max-w-xl text-sm leading-relaxed text-muted sm:text-base">
                      {t(`steps.${step.id}.description`)}
                    </p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
