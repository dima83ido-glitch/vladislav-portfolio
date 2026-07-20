"use client";

import { Fragment, useRef, type Ref } from "react";
import { motion, useInView } from "framer-motion";
import { cn } from "@/lib/utils";

type RevealTextProps = {
  text: string;
  className?: string;
  delay?: number;
  stagger?: number;
  as?: "h1" | "h2" | "h3" | "p" | "span";
  wordClassName?: string;
};

export function RevealText({
  text,
  className,
  delay = 0,
  stagger = 0.06,
  as: Tag = "span",
  wordClassName,
}: RevealTextProps) {
  const containerRef = useRef<HTMLElement>(null);
  // Measured on the un-clipped container rather than on the masked word
  // spans themselves — a word's own overflow-hidden mask keeps it visually
  // clipped in its pre-animation state, so an IntersectionObserver rooted
  // on the word span would never report it as visible.
  const isInView = useInView(containerRef, { once: true, amount: 0.4 });
  const words = text.split(" ");

  return (
    <Tag
      ref={containerRef as unknown as Ref<HTMLHeadingElement>}
      className={cn("inline-block", className)}
    >
      {words.map((word, i) => (
        <Fragment key={`${word}-${i}`}>
          <span className="inline-block overflow-hidden align-top pb-[0.1em]">
            <motion.span
              className={cn("inline-block", wordClassName)}
              initial={{ y: "110%" }}
              animate={isInView ? { y: "0%" } : { y: "110%" }}
              transition={{
                duration: 0.9,
                delay: delay + i * stagger,
                ease: [0.16, 1, 0.3, 1],
              }}
            >
              {word}
            </motion.span>
          </span>
          {i !== words.length - 1 ? " " : ""}
        </Fragment>
      ))}
    </Tag>
  );
}
