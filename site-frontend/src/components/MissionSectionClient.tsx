"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "@/lib/gsap";
import SectionHeading from "./SectionHeading";

type MissionSectionClientProps = {
  eyebrow: string | null;
  title: string;
  quote: string;
};

export default function MissionSectionClient({ eyebrow, title, quote }: MissionSectionClientProps) {
  const rootRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.fromTo(
          rootRef.current,
          { backgroundPosition: "50% 42%" },
          {
            backgroundPosition: "50% 58%",
            ease: "none",
            scrollTrigger: {
              trigger: rootRef.current,
              start: "top bottom",
              end: "bottom top",
              scrub: true,
            },
          },
        );
        gsap.fromTo(
          ".mission-quote",
          { y: 16, autoAlpha: 0 },
          {
            y: 0,
            autoAlpha: 1,
            duration: 0.7,
            ease: "power2.out",
            delay: 0.3,
            scrollTrigger: { trigger: rootRef.current, start: "top 75%" },
          },
        );
      });

      mm.add("(prefers-reduced-motion: reduce)", () => {
        gsap.set(".mission-quote", { y: 0, autoAlpha: 1 });
      });

      return () => mm.revert();
    },
    { scope: rootRef },
  );

  return (
    <section
      ref={rootRef}
      className="relative overflow-hidden bg-[#201a1a] bg-[radial-gradient(ellipse_at_top,_#661615_0%,_#201a1a_65%)] bg-[length:100%_140%] section-y"
    >
      <div className="container-page relative z-10">
        <SectionHeading eyebrow={eyebrow ?? undefined} title={title} align="center" tone="light" />
        <p className="mission-quote mx-auto mt-8 max-w-3xl text-center text-lg leading-relaxed text-white/85 md:text-xl">
          &ldquo;{quote}&rdquo;
        </p>
      </div>
    </section>
  );
}
