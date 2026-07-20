import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type MarqueeProps = {
  children: ReactNode;
  className?: string;
  reverse?: boolean;
};

export function Marquee({ children, className, reverse = false }: MarqueeProps) {
  return (
    <div
      className={cn(
        "group relative flex overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)]",
        className
      )}
    >
      <div
        className={cn(
          "flex shrink-0 items-center gap-12 pr-12 animate-marquee",
          reverse && "[animation-direction:reverse]"
        )}
      >
        {children}
      </div>
      <div
        className={cn(
          "flex shrink-0 items-center gap-12 pr-12 animate-marquee",
          reverse && "[animation-direction:reverse]"
        )}
        aria-hidden="true"
      >
        {children}
      </div>
    </div>
  );
}
