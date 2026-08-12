type SectionAmbianceProps = {
  /** Optional short color-fade at the top edge, echoing the previous section's tone to soften the seam. */
  topFadeFrom?: string;
};

/**
 * Faint 64px grid, masked to fade out toward the bottom. Purely static,
 * placed behind section content (host section needs `relative overflow-hidden`,
 * its content wrapper needs `relative z-10`).
 *
 * An earlier version of this also added large `blur-3xl` color blobs —
 * removed because even at very low opacity a large blurred shape reads as a
 * visible smudge on plain white, not depth.
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
          maskImage: "linear-gradient(to bottom, black, transparent 90%)",
          WebkitMaskImage: "linear-gradient(to bottom, black, transparent 90%)",
        }}
      />
    </div>
  );
}
