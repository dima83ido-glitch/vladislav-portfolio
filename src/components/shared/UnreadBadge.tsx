"use client";

import { useTranslations } from "next-intl";
import { AnimatePresence, motion } from "framer-motion";

// Small red premium notification circle. Renders nothing at count <= 0 so
// callers never need their own conditional — just always render this next
// to a nav label and it takes care of showing/hiding itself.
export function UnreadBadge({ count }: { count: number }) {
  const t = useTranslations("common");

  return (
    <AnimatePresence>
      {count > 0 ? (
        <motion.span
          key={count}
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.5, opacity: 0 }}
          transition={{ type: "spring", stiffness: 400, damping: 20 }}
          role="status"
          aria-label={t("unreadCount", { count })}
          className="flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1.5 text-[11px] font-bold leading-none text-white shadow-[0_0_0_2px_var(--color-surface)]"
        >
          {count > 99 ? "99+" : count}
        </motion.span>
      ) : null}
    </AnimatePresence>
  );
}
