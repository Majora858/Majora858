import type { Metadata, Viewport } from "next";
import Link from "next/link";
import "./globals.css";
import { Sidebar } from "@/components/Sidebar";
import { BottomNav } from "@/components/BottomNav";
import { PwaBoot } from "@/components/PwaBoot";
import { InstallPrompt } from "@/components/InstallPrompt";
import { getCurrentUser } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Lernio – Alles was du zum Lernen brauchst",
  description:
    "Lerninhalte, Karteikarten, Quizze, Fortschritt und ein KI-Lernassistent – alles an einem Ort.",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Lernio",
  },
  icons: {
    icon: [{ url: "/favicon-32.png", sizes: "32x32", type: "image/png" }],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
  },
  other: {
    "mobile-web-app-capable": "yes",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#4f46e5",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();

  return (
    <html lang="de">
      <body className="font-sans antialiased">
        <div className="flex min-h-screen">
          <Sidebar loggedIn={!!user} name={user?.name} xp={user?.xp} streak={user?.streak} />

          <div className="flex-1 min-w-0 flex flex-col">
            <header
              className="lg:hidden flex items-center justify-between px-4 pb-3 border-b border-gray-100 bg-white sticky top-0 z-30"
              style={{ paddingTop: "calc(env(safe-area-inset-top) + 0.75rem)" }}
            >
              <Link href="/" className="flex items-center gap-2">
                <span className="text-xl">🎓</span>
                <span className="text-lg font-extrabold text-brand-700">Lernio</span>
              </Link>
              <div className="flex items-center gap-2">
                <Link href="/suche" className="p-2 rounded-full hover:bg-gray-100 text-lg" aria-label="Suche">
                  🔍
                </Link>
                {user ? (
                  <Link
                    href="/profil"
                    className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-600 text-white font-bold text-sm"
                  >
                    {user.name[0]?.toUpperCase()}
                  </Link>
                ) : (
                  <Link
                    href="/login"
                    className="rounded-full bg-brand-600 px-3 py-1.5 text-sm font-semibold text-white"
                  >
                    Login
                  </Link>
                )}
              </div>
            </header>

            <main className="flex-1 pb-20 lg:pb-0">{children}</main>
          </div>
        </div>
        <BottomNav />
        <InstallPrompt />
        <PwaBoot />
      </body>
    </html>
  );
}
