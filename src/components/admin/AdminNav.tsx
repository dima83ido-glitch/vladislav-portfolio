"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const LINKS = [
  { href: "/admin", label: "Overview" },
  { href: "/admin/portfolio", label: "Portfolio" },
  { href: "/admin/pricing", label: "Pricing" },
  { href: "/admin/content", label: "Content" },
  { href: "/admin/reviews", label: "Reviews" },
  { href: "/admin/payments", label: "Payments" },
  { href: "/admin/support", label: "Support" },
  { href: "/admin/analytics", label: "Analytics" },
  { href: "/admin/users", label: "Users" },
  { href: "/admin/settings", label: "Settings" },
];

export function AdminNav() {
  const pathname = usePathname();

  return (
    <nav className="flex flex-wrap items-center gap-x-5 gap-y-2">
      {LINKS.map((link) => {
        const isActive = link.href === "/admin" ? pathname === "/admin" : pathname.startsWith(link.href);
        return (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              "text-sm font-medium transition-colors",
              isActive ? "text-blue-soft" : "text-muted hover:text-foreground"
            )}
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
