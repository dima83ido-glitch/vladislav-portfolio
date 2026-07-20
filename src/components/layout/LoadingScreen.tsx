"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { SITE } from "@/lib/data/site";

export function LoadingScreen() {
  const [isLoading, setIsLoading] = useState(true);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    document.documentElement.classList.add("overflow-hidden");

    const interval = setInterval(() => {
      setProgress((prev) => {
        const next = prev + Math.max(2, (100 - prev) / 8);
        if (next >= 100) {
          clearInterval(interval);
          return 100;
        }
        return next;
      });
    }, 60);

    const timeout = setTimeout(() => {
      setIsLoading(false);
      document.documentElement.classList.remove("overflow-hidden");
    }, 1900);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
      document.documentElement.classList.remove("overflow-hidden");
    };
  }, []);

  return (
    <AnimatePresence>
      {isLoading ? (
        <motion.div
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center gap-8 bg-background"
          initial={{ opacity: 1 }}
          exit={{
            opacity: 0,
            transition: { duration: 0.6, delay: 0.15, ease: [0.16, 1, 0.3, 1] },
          }}
        >
          <motion.div
            initial={{ clipPath: "inset(0 100% 0 0)" }}
            animate={{ clipPath: "inset(0 0% 0 0)" }}
            exit={{ clipPath: "inset(0 0 0 100%)" }}
            transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden"
          >
            <span className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
              {SITE.name}
              <span className="text-blue-soft">.</span>
            </span>
          </motion.div>

          <div className="h-px w-48 overflow-hidden bg-line sm:w-64">
            <motion.div
              className="h-full bg-blue-soft"
              style={{ width: `${progress}%` }}
              transition={{ ease: "linear" }}
            />
          </div>

          <span className="font-mono text-xs tracking-[0.3em] text-muted">
            {Math.floor(progress)}%
          </span>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
