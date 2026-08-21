"use client";

import { useRef } from "react";
import Image from "next/image";
import { useGSAP } from "@gsap/react";
import { gsap } from "@/lib/gsap";
import SectionHeading from "./SectionHeading";
import { MOTION_DURATION, MOTION_OFFSET, MOTION_STAGGER, GSAP_EASE } from "@/lib/motionTokens";

type CertificationItem = {
  id: number;
  name: string;
  description: string | null;
  logo: string | null;
};

// 3 is the real, documented count (ABESE/APCER ISO 9001/IQNET) and the
// blueprint's own assumption ("3 itens de peso igual, lado a lado") — the
// grid still adapts down gracefully for 1-2 active items instead of leaving
// empty tracks, and wraps to a new row past 3 rather than hardcoding a cap.
function gridColsClass(count: number) {
  if (count === 1) return "sm:grid-cols-1";
  if (count === 2) return "sm:grid-cols-2";
  return "sm:grid-cols-3";
}

export default function CertificationsSectionClient({ certifications }: { certifications: CertificationItem[] }) {
  const rootRef = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.fromTo(
          ".cert-item",
          { y: MOTION_OFFSET.sm, autoAlpha: 0 },
          {
            y: 0,
            autoAlpha: 1,
            duration: MOTION_DURATION.base,
            ease: GSAP_EASE.out,
            stagger: MOTION_STAGGER,
            scrollTrigger: { trigger: rootRef.current, start: "top 78%" },
          },
        );
        gsap.fromTo(
          ".cert-logo",
          { scale: 0.9, autoAlpha: 0 },
          {
            scale: 1,
            autoAlpha: 1,
            duration: MOTION_DURATION.base,
            ease: GSAP_EASE.out,
            stagger: MOTION_STAGGER,
            delay: 0.15,
            scrollTrigger: { trigger: rootRef.current, start: "top 78%" },
          },
        );
      });

      // No continuous motion to begin with (single entrance, no loop), but
      // still an explicit branch per the task's requirement — content
      // appears immediately, nothing animates in.
      mm.add("(prefers-reduced-motion: reduce)", () => {
        gsap.set(".cert-item", { y: 0, autoAlpha: 1 });
        gsap.set(".cert-logo", { scale: 1, autoAlpha: 1 });
      });

      return () => mm.revert();
    },
    { scope: rootRef, dependencies: [certifications.length] },
  );

  return (
    <section className="section-y relative overflow-hidden bg-white" ref={rootRef}>
      <div className="container-page relative z-10">
        <SectionHeading eyebrow="Certificações" title="Qualidade que pode ser comprovada" />

        <div
          className={`mt-14 grid grid-cols-1 divide-y divide-border sm:divide-x sm:divide-y-0 ${gridColsClass(certifications.length)}`}
        >
          {certifications.map((cert, i) => (
            <div
              key={cert.id}
              className="cert-item group py-8 first:pt-0 sm:px-10 sm:py-0 sm:first:pl-0 sm:last:pr-0"
            >
              <span className="block text-xs font-bold tracking-[0.2em] text-gray-medium/60">
                {String(i + 1).padStart(2, "0")}
              </span>

              {cert.logo && (
                <div className="cert-logo relative mt-5 h-12 w-12">
                  <Image
                    src={cert.logo}
                    alt={`Logo ${cert.name}`}
                    fill
                    sizes="48px"
                    unoptimized={cert.logo.endsWith(".svg")}
                    className="object-contain"
                  />
                </div>
              )}

              <h3
                className={`font-display font-bold text-foreground transition-colors duration-300 group-hover:text-primary ${
                  cert.logo ? "mt-4 text-heading-md" : "mt-5 text-heading-lg"
                }`}
              >
                {cert.name}
              </h3>

              {cert.description && (
                <p className="mt-3 max-w-xs text-sm leading-relaxed text-gray-medium">{cert.description}</p>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
