"use client";

import { FiHome } from "react-icons/fi";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

/** Always returns to the public landing page, in the current locale. Pairs
 * with `BackButton` wherever that appears. */
export function HomeButton({ label, className }: { label: string; className?: string }) {
  return (
    <Link
      href="/"
      className={cn(
        "inline-flex items-center gap-2 text-xs font-medium uppercase tracking-[0.2em] text-muted transition-colors hover:text-blue-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-soft focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        className
      )}
    >
      <FiHome size={13} />
      {label}
    </Link>
  );
}
