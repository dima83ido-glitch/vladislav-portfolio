"use client";

import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { FiArrowUpRight, FiGithub, FiMail, FiSend } from "react-icons/fi";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/ui/Reveal";
import { MagneticButton } from "@/components/ui/MagneticButton";
import { GlowBackground } from "@/components/ui/GlowBackground";
import { SITE } from "@/lib/data/site";

export function Contact() {
  const t = useTranslations("contact");

  const CONTACT_METHODS = [
    {
      key: "telegram",
      value: SITE.contact.telegramHandle,
      href: SITE.contact.telegramUrl,
      icon: FiSend,
    },
    {
      key: "github",
      value: SITE.contact.githubHandle,
      href: SITE.contact.githubUrl,
      icon: FiGithub,
    },
    {
      key: "email",
      value: SITE.contact.email,
      href: `mailto:${SITE.contact.email}`,
      icon: FiMail,
    },
  ];

  return (
    <section id="contact" className="relative overflow-hidden py-32 lg:py-40">
      <GlowBackground variant="section" />

      <div className="relative mx-auto max-w-7xl px-6 lg:px-12">
        <SectionHeading
          eyebrow={t("eyebrow")}
          title={t("title")}
          italicWord={t("italicWord")}
          align="center"
          className="mx-auto items-center text-center"
          description={t("description")}
        />

        <Reveal variant="scale" delay={0.15} className="mt-16 flex justify-center">
          <MagneticButton
            as="a"
            href={`mailto:${SITE.contact.email}`}
            strength={0.3}
            className="group rounded-full bg-foreground px-10 py-6 text-2xl font-extrabold tracking-tight text-background transition-colors hover:bg-blue-soft sm:text-3xl"
          >
            {t("sayHello")}
            <FiArrowUpRight className="transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1" />
          </MagneticButton>
        </Reveal>

        <div className="mx-auto mt-24 grid max-w-3xl grid-cols-1 gap-5 sm:grid-cols-3">
          {CONTACT_METHODS.map((method, i) => (
            <Reveal key={method.key} variant="up" delay={0.1 + i * 0.1}>
              <motion.a
                href={method.href}
                target={method.key !== "email" ? "_blank" : undefined}
                rel={method.key !== "email" ? "noreferrer noopener" : undefined}
                whileHover={{ y: -6 }}
                transition={{ duration: 0.3 }}
                className="group flex flex-col items-center gap-4 rounded-2xl border border-line bg-surface/60 px-6 py-8 text-center"
                data-cursor-pointer
              >
                <span className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-soft/10 text-blue-soft transition-colors group-hover:bg-blue-soft group-hover:text-background">
                  <method.icon size={20} />
                </span>
                <div className="flex flex-col gap-1">
                  <span className="text-xs font-medium uppercase tracking-[0.2em] text-muted">
                    {t(`methods.${method.key}`)}
                  </span>
                  <span className="text-sm font-semibold text-foreground break-all">
                    {method.value}
                  </span>
                </div>
              </motion.a>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
