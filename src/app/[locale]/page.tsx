import { setRequestLocale } from "next-intl/server";
import { hasLocale } from "next-intl";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import { Hero, type HeroStat } from "@/components/sections/Hero";
import { About, type AboutPhilosophyCard } from "@/components/sections/About";
import { Skills } from "@/components/sections/Skills";
import { Services } from "@/components/sections/Services";
import { Portfolio } from "@/components/sections/Portfolio";
import { Process } from "@/components/sections/Process";
import { Pricing } from "@/components/sections/Pricing";
import { Reviews } from "@/components/sections/Reviews";
import { FAQ } from "@/components/sections/FAQ";
import { Contact } from "@/components/sections/Contact";
import { getAboutContent } from "@/db/queries/content";
import { resolveLocalizedList, resolveLocalizedText } from "@/lib/cms/localized";

type PageProps = {
  params: Promise<{ locale: string }>;
};

export default async function Home({ params }: PageProps) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);

  const aboutContent = await getAboutContent();

  const heroStats: HeroStat[] | undefined = aboutContent
    ? aboutContent.heroStats.map((s) => ({
        value: s.value,
        suffix: s.suffix,
        label: resolveLocalizedText(s.label, locale),
      }))
    : undefined;

  const biography: string[] | undefined = aboutContent
    ? resolveLocalizedList(aboutContent.biography, locale)
    : undefined;

  const philosophyCards: AboutPhilosophyCard[] | undefined = aboutContent
    ? aboutContent.philosophyCards.map((c) => ({
        icon: c.icon,
        title: resolveLocalizedText(c.title, locale),
        description: resolveLocalizedText(c.description, locale),
      }))
    : undefined;

  return (
    <>
      <Hero stats={heroStats} />
      <About biography={biography} philosophyCards={philosophyCards} />
      <Skills />
      <Services />
      <Portfolio />
      <Process />
      <Pricing />
      <Reviews />
      <FAQ />
      <Contact />
    </>
  );
}
