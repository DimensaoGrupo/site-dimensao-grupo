"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "@/lib/gsap";
import SectionHeading from "./SectionHeading";
import {
  BadgeCheckIcon,
  HeadsetIcon,
  BuildingIcon,
  ClockIcon,
  AccessIcon,
} from "./icons";

const iconMap = {
  badge: BadgeCheckIcon,
  headset: HeadsetIcon,
  building: BuildingIcon,
  clock: ClockIcon,
  access: AccessIcon,
};

export type ServiceBenefit = {
  icon: keyof typeof iconMap;
  title: string;
  description: string;
};

type ServiceBenefitsProps = {
  benefits: readonly ServiceBenefit[];
};

/**
 * Differentiator cards — same visual language as the home ServicesSection
 * (icon box, rounded border, hover-free here since these aren't links to
 * anywhere, just informational).
 */
export default function ServiceBenefits({ benefits }: ServiceBenefitsProps) {
  const rootRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
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
    },
    { scope: rootRef },
  );

  return (
    <section className="section-y bg-[#f7f6f6]" ref={rootRef}>
      <div className="container-page">
        <SectionHeading
          eyebrow="Diferenciais"
          title="Por que contar com o Grupo Dimensão"
        />

        <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {benefits.map((benefit) => {
            const Icon = iconMap[benefit.icon];
            return (
              <div
                key={benefit.title}
                className="benefit-card rounded-2xl border border-gray-light/70 bg-white p-8"
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
