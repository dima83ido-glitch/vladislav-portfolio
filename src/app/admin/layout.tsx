import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { NextIntlClientProvider } from "next-intl";
import { getTranslations } from "next-intl/server";
import "../globals.css";
import { requireAdminOrRedirect } from "@/lib/auth/session";
import { logoutAndRedirect } from "@/lib/auth/actions";
import { AdminNav } from "@/components/admin/AdminNav";
import { AdminLanguageSwitcher } from "@/components/admin/AdminLanguageSwitcher";
import { SITE } from "@/lib/data/site";
import { BackButton } from "@/components/ui/BackButton";
import { HomeButton } from "@/components/ui/HomeButton";
import { getAdminLocale, getAdminMessages } from "@/lib/i18n/adminLocale";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: "Admin",
  robots: { index: false, follow: false },
};

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireAdminOrRedirect();

  const locale = await getAdminLocale();
  const messages = await getAdminMessages(locale);
  const t = await getTranslations({ locale, namespace: "admin" });
  const commonT = await getTranslations({ locale, namespace: "common" });

  return (
    <html lang={locale} className={inter.variable}>
      <body className="min-h-screen bg-background text-foreground antialiased">
        <NextIntlClientProvider locale={locale} messages={messages}>
          <div className="mx-auto flex min-h-screen max-w-6xl flex-col px-6 py-10 lg:px-10">
            <header className="mb-10 flex flex-col gap-4 border-b border-line pb-6">
              <div className="flex items-center gap-4">
                <BackButton label={commonT("back")} />
                <HomeButton label={commonT("home")} />
              </div>
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-8">
                  <span className="text-lg font-extrabold tracking-tight">
                    {t("brand")}
                    <span className="text-blue-soft">.</span>
                  </span>
                  <AdminNav />
                </div>
                <div className="flex items-center gap-4">
                  <AdminLanguageSwitcher />
                  <form action={logoutAndRedirect}>
                    <button
                      type="submit"
                      className="text-sm font-medium text-muted transition-colors hover:text-foreground"
                    >
                      {t("signOut")}
                    </button>
                  </form>
                </div>
              </div>
            </header>
            <main className="flex-1">{children}</main>
          </div>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
