"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "@/lib/gsap";
import { BadgeCheck } from "lucide-react";

type ServiceCredentialProps = {
  number: string;
  text: string;
};

/**
 * The legal authorization text, presented as one discreet card rather than
 * a slab of legal copy — a small credibility beat right before the closing
 * CTA, not a section of its own.
 */
export default function ServiceCredential({ number, text }: ServiceCredentialProps) {
  const rootRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.fromTo(
          ".credential-card",
          { y: 20, autoAlpha: 0 },
          {
            y: 0,
            autoAlpha: 1,
            duration: 0.6,
            ease: "power3.out",
            scrollTrigger: { trigger: rootRef.current, start: "top 88%" },
          },
        );
      });

      mm.add("(prefers-reduced-motion: reduce)", () => {
        gsap.set(".credential-card", { y: 0, autoAlpha: 1 });
      });

      return () => mm.revert();
    },
    { scope: rootRef },
  );

  return (
    <section className="bg-white pb-20 md:pb-28" ref={rootRef}>
      <div className="container-page">
        <div className="credential-card flex flex-col items-start gap-4 rounded-2xl border border-gray-light/70 bg-[#f7f6f6] p-6 sm:flex-row sm:items-center sm:gap-5 sm:p-7">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white text-primary">
            <BadgeCheck className="h-6 w-6" />
          </span>
          <div>
            <span className="text-xs font-bold tracking-[0.15em] text-primary uppercase">
              Autorização Nº {number}
            </span>
            <p className="mt-1.5 text-sm leading-relaxed text-gray-medium">
              {text}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
