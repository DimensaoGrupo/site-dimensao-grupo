"use client";

import { useCallback, useEffect, useRef, useState, type FocusEvent } from "react";
import {
  animate,
  useMotionValue,
  useReducedMotion,
  type MotionValue,
} from "motion/react";

type UseCarouselAutoplayOptions = {
  slideCount: number;
  /** Time each slide gets before advancing, in ms. */
  durationMs?: number;
};

type UseCarouselAutoplayResult = {
  index: number;
  /** 0→1 across the current slide's dwell time; drives the progress indicator. */
  progress: MotionValue<number>;
  goTo: (index: number) => void;
  next: () => void;
  prev: () => void;
  isReducedMotion: boolean;
  /** Spread onto the interactive surface to pause autoplay while engaged. */
  interactionHandlers: {
    onFocus: (event: FocusEvent<HTMLElement>) => void;
    onBlur: () => void;
    onDragStart: () => void;
    onDragEnd: () => void;
  };
};

/**
 * Drives autoplay + a synced progress value for a slide carousel: a linear
 * `animate()` call carries `progress` from its current value to 1 over the
 * remaining dwell time, advancing the slide on natural completion. Pausing
 * (keyboard focus/drag — deliberately *not* mouse hover) just stops that
 * animation — `progress` freezes in place — and resuming continues from
 * there rather than restarting, so the bar never jumps. Manual navigation
 * (`goTo`/`next`/`prev`) always resets progress to 0, giving the new slide a
 * full dwell time.
 */
export function useCarouselAutoplay({
  slideCount,
  durationMs = 6500,
}: UseCarouselAutoplayOptions): UseCarouselAutoplayResult {
  const [index, setIndex] = useState(0);
  const progress = useMotionValue(0);
  const isReducedMotion = Boolean(useReducedMotion());

  const [isFocused, setIsFocused] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const isPaused = isReducedMotion || isFocused || isDragging;

  // The animation driving `progress` keeps ticking on its own rAF loop even
  // after `goTo` resets the value — React doesn't run the effect's cleanup
  // until the next render commits, which is one frame too late. Stopping it
  // here, synchronously, is what actually prevents that stale tween from
  // overwriting the reset a moment later.
  const controlsRef = useRef<ReturnType<typeof animate> | null>(null);

  const goTo = useCallback(
    (nextIndex: number) => {
      const normalized = ((nextIndex % slideCount) + slideCount) % slideCount;
      // Selecting the slide that's already active must be a no-op: stopping
      // the running tween here wouldn't be followed by a restart, since
      // `index` isn't actually changing — that's what wedges the carousel.
      if (normalized === index) return;
      controlsRef.current?.stop();
      progress.set(0);
      setIndex(normalized);
    },
    [slideCount, progress, index],
  );

  const next = useCallback(() => goTo(index + 1), [goTo, index]);
  const prev = useCallback(() => goTo(index - 1), [goTo, index]);

  useEffect(() => {
    if (isPaused) return undefined;

    const remaining = 1 - progress.get();
    if (remaining <= 0) return undefined;

    const controls = animate(progress, 1, {
      duration: (durationMs / 1000) * remaining,
      ease: "linear",
      onComplete: () => {
        controlsRef.current = null;
        progress.set(0);
        setIndex((i) => (i + 1) % slideCount);
      },
    });
    controlsRef.current = controls;

    return () => {
      controls.stop();
      if (controlsRef.current === controls) controlsRef.current = null;
    };
  }, [isPaused, index, slideCount, durationMs, progress]);

  // Safety net: a drag/touch gesture that ends off-element (pointer capture
  // lost mid-swipe, browser edge-gesture stealing the pointer, tab/app
  // switch mid-press) can skip Motion's onDragEnd, leaving autoplay paused
  // forever. Clearing on the raw, always-fired window pointer/blur events
  // guarantees it can't wedge.
  useEffect(() => {
    const clearAll = () => {
      setIsFocused(false);
      setIsDragging(false);
    };
    const clearDragging = () => setIsDragging(false);

    window.addEventListener("blur", clearAll);
    window.addEventListener("pointerup", clearDragging);
    window.addEventListener("pointercancel", clearDragging);
    return () => {
      window.removeEventListener("blur", clearAll);
      window.removeEventListener("pointerup", clearDragging);
      window.removeEventListener("pointercancel", clearDragging);
    };
  }, []);

  return {
    index,
    progress,
    goTo,
    next,
    prev,
    isReducedMotion,
    interactionHandlers: {
      // Only pause for keyboard focus. A mouse click (e.g. the CTA link)
      // also sets DOM focus, but :focus-visible excludes that — otherwise
      // focus lingering on a clicked link (even after scrolling away) would
      // pause autoplay indefinitely, since nothing else ever re-focuses.
      onFocus: (event) => {
        if (event.target.matches(":focus-visible")) {
          setIsFocused(true);
        }
      },
      onBlur: () => setIsFocused(false),
      onDragStart: () => setIsDragging(true),
      onDragEnd: () => setIsDragging(false),
    },
  };
}
