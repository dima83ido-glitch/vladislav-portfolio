"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { UnreadBadge } from "@/components/shared/UnreadBadge";

const LINKS = [
  { href: "/admin", key: "overview" },
  { href: "/admin/portfolio", key: "portfolio" },
  { href: "/admin/pricing", key: "pricing" },
  { href: "/admin/content", key: "content" },
  { href: "/admin/reviews", key: "reviews" },
  { href: "/admin/payments", key: "payments" },
  { href: "/admin/support", key: "support" },
  { href: "/admin/analytics", key: "analytics" },
  { href: "/admin/users", key: "users" },
  { href: "/admin/settings", key: "settings" },
] as const;

export function AdminNav({ supportUnread = 0 }: { supportUnread?: number }) {
  const pathname = usePathname();
  const t = useTranslations("admin.nav");

  return (
    <nav className="flex flex-wrap items-center gap-x-5 gap-y-2">
      {LINKS.map((link) => {
        const isActive = link.href === "/admin" ? pathname === "/admin" : pathname.startsWith(link.href);
        return (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              "flex items-center gap-1.5 text-sm font-medium transition-colors",
              isActive ? "text-blue-soft" : "text-muted hover:text-foreground"
            )}
          >
            {t(link.key)}
            {link.key === "support" ? <UnreadBadge count={supportUnread} /> : null}
          </Link>
        );
      })}
    </nav>
  );
}
