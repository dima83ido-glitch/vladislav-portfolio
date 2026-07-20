import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Inter } from "next/font/google";
import "../globals.css";
import { getSession } from "@/lib/auth/session";
import { logoutAndRedirect } from "@/lib/auth/actions";
import { AdminNav } from "@/components/admin/AdminNav";
import { SITE } from "@/lib/data/site";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: "Admin",
  robots: { index: false, follow: false },
};

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();

  if (!session || session.user.role !== "admin") {
    redirect("/login?callbackUrl=/admin");
  }

  return (
    <html lang="en" className={inter.variable}>
      <body className="min-h-screen bg-background text-foreground antialiased">
        <div className="mx-auto flex min-h-screen max-w-6xl flex-col px-6 py-10 lg:px-10">
          <header className="mb-10 flex items-center justify-between border-b border-line pb-6">
            <div className="flex items-center gap-8">
              <span className="text-lg font-extrabold tracking-tight">
                Admin<span className="text-blue-soft">.</span>
              </span>
              <AdminNav />
            </div>
            <form action={logoutAndRedirect}>
              <button
                type="submit"
                className="text-sm font-medium text-muted transition-colors hover:text-foreground"
              >
                Sign out
              </button>
            </form>
          </header>
          <main className="flex-1">{children}</main>
        </div>
      </body>
    </html>
  );
}
