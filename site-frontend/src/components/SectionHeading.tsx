"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "@/lib/gsap";

type SectionHeadingProps = {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: "left" | "center";
  tone?: "dark" | "light";
};

export default function SectionHeading({
  eyebrow,
  title,
  description,
  align = "left",
  tone = "dark",
}: SectionHeadingProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const words = title.split(" ");

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const words = gsap.utils.toArray<HTMLElement>(".heading-word-inner");
        gsap.fromTo(
          words,
          { yPercent: 115 },
          {
            yPercent: 0,
            duration: 0.8,
            ease: "power4.out",
            stagger: 0.035,
            scrollTrigger: { trigger: rootRef.current, start: "top 85%" },
          },
        );
        gsap.fromTo(
          ".heading-fade",
          { y: 16, autoAlpha: 0 },
          {
            y: 0,
            autoAlpha: 1,
            duration: 0.7,
            ease: "power2.out",
            delay: 0.15,
            scrollTrigger: { trigger: rootRef.current, start: "top 85%" },
          },
        );
      });

      // Reduced motion: heading and eyebrow/description are visible
      // immediately, never gated behind a scroll trigger that would leave
      // them hidden until the user happens to scroll past this point.
      mm.add("(prefers-reduced-motion: reduce)", () => {
        gsap.set(".heading-word-inner", { yPercent: 0 });
        gsap.set(".heading-fade", { y: 0, autoAlpha: 1 });
      });

      return () => mm.revert();
    },
    { scope: rootRef },
  );

  const isCenter = align === "center";
  const isLight = tone === "light";

  return (
    <div
      ref={rootRef}
      className={`max-w-2xl ${isCenter ? "mx-auto text-center" : "text-left"}`}
    >
      {eyebrow && (
        <span
          className={`heading-fade mb-4 inline-block text-xs font-bold tracking-[0.2em] uppercase ${
            isLight ? "text-white/70" : "text-primary"
          }`}
        >
          {eyebrow}
        </span>
      )}
      <h2
        className={`text-3xl leading-[1.15] font-extrabold md:text-4xl ${
          isLight ? "text-white" : "text-foreground"
        }`}
      >
        {words.map((word, i) => (
          <span key={i} className="inline-block overflow-hidden pb-1 align-bottom">
            <span className="heading-word-inner inline-block">
              {word}
              {i < words.length - 1 ? " " : ""}
            </span>
          </span>
        ))}
      </h2>
      {description && (
        <p
          className={`heading-fade mt-5 text-base leading-relaxed md:text-lg ${
            isLight ? "text-white/75" : "text-gray-medium"
          }`}
        >
          {description}
        </p>
      )}
    </div>
  );
}
