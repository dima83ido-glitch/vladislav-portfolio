import type { Metadata, Viewport } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import { notFound } from "next/navigation";
import { hasLocale } from "next-intl";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, getTranslations, setRequestLocale } from "next-intl/server";
import "../globals.css";
import { routing } from "@/i18n/routing";
import { SITE } from "@/lib/data/site";
import { getSession } from "@/lib/auth/session";
import { getUnreadCounts } from "@/db/queries/notifications";
import { SmoothScroll } from "@/components/layout/SmoothScroll";
import { CustomCursor } from "@/components/layout/CustomCursor";
import { LoadingScreen } from "@/components/layout/LoadingScreen";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  style: ["normal", "italic"],
  display: "swap",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  style: ["italic"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const OG_LOCALES: Record<string, string> = {
  en: "en_US",
  uk: "uk_UA",
  ru: "ru_RU",
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

type LayoutProps = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();

  const t = await getTranslations({ locale, namespace: "seo" });

  const languages: Record<string, string> = {};
  for (const l of routing.locales) {
    languages[l] = l === routing.defaultLocale ? "/" : `/${l}`;
  }
  languages["x-default"] = "/";

  const canonical = locale === routing.defaultLocale ? "/" : `/${locale}`;

  return {
    metadataBase: new URL(SITE.url),
    title: {
      default: t("title"),
      template: `%s — ${SITE.name}`,
    },
    description: t("description"),
    keywords: t.raw("keywords") as string[],
    authors: [{ name: SITE.name, url: SITE.url }],
    creator: SITE.name,
    applicationName: SITE.name,
    alternates: {
      canonical,
      languages,
    },
    openGraph: {
      type: "website",
      locale: OG_LOCALES[locale] ?? OG_LOCALES[routing.defaultLocale],
      url: canonical,
      title: t("title"),
      description: t("description"),
      siteName: SITE.name,
    },
    twitter: {
      card: "summary_large_image",
      title: t("title"),
      description: t("description"),
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-image-preview": "large",
        "max-snippet": -1,
        "max-video-preview": -1,
      },
    },
  };
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#030407",
};

export default async function LocaleLayout({ children, params }: LayoutProps) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();

  setRequestLocale(locale);

  const session = await getSession();
  const unreadCounts = session ? await getUnreadCounts(session.user.id) : null;
  const headerUser = session
    ? {
        email: session.user.email,
        role: session.user.role,
        displayName: session.user.displayName,
        avatarUrl: session.user.avatarUrl,
        avatarEmoji: session.user.avatarEmoji,
        unreadOrders: unreadCounts!.orders,
        unreadSupport: unreadCounts!.support,
        unreadAdminTotal:
          session.user.role === "admin" ? unreadCounts!.support + unreadCounts!.orders : 0,
      }
    : null;

  const messages = await getMessages();
  const t = await getTranslations({ locale, namespace: "seo" });
  const siteT = await getTranslations({ locale, namespace: "site" });

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ProfessionalService",
    name: SITE.name,
    description: t("description"),
    url: SITE.url,
    image: `${SITE.url}/opengraph-image`,
    areaServed: "Worldwide",
    inLanguage: locale,
    founder: {
      "@type": "Person",
      name: SITE.name,
      jobTitle: siteT("role"),
      email: SITE.contact.email,
      sameAs: [SITE.contact.githubUrl, SITE.contact.telegramUrl],
    },
    sameAs: [SITE.contact.githubUrl, SITE.contact.telegramUrl],
    makesOffer: [
      "Landing Pages",
      "Business Websites",
      "Corporate Websites",
      "Dashboards",
      "Telegram Web Apps",
      "Custom Development",
    ].map((name) => ({
      "@type": "Offer",
      itemOffered: {
        "@type": "Service",
        name,
      },
    })),
  };

  return (
    <html lang={locale} className={`${inter.variable} ${playfair.variable}`}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="min-h-screen antialiased">
        <NextIntlClientProvider messages={messages}>
          <LoadingScreen />
          <div className="noise-overlay" />
          <CustomCursor />
          <SmoothScroll>
            <Header user={headerUser} />
            <main>{children}</main>
            <Footer />
          </SmoothScroll>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
