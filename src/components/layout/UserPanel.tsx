"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { FiLogOut, FiShield, FiStar } from "react-icons/fi";
import { Link } from "@/i18n/navigation";
import { LanguageSwitcher } from "@/components/layout/LanguageSwitcher";
import { logout } from "@/lib/auth/actions";
import { cn } from "@/lib/utils";

type PanelUser = { email: string; role: "admin" | "customer"; displayName: string | null };

function initials(user: PanelUser) {
  const source = user.displayName || user.email;
  return source.slice(0, 2).toUpperCase();
}

export function UserPanel({ user }: { user: PanelUser }) {
  const t = useTranslations("panel");
  const navT = useTranslations("nav");
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    document.documentElement.classList.toggle("overflow-hidden", isOpen);
    return () => document.documentElement.classList.remove("overflow-hidden");
  }, [isOpen]);

  async function handleLogout() {
    setIsOpen(false);
    await logout();
    router.refresh();
  }

  const links = [
    { key: "leaveReview", href: "/#reviews", icon: FiStar },
    ...(user.role === "admin"
      ? [{ key: "adminDashboard", href: "/admin", icon: FiShield }]
      : []),
  ];

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
              className="fixed inset-0 z-[70] bg-background/80 backdrop-blur-sm"
              onClick={() => setIsOpen(false)}
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
              className="fixed inset-y-0 right-0 z-[80] flex w-full max-w-sm flex-col border-l border-line bg-surface px-8 py-10"
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

              <nav className="mt-8 flex flex-1 flex-col gap-1">
                {links.map((link, i) => (
                  <motion.div
                    key={link.key}
                    initial={{ opacity: 0, x: 16 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 + i * 0.05, duration: 0.4 }}
                  >
                    <Link
                      href={link.href}
                      onClick={() => setIsOpen(false)}
                      className="flex items-center gap-3 rounded-xl px-3 py-3 text-base font-medium text-foreground/85 transition-colors hover:bg-line/50 hover:text-foreground"
                    >
                      <link.icon size={17} />
                      {t(link.key)}
                    </Link>
                  </motion.div>
                ))}
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
                  className="flex items-center gap-3 rounded-xl px-3 py-3 text-base font-medium text-foreground/85 transition-colors hover:bg-line/50 hover:text-foreground"
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
