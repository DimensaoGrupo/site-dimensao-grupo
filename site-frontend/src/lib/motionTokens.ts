/**
 * Shared motion constants for GSAP and Motion — the two animation
 * libraries already in use in this project (see docs/DESIGN_SYSTEM_PLAN.md
 * §7). This is not a third animation solution: it holds no animation
 * logic of its own, only the numeric/config values GSAP and Motion call
 * sites should both read from instead of recalibrating similar-but-not-
 * identical numbers per component (the real inconsistency documented in
 * the plan — duration 0.6/0.7/0.8, offset y 20/24/28/32/36, three
 * near-identical Motion spring presets, etc.).
 *
 * The CSS-representable half of this system (durations, easing curves as
 * cubic-bezier()) lives in src/app/globals.css as --motion-* custom
 * properties; the values here are the same numbers, exposed as JS/TS so
 * GSAP tweens and Motion's `transition`/`variants` props (which take
 * numbers and objects, not CSS custom properties) can use them directly.
 */

/** Seconds — matches --motion-duration-* in globals.css. */
export const MOTION_DURATION = {
  fast: 0.2,
  base: 0.6,
  slow: 1,
} as const;

/**
 * GSAP understands these as named ease strings directly — no conversion
 * needed. Motion/CSS use the cubic-bezier approximations in globals.css
 * (--motion-ease-out / --motion-ease-out-strong) instead, since Motion
 * doesn't recognize GSAP's ease names.
 */
export const GSAP_EASE = {
  out: "power2.out",
  outStrong: "power3.out",
} as const;

/** [x1, y1, x2, y2] — same curves as --motion-ease-out(-strong) in globals.css, for Motion's `transition.ease`. */
export const MOTION_EASE = {
  out: [0.215, 0.61, 0.355, 1] as const,
  outStrong: [0.165, 0.84, 0.44, 1] as const,
};

/** Pixels — initial offset for a scroll-triggered reveal, before animating to 0. */
export const MOTION_OFFSET = {
  /** Text, small UI elements. */
  sm: 20,
  /** Cards, images, large blocks. */
  lg: 36,
} as const;

/** Seconds — per-item delay step for staggered reveals (GSAP `stagger` / Motion `staggerChildren`). */
export const MOTION_STAGGER = 0.1;

/**
 * Consolidates the 3 near-identical Motion spring presets found across the
 * codebase ({stiffness:300,damping:22}, {stiffness:350,damping:18},
 * {stiffness:400,damping:20}) into one. Use for hover/tap micro-interaction
 * springs (card lift, icon bounce, button press) unless a specific
 * component has a proven reason to diverge.
 */
export const MOTION_SPRING_DEFAULT = {
  type: "spring",
  stiffness: 350,
  damping: 20,
} as const;
