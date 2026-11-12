"use client";

import { useEffect, useState } from "react";

const DISMISS_KEY = "lernio_install_hint_dismissed_at";
const DISMISS_DAYS = 14;

export function InstallPrompt() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      const ua = window.navigator.userAgent;
      const isIos = /iphone|ipad|ipod/i.test(ua);
      const isStandalone =
        (window.navigator as unknown as { standalone?: boolean }).standalone === true ||
        window.matchMedia("(display-mode: standalone)").matches;

      if (!isIos || isStandalone) return;

      const dismissedAt = window.localStorage.getItem(DISMISS_KEY);
      if (dismissedAt) {
        const daysSince = (Date.now() - Number(dismissedAt)) / (1000 * 60 * 60 * 24);
        if (daysSince < DISMISS_DAYS) return;
      }

      const timer = setTimeout(() => setVisible(true), 1500);
      return () => clearTimeout(timer);
    } catch {
      // localStorage unavailable (private mode etc.) – just skip the hint.
    }
  }, []);

  function dismiss() {
    setVisible(false);
    try {
      window.localStorage.setItem(DISMISS_KEY, String(Date.now()));
    } catch {
      // ignore
    }
  }

  if (!visible) return null;

  return (
    <div
      className="fixed left-3 right-3 z-50 lg:hidden rounded-2xl bg-gray-900 text-white shadow-lg px-4 py-3 flex items-start gap-3"
      style={{ bottom: "calc(4.75rem + env(safe-area-inset-bottom))" }}
    >
      <span className="text-xl shrink-0">📲</span>
      <p className="text-xs leading-relaxed flex-1">
        Installiere Lernio als App: Tippe unten auf{" "}
        <span className="font-semibold">Teilen</span> (
        <span aria-hidden>⬆️</span>) und dann auf{" "}
        <span className="font-semibold">„Zum Home-Bildschirm"</span>.
      </p>
      <button onClick={dismiss} aria-label="Schließen" className="text-white/60 hover:text-white text-sm shrink-0">
        ✕
      </button>
    </div>
  );
}
