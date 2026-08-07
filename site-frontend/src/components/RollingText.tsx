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

/**
 * Rolling-text label: on `active`, each character slides up and is replaced
 * by a stacked duplicate underneath, staggered per character. Purely
 * `translateY`-driven (no width/height change), so it never affects layout.
 *
 * The real text is exposed once via a visually-hidden node; the animated
 * characters are `aria-hidden`, so screen readers read the label exactly
 * once regardless of how many times it's visually duplicated.
 */
export default function RollingText({
  text,
  active,
  className = "",
  stagger = 0.025,
}: RollingTextProps) {
  const prefersReducedMotion = useReducedMotion();

  if (prefersReducedMotion) {
    return <span className={className}>{text}</span>;
  }

  const characters = Array.from(text);

  return (
    <span className={className}>
      <span className="sr-only">{text}</span>
      <span aria-hidden="true" className="inline-flex">
        {characters.map((char, i) => {
          // A literal space inside an inline-block/flex box can collapse to
          // zero width in some browsers — nbsp keeps it real.
          const glyph = char === " " ? " " : char;
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
                transition={{ duration: 0.5, ease: EASE, delay: i * stagger }}
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
