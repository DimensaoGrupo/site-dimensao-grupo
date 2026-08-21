"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "@/lib/gsap";
import SectionHeading from "./SectionHeading";
import SymbolBackground from "./SymbolBackground";

type AboutStorySectionClientProps = {
  content: string;
  years: number | null;
};

export default function AboutStorySectionClient({ content, years }: AboutStorySectionClientProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const paragraphs = content.split(/\n{2,}/).filter(Boolean);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        if (years !== null) {
          gsap.fromTo(
            ".story-number",
            { scale: 0.85, autoAlpha: 0 },
            {
              scale: 1,
              autoAlpha: 1,
              duration: 0.8,
              ease: "back.out(1.6)",
              scrollTrigger: { trigger: rootRef.current, start: "top 78%" },
            },
          );
        }
        gsap.fromTo(
          ".story-copy",
          { y: 24, autoAlpha: 0 },
          {
            y: 0,
            autoAlpha: 1,
            duration: 0.7,
            ease: "power3.out",
            stagger: 0.12,
            scrollTrigger: { trigger: rootRef.current, start: "top 78%" },
          },
        );
      });

      mm.add("(prefers-reduced-motion: reduce)", () => {
        if (years !== null) gsap.set(".story-number", { scale: 1, autoAlpha: 1 });
        gsap.set(".story-copy", { y: 0, autoAlpha: 1 });
      });

      return () => mm.revert();
    },
    { scope: rootRef, dependencies: [years] },
  );

  return (
    <section id="historia" className="section-y relative overflow-hidden bg-white" ref={rootRef}>
      <SymbolBackground position="left" opacity={0.05} />
      <div className="container-page relative z-10 grid grid-cols-1 items-start gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
        {years !== null && (
          <div className="story-number flex flex-col items-start lg:sticky lg:top-32">
            <span className="font-display text-[6rem] leading-none font-extrabold text-primary md:text-[8rem]">
              {years}
            </span>
            <span className="mt-2 text-sm font-bold tracking-[0.2em] text-gray-medium uppercase">
              Anos de mercado
            </span>
          </div>
        )}

        <div className={years === null ? "lg:col-span-2" : undefined}>
          <SectionHeading eyebrow="Quem Somos" title="Uma trajetória construída com dedicação e experiência" />
          {paragraphs.map((paragraph, i) => (
            <p
              key={i}
              className={`story-copy ${i === 0 ? "mt-6" : "mt-4"} text-base leading-relaxed text-gray-medium md:text-lg`}
            >
              {paragraph}
            </p>
          ))}
        </div>
      </div>
    </section>
  );
}
