"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "@/lib/gsap";
import SectionHeading from "./SectionHeading";
import { aboutStory } from "@/lib/content";

/**
 * "Quem somos" — deliberately not another photo-plus-badge block like the
 * home AboutSection (the page already has photos in the hero, office and
 * gallery sections); the big numeral carries the visual weight here
 * instead, so this reads as its own moment rather than a re-skin.
 */
export default function AboutStorySection() {
  const rootRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
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
    },
    { scope: rootRef },
  );

  return (
    <section id="historia" className="section-y bg-white" ref={rootRef}>
      <div className="container-page grid grid-cols-1 items-start gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
        <div className="story-number flex flex-col items-start lg:sticky lg:top-32">
          <span className="font-display text-[6rem] leading-none font-extrabold text-primary md:text-[8rem]">
            32
          </span>
          <span className="mt-2 text-sm font-bold tracking-[0.2em] text-gray-medium uppercase">
            Anos de mercado
          </span>
        </div>

        <div>
          <SectionHeading
            eyebrow="Quem Somos"
            title="Uma trajetória construída com dedicação e experiência"
          />
          <p className="story-copy mt-6 text-base leading-relaxed text-gray-medium md:text-lg">
            {aboutStory.intro}
          </p>
          <p className="story-copy mt-4 text-base leading-relaxed text-gray-medium md:text-lg">
            {aboutStory.detail}
          </p>
        </div>
      </div>
    </section>
  );
}
