"use client";

import { useSyncExternalStore, useCallback } from "react";

// Theme is stored in two places:
//   1. The `dark` class on <html> — applied synchronously by the bootstrap
//      script in app/layout.tsx before React hydrates.
//   2. localStorage["template-theme"] — persisted across reloads.
//
// `useSyncExternalStore` is the React-19 idiomatic way to read state that
// lives outside React (the DOM, in this case). It avoids the
// `react-hooks/set-state-in-effect` lint warning we'd hit with useEffect+setState.

const STORAGE_KEY = "template-theme";

const subscribers = new Set<() => void>();

function subscribe(callback: () => void) {
  subscribers.add(callback);
  return () => {
    subscribers.delete(callback);
  };
}

function getSnapshot() {
  return document.documentElement.classList.contains("dark");
}

function getServerSnapshot() {
  // SSR: render light by default. The bootstrap script in <head> rewrites
  // the class before hydration, and `suppressHydrationWarning` on <html>
  // tolerates the (intentional) mismatch.
  return false;
}

export function useTheme() {
  const dark = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const toggle = useCallback(() => {
    const next = !document.documentElement.classList.contains("dark");
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem(STORAGE_KEY, next ? "dark" : "light");
    subscribers.forEach((fn) => fn());
  }, []);

  return { dark, toggle };
}
