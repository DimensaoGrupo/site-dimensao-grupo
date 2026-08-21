"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "@/lib/gsap";
import SectionHeading from "./SectionHeading";
import SymbolBackground from "./SymbolBackground";
import { SERVICE_ICON_MAP, type ServiceIconKey } from "@/lib/services/icons";
import { serviceCardGridClasses } from "@/lib/services/cardGrid";

export type ServiceBenefit = {
  icon: ServiceIconKey;
  title: string;
  description: string;
  active?: boolean;
};

type ServiceBenefitsProps = {
  benefits: readonly ServiceBenefit[];
};

/**
 * Differentiator cards — same visual language as the home ServicesSection
 * (icon box, rounded border, hover-free here since these aren't links to
 * anywhere, just informational).
 */
// `benefits` is expected pre-filtered to active items — see ServiceView.tsx.
export default function ServiceBenefits({ benefits }: ServiceBenefitsProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const grid = serviceCardGridClasses(benefits.length);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.fromTo(
          ".benefit-card",
          { y: 32, autoAlpha: 0 },
          {
            y: 0,
            autoAlpha: 1,
            duration: 0.7,
            ease: "power3.out",
            stagger: 0.1,
            scrollTrigger: { trigger: rootRef.current, start: "top 78%" },
          },
        );
      });

      mm.add("(prefers-reduced-motion: reduce)", () => {
        gsap.set(".benefit-card", { y: 0, autoAlpha: 1 });
      });

      return () => mm.revert();
    },
    { scope: rootRef },
  );

  return (
    <section className="section-y relative overflow-hidden bg-[#f7f6f6]" ref={rootRef}>
      <SymbolBackground position="right" opacity={0.05} />
      <div className="container-page relative z-10">
        <SectionHeading
          eyebrow="Diferenciais"
          title="Por que contar com o Grupo Dimensão"
        />

        <div className={`mt-10 ${grid.container}`}>
          {benefits.map((benefit, index) => {
            const Icon = SERVICE_ICON_MAP[benefit.icon];
            return (
              <div
                key={index}
                className={`${grid.item} benefit-card rounded-2xl border border-gray-light/70 bg-white p-8`}
              >
                <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-[#f7f6f6] text-primary-muted">
                  <Icon className="h-7 w-7" />
                </div>
                <h3 className="mt-6 text-lg font-bold text-foreground">
                  {benefit.title}
                </h3>
                <p className="mt-2.5 text-[15px] leading-relaxed text-gray-medium">
                  {benefit.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
