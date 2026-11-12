"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV = [
  { href: "/", label: "Start", icon: "🏠" },
  { href: "/faecher", label: "Fächer", icon: "📚" },
  { href: "/karteikarten", label: "Karten", icon: "📇" },
  { href: "/quiz", label: "Quiz", icon: "✅" },
  { href: "/assistent", label: "KI", icon: "✨" },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 border-t border-gray-100 bg-white/95 backdrop-blur px-1 pb-[env(safe-area-inset-bottom)]">
      <div className="flex items-stretch justify-between">
        {NAV.map((item) => {
          const active = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex-1 flex flex-col items-center gap-0.5 py-2 text-[11px] font-medium ${
                active ? "text-brand-600" : "text-gray-500"
              }`}
            >
              <span className="text-lg leading-none">{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
