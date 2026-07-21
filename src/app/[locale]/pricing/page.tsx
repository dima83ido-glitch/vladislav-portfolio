import { hasLocale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import { PricingGrid } from "@/components/sections/PricingGrid";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { GlowBackground } from "@/components/ui/GlowBackground";
import { BackButton } from "@/components/ui/BackButton";
import { HomeButton } from "@/components/ui/HomeButton";

type PageProps = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: PageProps) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "pricingPage" });
  return { title: t("title") };
}

export default async function PricingPage({ params }: PageProps) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);

  const t = await getTranslations("pricingPage");
  const commonT = await getTranslations("common");

  return (
    <section className="relative overflow-hidden py-32 lg:py-40">
      <GlowBackground variant="section" />

      <div className="relative mx-auto max-w-7xl px-6 lg:px-12">
        <div className="mb-10 flex items-center gap-4">
          <BackButton label={commonT("back")} />
          <HomeButton label={commonT("home")} />
        </div>
        <SectionHeading
          eyebrow={t("eyebrow")}
          title={t("title")}
          italicWord={t("italicWord")}
          align="center"
          className="mx-auto items-center text-center"
          description={t("description")}
        />

        <PricingGrid />
      </div>
    </section>
  );
}
