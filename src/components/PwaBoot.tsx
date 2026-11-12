"use client";

import { useEffect } from "react";

export function PwaBoot() {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {
        // Non-critical: the app still works fully online without the SW.
      });
    }
  }, []);

  return null;
}
