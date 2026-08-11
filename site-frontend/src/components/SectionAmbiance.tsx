type SectionAmbianceProps = {
  /**
   * Echoes the previous section's tone as a soft fade at the very top, so
   * the hard color change at the seam reads as a transition rather than a
   * cut. Omit for a section that isn't preceded by a different background.
   */
  topFadeFrom?: string;
};

/**
 * Purely decorative depth for otherwise-flat light sections: a faint grid
 * (echoing the same grid already used in the hero/placeholder art, so it's
 * not a new visual language). Deliberately just the grid — an earlier
 * version also added blurred color blobs in the corners, but even at very
 * low opacity a large `blur-3xl` shape reads as a visible smudge on plain
 * white, which is exactly the "competing with content" this is supposed to
 * avoid. Everything here is static CSS — no animation, no scroll listener —
 * so it's close to free performance-wise. The host section needs
 * `relative overflow-hidden`, and its content wrapper needs `relative
 * z-10` so it stacks above this.
 */
export default function SectionAmbiance({ topFadeFrom }: SectionAmbianceProps) {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
      {topFadeFrom && (
        <div
          className="absolute inset-x-0 top-0 h-24 md:h-32"
          style={{ background: `linear-gradient(to bottom, ${topFadeFrom}, transparent)` }}
        />
      )}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            "linear-gradient(to right, rgba(32,26,26,0.025) 1px, transparent 1px), linear-gradient(to bottom, rgba(32,26,26,0.025) 1px, transparent 1px)",
          backgroundSize: "64px 64px",
          maskImage:
            "linear-gradient(to bottom, black, transparent 90%)",
          WebkitMaskImage:
            "linear-gradient(to bottom, black, transparent 90%)",
        }}
      />
    </div>
  );
}
