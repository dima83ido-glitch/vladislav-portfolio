"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { AnimatePresence, motion, useMotionValueEvent, useScroll } from "framer-motion";
import { FiMenu, FiX } from "react-icons/fi";
import { Link } from "@/i18n/navigation";
import { NAV_LINKS } from "@/lib/data/nav";
import { SITE } from "@/lib/data/site";
import { cn } from "@/lib/utils";
import { LanguageSwitcher } from "@/components/layout/LanguageSwitcher";
import { UserPanel } from "@/components/layout/UserPanel";
import { useScrollLock } from "@/hooks/useScrollLock";

type HeaderUser = {
  email: string;
  role: "admin" | "customer";
  displayName: string | null;
} | null;

export function Header({ user = null }: { user?: HeaderUser }) {
  const t = useTranslations("nav");
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { scrollY } = useScroll();

  useMotionValueEvent(scrollY, "change", (latest) => {
    setIsScrolled(latest > 24);
  });

  useScrollLock(isMenuOpen);

  return (
    <>
      <header
        className={cn(
          "fixed inset-x-0 top-0 z-50 transition-all duration-500",
          isScrolled
            ? "bg-background/70 backdrop-blur-xl border-b border-line"
            : "bg-transparent border-b border-transparent"
        )}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5 lg:px-12">
          <Link
            href="#hero"
            className="text-xl font-extrabold tracking-tight text-foreground"
          >
            {SITE.name}
            <span className="text-blue-soft">.</span>
          </Link>

          <nav className="hidden items-center gap-10 lg:flex">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.key}
                href={link.href}
                className="group relative text-sm font-medium text-muted transition-colors hover:text-foreground"
              >
                {t(link.key)}
                <span className="absolute -bottom-1 left-0 h-px w-0 bg-blue-soft transition-all duration-300 group-hover:w-full" />
              </Link>
            ))}
          </nav>

          <div className="hidden items-center gap-3 lg:flex">
            <LanguageSwitcher />
            {user ? (
              <UserPanel user={user} />
            ) : (
              <>
                <Link
                  href="/login?intent=register"
                  className="text-sm font-medium text-muted transition-colors hover:text-foreground"
                >
                  {t("register")}
                </Link>
                <Link
                  href="/login"
                  className="rounded-full bg-blue-soft px-6 py-2.5 text-sm font-semibold text-background transition-colors hover:bg-blue-soft/90"
                >
                  {t("signIn")}
                </Link>
              </>
            )}
          </div>

          <button
            type="button"
            aria-label="Toggle menu"
            onClick={() => setIsMenuOpen((prev) => !prev)}
            className="z-10 text-foreground lg:hidden"
          >
            {isMenuOpen ? <FiX size={26} /> : <FiMenu size={26} />}
          </button>
        </div>
      </header>

      <AnimatePresence>
        {isMenuOpen ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="fixed inset-0 z-40 flex flex-col justify-center bg-background px-8 lg:hidden"
          >
            <nav className="flex flex-col gap-2">
              {NAV_LINKS.map((link, i) => (
                <motion.div
                  key={link.key}
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 + i * 0.06, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                >
                  <Link
                    href={link.href}
                    onClick={() => setIsMenuOpen(false)}
                    className="block py-3 text-4xl font-extrabold tracking-tight text-foreground"
                  >
                    {t(link.key)}
                  </Link>
                </motion.div>
              ))}
            </nav>

            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + NAV_LINKS.length * 0.06, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="mt-8 flex flex-wrap items-center gap-4"
            >
              <LanguageSwitcher />
              {user ? (
                <UserPanel user={user} />
              ) : (
                <>
                  <Link
                    href="/login?intent=register"
                    onClick={() => setIsMenuOpen(false)}
                    className="text-sm font-medium text-muted transition-colors hover:text-foreground"
                  >
                    {t("register")}
                  </Link>
                  <Link
                    href="/login"
                    onClick={() => setIsMenuOpen(false)}
                    className="rounded-full bg-blue-soft px-6 py-2.5 text-sm font-semibold text-background transition-colors hover:bg-blue-soft/90"
                  >
                    {t("signIn")}
                  </Link>
                </>
              )}
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
}
