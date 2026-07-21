"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import NextLink from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { FiArrowUpRight, FiLogOut, FiShield, FiShoppingBag, FiStar, FiUser } from "react-icons/fi";
import { Link } from "@/i18n/navigation";
import { LanguageSwitcher } from "@/components/layout/LanguageSwitcher";
import { logout } from "@/lib/auth/actions";
import { cn, initials } from "@/lib/utils";
import { useScrollLock } from "@/hooks/useScrollLock";

type PanelUser = { email: string; role: "admin" | "customer"; displayName: string | null };

export function UserPanel({ user }: { user: PanelUser }) {
  const t = useTranslations("panel");
  const navT = useTranslations("nav");
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);

  useScrollLock(isOpen);

  async function handleLogout() {
    setIsOpen(false);
    await logout();
    router.refresh();
  }

  const links = [
    { key: "profile", href: "/account", icon: FiUser },
    { key: "myOrders", href: "/account/orders", icon: FiShoppingBag },
    { key: "support", href: "/account/support", icon: FiShield },
    { key: "leaveReview", href: "/#reviews", icon: FiStar },
  ];

  // Admin lives outside the [locale] segment (it's an English-only internal
  // tool), so this link deliberately uses the plain (non-locale-prefixed)
  // Link — the locale-aware Link would prepend /uk or /ru and 404, since
  // there's no such route under [locale]/admin.
  const adminLink = user.role === "admin" ? { key: "adminDashboard", href: "/admin", icon: FiShield } : null;

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        aria-label={t("profile")}
        className={cn(
          "flex h-10 w-10 items-center justify-center rounded-full border border-line-strong",
          "text-sm font-semibold text-foreground transition-colors hover:border-blue-soft hover:text-blue-soft"
        )}
        data-cursor-pointer
      >
        {initials(user)}
      </button>

      <AnimatePresence>
        {isOpen ? (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="fixed inset-0 z-[70] bg-background/85 backdrop-blur-md"
              onClick={() => setIsOpen(false)}
            />
            <motion.div
              initial={{ x: "110%", opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: "110%", opacity: 0 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="fixed inset-y-4 right-4 z-[80] flex w-[calc(100%-2rem)] max-w-sm flex-col rounded-3xl border border-line-strong bg-surface px-8 py-10 shadow-2xl shadow-black/50"
            >
              <div className="flex items-center gap-4 border-b border-line pb-6">
                <span className="flex h-14 w-14 items-center justify-center rounded-full bg-blue-soft/10 text-lg font-bold text-blue-soft">
                  {initials(user)}
                </span>
                <div className="flex flex-col overflow-hidden">
                  <span className="truncate font-semibold text-foreground">
                    {user.displayName || user.email.split("@")[0]}
                  </span>
                  <span className="truncate text-xs text-muted">{user.email}</span>
                </div>
              </div>

              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.12, duration: 0.4 }}
              >
                <Link
                  href="/pricing"
                  onClick={() => setIsOpen(false)}
                  className="group mt-6 flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-blue-soft to-blue px-5 py-4 text-sm font-bold text-background shadow-lg shadow-blue-glow/30 transition-transform duration-300 hover:scale-[1.02] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-soft focus-visible:ring-offset-2 focus-visible:ring-offset-surface"
                >
                  {t("startProject")}
                  <FiArrowUpRight className="transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1" />
                </Link>
              </motion.div>

              <nav className="mt-6 flex flex-1 flex-col gap-1 overflow-y-auto">
                {links.map((link, i) => (
                  <motion.div
                    key={link.key}
                    initial={{ opacity: 0, x: 16 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.16 + i * 0.05, duration: 0.4 }}
                  >
                    <Link
                      href={link.href}
                      onClick={() => setIsOpen(false)}
                      className="flex items-center gap-3 rounded-xl px-3 py-3 text-base font-medium text-foreground/85 transition-colors hover:bg-line/60 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-soft"
                    >
                      <link.icon size={17} />
                      {t(link.key)}
                    </Link>
                  </motion.div>
                ))}
                {adminLink ? (
                  <motion.div
                    initial={{ opacity: 0, x: 16 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.16 + links.length * 0.05, duration: 0.4 }}
                  >
                    <NextLink
                      href={adminLink.href}
                      onClick={() => setIsOpen(false)}
                      className="flex items-center gap-3 rounded-xl px-3 py-3 text-base font-medium text-foreground/85 transition-colors hover:bg-line/60 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-soft"
                    >
                      <adminLink.icon size={17} />
                      {t(adminLink.key)}
                    </NextLink>
                  </motion.div>
                ) : null}
              </nav>

              <div className="flex flex-col gap-4 border-t border-line pt-6">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium uppercase tracking-[0.2em] text-muted">
                    {navT("language")}
                  </span>
                  <LanguageSwitcher />
                </div>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="flex items-center gap-3 rounded-xl px-3 py-3 text-base font-medium text-foreground/85 transition-colors hover:bg-line/60 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-soft"
                >
                  <FiLogOut size={17} />
                  {navT("signOut")}
                </button>
              </div>
            </motion.div>
          </>
        ) : null}
      </AnimatePresence>
    </>
  );
}
