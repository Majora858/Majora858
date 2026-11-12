"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV = [
  { href: "/", label: "Start", icon: "🏠" },
  { href: "/faecher", label: "Fächer", icon: "📚" },
  { href: "/karteikarten", label: "Karteikarten", icon: "📇" },
  { href: "/quiz", label: "Quiz", icon: "✅" },
  { href: "/assistent", label: "KI-Assistent", icon: "✨" },
  { href: "/suche", label: "Suche", icon: "🔍" },
];

export function Sidebar({
  loggedIn,
  name,
  xp,
  streak,
}: {
  loggedIn: boolean;
  name?: string;
  xp?: number;
  streak?: number;
}) {
  const pathname = usePathname();

  return (
    <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:shrink-0 border-r border-gray-100 bg-white h-screen sticky top-0">
      <Link href="/" className="flex items-center gap-2 px-6 py-5">
        <span className="text-2xl">🎓</span>
        <span className="text-xl font-extrabold text-brand-700 tracking-tight">Lernio</span>
      </Link>

      <nav className="flex-1 px-3 space-y-1">
        {NAV.map((item) => {
          const active = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                active ? "bg-brand-50 text-brand-700" : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              }`}
            >
              <span className="text-lg">{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="px-3 pb-5">
        {loggedIn ? (
          <Link
            href="/profil"
            className="flex items-center gap-3 rounded-xl px-3 py-3 bg-gray-50 hover:bg-gray-100 transition-colors"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-600 text-white font-bold text-sm">
              {name?.[0]?.toUpperCase() ?? "?"}
            </span>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900 truncate">{name}</p>
              <p className="text-xs text-gray-500">🔥 {streak ?? 0} Tage · {xp ?? 0} XP</p>
            </div>
          </Link>
        ) : (
          <div className="space-y-2">
            <Link
              href="/login"
              className="block text-center rounded-xl border border-gray-200 px-3 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50"
            >
              Anmelden
            </Link>
            <Link
              href="/registrieren"
              className="block text-center rounded-xl bg-brand-600 px-3 py-2.5 text-sm font-semibold text-white hover:bg-brand-700"
            >
              Kostenlos starten
            </Link>
          </div>
        )}
      </div>
    </aside>
  );
}
