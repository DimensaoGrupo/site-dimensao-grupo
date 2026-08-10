"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "@/lib/gsap";
import { HeadsetIcon } from "./icons";

type ServiceHighlightProps = {
  title: string;
  text: string;
};

/**
 * A single-fact spotlight (e.g. the 24h central) — centered, dark,
 * restrained on purpose: the source only supports one sentence here, so the
 * section stays small rather than padded out to look more substantial than
 * it is.
 */
export default function ServiceHighlight({ title, text }: ServiceHighlightProps) {
  const rootRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      gsap.fromTo(
        ".highlight-fade",
        { y: 24, autoAlpha: 0 },
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
    <section className="section-y bg-[#201a1a]" ref={rootRef}>
      <div className="container-page flex flex-col items-center text-center">
        <div className="highlight-fade flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/15 text-primary">
          <HeadsetIcon className="h-8 w-8" />
        </div>
        <h2 className="highlight-fade mt-6 text-3xl font-extrabold text-white md:text-4xl">
          {title}
        </h2>
        <p className="highlight-fade mx-auto mt-4 max-w-2xl text-base leading-relaxed text-white/75 md:text-lg">
          {text}
        </p>
      </div>
    </section>
  );
}
