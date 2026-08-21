import type { ReactNode } from "react";

type CardBackground = "surface" | "surface-alt";

type CardProps = {
  children: ReactNode;
  /**
   * "surface" (white) or "surface-alt" (#f7f6f6) — matches the two card
   * backgrounds already in use (ServicesSection/ServiceBenefits use
   * "surface"; ServiceAudience uses "surface-alt").
   */
  background?: CardBackground;
  /**
   * Adds the branded shadow-accent on hover, for cards that are links
   * (ServicesSection today). ServiceBenefits/ServiceAudience cards aren't
   * links, so they'd leave this off.
   */
  hoverShadow?: boolean;
  className?: string;
};

const BACKGROUND_CLASS: Record<CardBackground, string> = {
  surface: "bg-surface",
  "surface-alt": "bg-surface-alt",
};

/**
 * Formalizes the card pattern already repeated, with the same
 * border/radius/padding, in ServicesSection, ServiceBenefits and
 * ServiceAudience — see docs/DESIGN_SYSTEM_PLAN.md §6. A plain
 * presentational wrapper (no client-only behavior of its own), so it stays
 * usable from Server Components; any hover/drag motion is layered around
 * it by the caller (e.g. ServicesSection's motion.div), not owned by Card.
 *
 * Not yet adopted at any of those three call sites — Fase 1 only
 * introduces the primitive. Adoption happens when each consumer is next
 * touched for its own reason (see plan §11), not as a dedicated sweep.
 */
export default function Card({
  children,
  background = "surface",
  hoverShadow = false,
  className = "",
}: CardProps) {
  const classes = [
    "rounded-card border border-border/70 p-[var(--space-card-padding)]",
    BACKGROUND_CLASS[background],
    hoverShadow ? "transition-shadow duration-300 hover:shadow-accent" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return <div className={classes}>{children}</div>;
}
