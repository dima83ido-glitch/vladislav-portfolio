"use client";

import { useEffect, useState } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";
import { useMediaQuery } from "@/hooks/useMediaQuery";

export function CustomCursor() {
  const isFinePointer = useMediaQuery("(hover: hover) and (pointer: fine)");
  const [isPointer, setIsPointer] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  const cursorX = useMotionValue(-100);
  const cursorY = useMotionValue(-100);
  const springX = useSpring(cursorX, { damping: 28, stiffness: 320, mass: 0.4 });
  const springY = useSpring(cursorY, { damping: 28, stiffness: 320, mass: 0.4 });

  useEffect(() => {
    if (!isFinePointer) return;

    document.documentElement.classList.add("custom-cursor");

    const handleMove = (event: MouseEvent) => {
      cursorX.set(event.clientX);
      cursorY.set(event.clientY);
      if (!isVisible) setIsVisible(true);

      const target = event.target as HTMLElement;
      setIsPointer(Boolean(target.closest("a, button, [data-cursor-pointer]")));
    };

    const handleLeave = () => setIsVisible(false);

    window.addEventListener("mousemove", handleMove, { passive: true });
    document.addEventListener("mouseleave", handleLeave);

    return () => {
      document.documentElement.classList.remove("custom-cursor");
      window.removeEventListener("mousemove", handleMove);
      document.removeEventListener("mouseleave", handleLeave);
    };
  }, [isFinePointer, cursorX, cursorY, isVisible]);

  if (!isFinePointer) return null;

  return (
    <motion.div
      className="pointer-events-none fixed left-0 top-0 z-[70] mix-blend-difference"
      style={{ x: springX, y: springY }}
      animate={{ opacity: isVisible ? 1 : 0 }}
      transition={{ opacity: { duration: 0.2 } }}
    >
      <motion.div
        className="rounded-full bg-white"
        animate={{
          width: isPointer ? 56 : 10,
          height: isPointer ? 56 : 10,
          x: isPointer ? -28 : -5,
          y: isPointer ? -28 : -5,
        }}
        transition={{ type: "spring", stiffness: 260, damping: 22 }}
      />
    </motion.div>
  );
}
