"use client";

import RollingText from "../RollingText";
import { useRollingHover } from "@/hooks/useRollingHover";

type CtaLinkSize = "sm" | "lg";

type CtaLinkProps = {
  href: string;
  label: string;
  size?: CtaLinkSize;
  className?: string;
  target?: string;
  rel?: string;
};

const SIZE_CLASS: Record<CtaLinkSize, string> = {
  // Matches Header's current CTA padding (no leading icon/gap).
  sm: "px-5 py-2.5",
  // Matches CtaBand/ServiceHero's current CTA padding (inline-flex + gap,
  // room for a leading/trailing icon).
  lg: "inline-flex items-center gap-2 px-7 py-3.5",
};

/**
 * Consolidates the rolling-text CTA pill pattern already repeated 4x
 * (Header desktop, Header mobile, CtaBand, ServiceHero) — see
 * docs/DESIGN_SYSTEM_PLAN.md §6. A plain `<a>` (not next/link): all 4
 * existing call sites point at the same-page "#contato" anchor, not an
 * internal route, matching their current markup exactly.
 *
 * `size` captures the one real difference found between the 4 existing
 * call sites (Header uses smaller padding with no icon gap; CtaBand/
 * ServiceHero use larger padding with an icon gap) — not a speculative
 * variant invented ahead of need.
 *
 * Not yet adopted at any of those 4 call sites — each keeps its current
 * markup until its own redesign phase touches it (Fase 2 for Header, etc.
 * — see plan §11).
 */
export default function CtaLink({
  href,
  label,
  size = "lg",
  className = "",
  target,
  rel,
}: CtaLinkProps) {
  const cta = useRollingHover();

  const classes = [
    "rounded-pill bg-accent text-sm font-semibold text-white transition-colors duration-200 hover:bg-accent-strong",
    SIZE_CLASS[size],
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <a href={href} target={target} rel={rel} className={classes} {...cta.handlers}>
      <RollingText text={label} active={cta.active} />
    </a>
  );
}
