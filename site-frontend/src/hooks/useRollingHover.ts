"use client";

import { useEffect, useRef, useState } from "react";

type RollingHoverHandlers = {
  onMouseEnter: () => void;
  onMouseLeave: () => void;
  onFocus: () => void;
  onBlur: () => void;
  onTouchStart: () => void;
};

type UseRollingHoverResult = {
  active: boolean;
  /** Spread onto the interactive element (button/anchor) driving a `RollingText`. */
  handlers: RollingHoverHandlers;
};

/**
 * Tracks the hover/focus/touch state for a `RollingText` label, so the
 * activation logic isn't re-implemented at every call site. Touch has no
 * hover-out signal, so a tap activates the roll for a beat and releases on
 * its own instead of sticking on.
 */
export function useRollingHover(tapDurationMs = 900): UseRollingHoverResult {
  const [active, setActive] = useState(false);
  const tapTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (tapTimeoutRef.current) clearTimeout(tapTimeoutRef.current);
    };
  }, []);

  return {
    active,
    handlers: {
      onMouseEnter: () => setActive(true),
      onMouseLeave: () => setActive(false),
      onFocus: () => setActive(true),
      onBlur: () => setActive(false),
      onTouchStart: () => {
        setActive(true);
        if (tapTimeoutRef.current) clearTimeout(tapTimeoutRef.current);
        tapTimeoutRef.current = setTimeout(() => setActive(false), tapDurationMs);
      },
    },
  };
}
