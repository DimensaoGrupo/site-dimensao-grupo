import { useId } from "react";
import { CHEVRON_POLYGONS, SYMBOL_VIEWBOX, shadowOffset } from "./decorative/symbol";

export type SymbolBackgroundPosition = "right" | "left" | "center" | "bottom";

type SymbolBackgroundProps = {
  /** Where the (mostly off-canvas) symbol is anchored. Default "right". */
  position?: SymbolBackgroundPosition;
  /** 0–1. This is a watermark, not a graphic element — keep it small. Default 0.05. */
  opacity?: number;
  className?: string;
};

// Height as a % of the section (the symbol's own aspect ratio, ~220:190,
// fixes the width). Anchored to a corner — not vertically/horizontally
// centered across the section — so it reads as a mark tucked into one
// corner, not a band spanning the whole composition. Scales down on smaller
// viewports both in reach (how far it bleeds past the section) and in
// absolute size.
const POSITION_CLASS: Record<SymbolBackgroundPosition, string> = {
  right: "h-[70%] top-[6%] -right-[10%] md:h-[85%] md:top-[8%] md:-right-[7%] lg:h-[100%] lg:-right-[5%]",
  left: "h-[70%] bottom-[6%] -left-[10%] md:h-[85%] md:bottom-[8%] md:-left-[7%] lg:h-[100%] lg:-left-[5%] -scale-x-100",
  center: "h-[80%] left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 md:h-[95%] lg:h-[115%]",
  bottom: "h-[65%] -bottom-[12%] left-[6%] md:h-[80%] md:left-[8%] lg:h-[95%]",
};

/**
 * A single huge, faint reproduction of the company mark's chevron stack,
 * used as a watermark behind sparse light/white sections — never a
 * decorative "effect," just brand texture folded into the background. Host
 * section needs `relative overflow-hidden`; its content wrapper needs
 * `relative z-10`.
 */
export default function SymbolBackground({
  position = "right",
  opacity = 0.05,
  className = "",
}: SymbolBackgroundProps) {
  const gradientId = `symbol-gradient-${useId()}`;

  return (
    <div aria-hidden="true" className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}>
      <svg
        viewBox={SYMBOL_VIEWBOX}
        preserveAspectRatio="xMidYMid meet"
        className={`absolute aspect-[220/190] w-auto ${POSITION_CLASS[position]}`}
        style={{ opacity }}
      >
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--color-gray-light)" />
            <stop offset="50%" stopColor="var(--color-gray-medium)" />
            <stop offset="72%" stopColor="var(--color-primary-dark)" />
            <stop offset="100%" stopColor="var(--color-primary)" />
          </linearGradient>
        </defs>
        {CHEVRON_POLYGONS.map((points, i) => (
          <g key={i}>
            <polygon points={shadowOffset(points)} fill="var(--foreground)" opacity={0.3} />
            <polygon points={points} fill={`url(#${gradientId})`} />
          </g>
        ))}
      </svg>
    </div>
  );
}
