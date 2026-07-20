import Link from "next/link";
import { FiArrowUpRight, FiGithub, FiMail, FiSend } from "react-icons/fi";
import { NAV_LINKS } from "@/lib/data/nav";
import { SITE } from "@/lib/data/site";
import { Reveal } from "@/components/ui/Reveal";

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="relative border-t border-line bg-background">
      <div className="mx-auto max-w-7xl px-6 py-20 lg:px-12">
        <Reveal variant="blur">
          <Link
            href="#contact"
            className="group flex flex-col gap-2 text-5xl font-extrabold leading-none tracking-tight text-foreground transition-colors hover:text-blue-soft sm:text-6xl lg:text-7xl"
          >
            <span className="flex items-center gap-4">
              Let&apos;s build something
              <FiArrowUpRight className="hidden shrink-0 transition-transform duration-500 group-hover:translate-x-2 group-hover:-translate-y-2 sm:inline-block" />
            </span>
            <span className="font-serif-italic font-normal text-blue-soft">
              premium.
            </span>
          </Link>
        </Reveal>

        <div className="mt-20 grid grid-cols-2 gap-10 border-t border-line pt-12 sm:grid-cols-4">
          <div className="col-span-2 sm:col-span-1">
            <span className="text-lg font-extrabold tracking-tight text-foreground">
              {SITE.name}
              <span className="text-blue-soft">.</span>
            </span>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-muted">
              {SITE.shortDescription}
            </p>
          </div>

          <div>
            <span className="text-xs font-medium uppercase tracking-[0.2em] text-muted">
              Navigate
            </span>
            <ul className="mt-4 flex flex-col gap-3">
              {NAV_LINKS.slice(0, 4).map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-foreground/80 transition-colors hover:text-blue-soft"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <span className="text-xs font-medium uppercase tracking-[0.2em] text-muted">
              More
            </span>
            <ul className="mt-4 flex flex-col gap-3">
              {NAV_LINKS.slice(4).map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-foreground/80 transition-colors hover:text-blue-soft"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <span className="text-xs font-medium uppercase tracking-[0.2em] text-muted">
              Connect
            </span>
            <ul className="mt-4 flex flex-col gap-3">
              <li>
                <a
                  href={SITE.contact.telegramUrl}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="flex items-center gap-2 text-sm text-foreground/80 transition-colors hover:text-blue-soft"
                >
                  <FiSend size={14} /> Telegram
                </a>
              </li>
              <li>
                <a
                  href={SITE.contact.githubUrl}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="flex items-center gap-2 text-sm text-foreground/80 transition-colors hover:text-blue-soft"
                >
                  <FiGithub size={14} /> GitHub
                </a>
              </li>
              <li>
                <a
                  href={`mailto:${SITE.contact.email}`}
                  className="flex items-center gap-2 text-sm text-foreground/80 transition-colors hover:text-blue-soft"
                >
                  <FiMail size={14} /> Email
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-16 flex flex-col items-start justify-between gap-4 border-t border-line pt-8 text-xs text-muted sm:flex-row sm:items-center">
          <span>
            © {year} {SITE.name}. All rights reserved.
          </span>
          <span>Designed &amp; built by {SITE.name} — {SITE.location}</span>
        </div>
      </div>
    </footer>
  );
}
