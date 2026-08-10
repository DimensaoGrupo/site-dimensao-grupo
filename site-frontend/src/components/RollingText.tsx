"use client";

import { motion, useReducedMotion } from "motion/react";

type RollingTextProps = {
  text: string;
  /** Drives the roll — true rolls the duplicate copy into view. */
  active: boolean;
  className?: string;
  /** Per-character delay step, in seconds. */
  stagger?: number;
};

const EASE: [number, number, number, number] = [0.76, 0, 0.24, 1];
// Non-breaking space, spelled out via charCode rather than a literal
// character in the source — a raw NBSP here has twice already been
// silently normalized back to a regular space by tooling (formatter/IDE),
// which collapses it to zero width and runs words together.
const NBSP = String.fromCharCode(160);

/**
 * Rolling-text label: on `active`, each character slides up and is replaced
 * by a stacked duplicate underneath, staggered per character. Purely
 * `translateY`-driven (no width/height change), so it never affects layout.
 *
 * The real text is exposed once via a visually-hidden node; the animated
 * characters are `aria-hidden`, so screen readers read the label exactly
 * once regardless of how many times it's visually duplicated.
 *
 * The DOM structure is identical regardless of `prefers-reduced-motion` —
 * `useReducedMotion()` can't resolve to the same value on the server as on
 * the client, so branching the *tree shape* on it (e.g. returning a plain
 * `<span>` instead) causes a hydration mismatch. Reduced motion only zeroes
 * the transition duration, which is safe: it's consumed by Motion at
 * runtime, not reflected in the server-rendered markup.
 */
export default function RollingText({
  text,
  active,
  className = "",
  stagger = 0.025,
}: RollingTextProps) {
  const prefersReducedMotion = useReducedMotion();
  const characters = Array.from(text);

  return (
    <span className={className}>
      <span className="sr-only">{text}</span>
      <span aria-hidden="true" className="inline-flex">
        {characters.map((char, i) => {
          const glyph = char === String.fromCharCode(32) ? NBSP : char;
          return (
            <span
              key={i}
              className="relative inline-block h-[1em] overflow-hidden align-top"
            >
              <motion.span
                className="flex flex-col"
                initial={false}
                animate={active ? "active" : "rest"}
                variants={{ rest: { y: "0%" }, active: { y: "-50%" } }}
                transition={{
                  duration: prefersReducedMotion ? 0 : 0.5,
                  ease: EASE,
                  delay: prefersReducedMotion ? 0 : i * stagger,
                }}
              >
                <span className="block leading-none">{glyph}</span>
                <span className="block leading-none">{glyph}</span>
              </motion.span>
            </span>
          );
        })}
      </span>
    </span>
  );
}
