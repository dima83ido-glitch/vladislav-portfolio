"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { FiPlus } from "react-icons/fi";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/ui/Reveal";
import { FAQ_ITEMS } from "@/lib/data/faq";
import { cn } from "@/lib/utils";

export function FAQ() {
  const [openId, setOpenId] = useState<string | null>(FAQ_ITEMS[0]?.id ?? null);

  return (
    <section id="faq" className="relative py-32 lg:py-40">
      <div className="mx-auto max-w-4xl px-6 lg:px-12">
        <SectionHeading
          eyebrow="FAQ"
          title="Questions, answered"
          italicWord="answered"
          align="center"
          className="mx-auto items-center text-center"
          description="Everything you'd want to know before reaching out. Still curious about something else? Just ask."
        />

        <div className="mt-16 flex flex-col divide-y divide-line border-y border-line">
          {FAQ_ITEMS.map((item, i) => {
            const isOpen = openId === item.id;

            return (
              <Reveal key={item.id} variant="up" delay={i * 0.05}>
                <div>
                  <button
                    type="button"
                    onClick={() => setOpenId(isOpen ? null : item.id)}
                    aria-expanded={isOpen}
                    className="flex w-full items-center justify-between gap-6 py-6 text-left"
                  >
                    <span
                      className={cn(
                        "text-lg font-semibold transition-colors sm:text-xl",
                        isOpen ? "text-blue-soft" : "text-foreground"
                      )}
                    >
                      {item.question}
                    </span>
                    <motion.span
                      animate={{ rotate: isOpen ? 45 : 0 }}
                      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                      className={cn(
                        "flex h-9 w-9 shrink-0 items-center justify-center rounded-full border transition-colors",
                        isOpen
                          ? "border-blue-soft text-blue-soft"
                          : "border-line-strong text-foreground"
                      )}
                    >
                      <FiPlus size={16} />
                    </motion.span>
                  </button>

                  <AnimatePresence initial={false}>
                    {isOpen ? (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                        className="overflow-hidden"
                      >
                        <p className="max-w-2xl pb-7 text-sm leading-relaxed text-muted sm:text-base">
                          {item.answer}
                        </p>
                      </motion.div>
                    ) : null}
                  </AnimatePresence>
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
