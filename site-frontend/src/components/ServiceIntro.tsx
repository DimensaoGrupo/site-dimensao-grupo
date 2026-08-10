"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "@/lib/gsap";
import SectionHeading from "./SectionHeading";

type ServiceIntroProps = {
  eyebrow: string;
  title: string;
  lead: string;
  detail: string;
};

/**
 * Turns the service's two source paragraphs into a scannable lead
 * statement (bigger type) + supporting note, instead of two same-sized
 * blocks of text — narrow heading column beside a wider copy column.
 */
export default function ServiceIntro({ eyebrow, title, lead, detail }: ServiceIntroProps) {
  const rootRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      gsap.fromTo(
        ".intro-copy",
        { y: 20, autoAlpha: 0 },
        {
          y: 0,
          autoAlpha: 1,
          duration: 0.7,
          ease: "power3.out",
          stagger: 0.12,
          scrollTrigger: { trigger: rootRef.current, start: "top 80%" },
        },
      );
    },
    { scope: rootRef },
  );

  return (
    <section className="section-y bg-white" ref={rootRef}>
      <div className="container-page grid grid-cols-1 gap-10 lg:grid-cols-[1fr_1.4fr] lg:gap-16">
        <SectionHeading eyebrow={eyebrow} title={title} />
        <div className="flex flex-col gap-6">
          <p className="intro-copy text-xl leading-relaxed font-medium text-foreground md:text-2xl">
            {lead}
          </p>
          <p className="intro-copy text-base leading-relaxed text-gray-medium md:text-lg">
            {detail}
          </p>
        </div>
      </div>
    </section>
  );
}
