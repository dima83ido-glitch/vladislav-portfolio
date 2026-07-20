"use client";

import { useTranslations } from "next-intl";
import { FiLifeBuoy, FiShoppingBag, FiUser } from "react-icons/fi";
import { Link, usePathname } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

const LINKS = [
  { key: "profile", href: "/account", icon: FiUser },
  { key: "orders", href: "/account/orders", icon: FiShoppingBag },
  { key: "support", href: "/account/support", icon: FiLifeBuoy },
];

export function AccountNav() {
  const t = useTranslations("account.nav");
  const pathname = usePathname();

  return (
    <nav className="flex gap-2 overflow-x-auto sm:flex-col sm:gap-1">
      {LINKS.map((link) => {
        const isActive =
          link.href === "/account" ? pathname === "/account" : pathname.startsWith(link.href);
        return (
          <Link
            key={link.key}
            href={link.href}
            className={cn(
              "flex shrink-0 items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-colors",
              isActive
                ? "bg-blue-soft/10 text-blue-soft"
                : "text-muted hover:bg-line/50 hover:text-foreground"
            )}
          >
            <link.icon size={16} />
            {t(link.key)}
          </Link>
        );
      })}
    </nav>
  );
}
