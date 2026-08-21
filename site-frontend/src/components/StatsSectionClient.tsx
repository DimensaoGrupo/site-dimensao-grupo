"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "@/lib/gsap";
import SectionAmbiance from "./SectionAmbiance";
import { MOTION_DURATION, MOTION_OFFSET, GSAP_EASE } from "@/lib/motionTokens";

export type StatItem = {
  id: number;
  value: number;
  prefix: string | null;
  suffix: string | null;
  label: string;
};

// The featured slot is either the real SP+MS "cidades atendidas" composite
// or (fallback, when geography data isn't fully available) an ordinary
// statistic — the two need different rendering (geography has its own
// "(SP x · MS y)" caption, not a CMS-editable label).
export type FeaturedStat = ({ kind: "geography"; total: number; spValue: number; msValue: number }) | ({ kind: "stat" } & StatItem);

type StatsSectionClientProps = {
  featured: FeaturedStat;
  secondary: StatItem[];
};

const COUNT_DURATION = 1.6;

export default function StatsSectionClient({ featured, secondary }: StatsSectionClientProps) {
  const rootRef = useRef<HTMLElement>(null);
  // Keyed by a stable string ("featured" / "secondary-<id>") instead of
  // array position — a plain array index would silently mis-map refs to
  // values if the CMS ordering changes between renders.
  const counterRefs = useRef<Map<string, HTMLSpanElement | null>>(new Map());
  const featuredValue = featured.kind === "geography" ? featured.total : featured.value;
  const featuredDepKey = featured.kind === "geography" ? "geography" : featured.id;

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.fromTo(
          ".stat-block",
          { y: MOTION_OFFSET.lg, autoAlpha: 0 },
          {
            y: 0,
            autoAlpha: 1,
            duration: MOTION_DURATION.base,
            ease: GSAP_EASE.out,
            stagger: 0.12,
            scrollTrigger: { trigger: rootRef.current, start: "top 78%" },
          },
        );

        const targets: { key: string; value: number }[] = [
          { key: "featured", value: featuredValue },
          ...secondary.map((s) => ({ key: `secondary-${s.id}`, value: s.value })),
        ];

        targets.forEach(({ key, value }) => {
          const el = counterRefs.current.get(key);
          if (!el) return;
          const counter = { value: 0 };
          gsap.to(counter, {
            value,
            duration: COUNT_DURATION,
            ease: "power2.out",
            scrollTrigger: { trigger: rootRef.current, start: "top 78%" },
            onUpdate: () => {
              el.textContent = String(Math.round(counter.value));
            },
          });
        });
      });

      // Reduced motion: nothing to animate — the DOM already renders each
      // stat's real final value server-side (never "0"), so skipping the
      // reveal/counter entirely still leaves fully correct, readable content.
      mm.add("(prefers-reduced-motion: reduce)", () => {
        gsap.set(".stat-block", { y: 0, autoAlpha: 1 });
      });

      return () => mm.revert();
    },
    { scope: rootRef, dependencies: [featuredDepKey, secondary.map((s) => s.id).join(",")] },
  );

  return (
    // Custom (tighter) vertical padding instead of the shared --section-y
    // token — this is a compact "credibility strip" between two full
    // sections, not a full section in its own right, so it deliberately
    // doesn't use the same padding scale as content sections. Only touches
    // this component, not the shared token.
    <section className="relative overflow-hidden bg-surface-alt py-10 md:py-12 lg:py-14" ref={rootRef}>
      <SectionAmbiance topFadeFrom="rgba(32,26,26,0.03)" />
      <div className="container-page relative z-10">
        <span className="stat-block block text-xs font-bold tracking-[0.2em] text-primary uppercase">
          Escala
        </span>

        {/* One horizontal strip on desktop instead of a featured-left /
            stacked-right split — all four indicators now share the same
            size (text-heading-lg) so none reads as more important than the
            others, bottom-aligned so labels line up evenly. Below lg it
            falls back to a simple stacked column (tablet/mobile), never the
            old asymmetric two-column layout. */}
        <div className="mt-5 flex flex-col gap-y-6 md:mt-6 lg:flex-row lg:flex-wrap lg:items-end lg:justify-between lg:gap-x-10 lg:gap-y-6">
          <h2 className="stat-block">
            <span className="block font-display text-heading-lg font-bold text-foreground">
              {featured.kind === "stat" && featured.prefix}
              <span
                ref={(el) => {
                  counterRefs.current.set("featured", el);
                }}
              >
                {featuredValue}
              </span>
              {featured.kind === "stat" && featured.suffix}
            </span>
            <span className="mt-1.5 block text-sm text-gray-medium">
              {featured.kind === "geography" ? (
                <>
                  Cidades atendidas{" "}
                  <span className="text-gray-medium/70">
                    (SP {featured.spValue} · MS {featured.msValue})
                  </span>
                </>
              ) : (
                featured.label
              )}
            </span>
          </h2>

          {/* lg:contents lifts these into direct flex children of the row
              above (rather than a nested flex-1 sub-group) so the outer
              justify-between spaces all four indicators evenly across the
              full width — the previous nested-group approach left the extra
              width parked entirely after the last item instead of
              distributed between all of them. */}
          <div className="grid grid-cols-2 gap-x-8 gap-y-6 sm:grid-cols-3 lg:contents">
            {secondary.map((stat) => (
              <div key={stat.id} className="stat-block">
                <span className="block font-display text-heading-lg font-bold text-foreground">
                  {stat.prefix}
                  <span
                    ref={(el) => {
                      counterRefs.current.set(`secondary-${stat.id}`, el);
                    }}
                  >
                    {stat.value}
                  </span>
                  {stat.suffix}
                </span>
                <span className="mt-1.5 block text-sm text-gray-medium">{stat.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
