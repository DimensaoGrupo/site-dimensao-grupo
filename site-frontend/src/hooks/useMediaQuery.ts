"use client";

import { useSyncExternalStore } from "react";

/**
 * Tracks a CSS media query. Mirrors how Motion's own `useReducedMotion`
 * behaves: the client's first render already reflects the real value (the
 * server has no `window`, so SSR always sees `false`) — the same
 * server/client trade-off already accepted project-wide for
 * `prefers-reduced-motion`. Fine for gating *animation behavior*; never use
 * it to branch which elements get rendered, since that class of mismatch
 * (a different tree, not just a different style value) does trip a real
 * hydration error.
 */
export function useMediaQuery(query: string): boolean {
  return useSyncExternalStore(
    (onChange) => {
      const mql = window.matchMedia(query);
      mql.addEventListener("change", onChange);
      return () => mql.removeEventListener("change", onChange);
    },
    () => window.matchMedia(query).matches,
    () => false,
  );
}
