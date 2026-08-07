"use client";

import { useEffect, useRef, useState, type RefObject } from "react";
import {
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  type MotionValue,
} from "motion/react";

type FooterReveal = {
  /** Attach to the fixed, visible footer layer — also measured for spacer height. */
  footerRef: RefObject<HTMLElement | null>;
  /** Attach to the in-flow placeholder that reserves scroll room for the reveal. */
  spacerRef: RefObject<HTMLDivElement | null>;
  /** Height (px) the spacer should take on, mirroring the real footer's rendered height. */
  spacerHeight: number;
  opacity: MotionValue<number>;
  y: MotionValue<number>;
  pointerEvents: MotionValue<"auto" | "none">;
  /** True while a descendant of the footer holds keyboard focus. */
  isFocusRevealed: boolean;
  prefersReducedMotion: boolean;
};

/**
 * Drives the "footer reveal": the footer is rendered as a fixed layer at the
 * bottom of the viewport, hidden behind the page until scroll uncovers it.
 * An in-flow spacer (sized to the footer's own height) gives the document
 * the extra scroll room the fixed footer doesn't naturally occupy.
 *
 * A fixed layer keeps its box even while invisible, so it can still receive
 * focus/clicks out of view — pointerEvents is gated on reveal progress, and
 * focus inside the footer forces it visible so keyboard users always see
 * what they've focused.
 */
export function useFooterReveal(): FooterReveal {
  const footerRef = useRef<HTMLElement | null>(null);
  const spacerRef = useRef<HTMLDivElement | null>(null);
  const [spacerHeight, setSpacerHeight] = useState(0);
  const [isFocusRevealed, setIsFocusRevealed] = useState(false);
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    const node = footerRef.current;
    if (!node) return undefined;

    const updateHeight = () => setSpacerHeight(node.offsetHeight);
    updateHeight();

    const observer = new ResizeObserver(updateHeight);
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const node = footerRef.current;
    if (!node) return undefined;

    const onFocusIn = () => setIsFocusRevealed(true);
    const onFocusOut = (event: FocusEvent) => {
      if (!node.contains(event.relatedTarget as Node | null)) {
        setIsFocusRevealed(false);
      }
    };

    node.addEventListener("focusin", onFocusIn);
    node.addEventListener("focusout", onFocusOut);
    return () => {
      node.removeEventListener("focusin", onFocusIn);
      node.removeEventListener("focusout", onFocusOut);
    };
  }, []);

  const { scrollYProgress } = useScroll({
    target: spacerRef,
    offset: ["start end", "end end"],
  });

  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 300,
    damping: 42,
    mass: 0.3,
  });

  const opacity = useTransform(
    smoothProgress,
    [0, 1],
    prefersReducedMotion ? [1, 1] : [0, 1],
  );
  const y = useTransform(
    smoothProgress,
    [0, 1],
    prefersReducedMotion ? [0, 0] : [40, 0],
  );
  const pointerEvents = useTransform(smoothProgress, (value) =>
    value > 0.05 || prefersReducedMotion ? "auto" : "none",
  );

  return {
    footerRef,
    spacerRef,
    spacerHeight,
    opacity,
    y,
    pointerEvents,
    isFocusRevealed,
    prefersReducedMotion: Boolean(prefersReducedMotion),
  };
}
