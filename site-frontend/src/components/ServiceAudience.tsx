"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "@/lib/gsap";
import SectionHeading from "./SectionHeading";
import { SERVICE_ICON_MAP, type ServiceIconKey } from "@/lib/services/icons";
import { serviceCardGridClasses } from "@/lib/services/cardGrid";

export type ServiceAudienceItem = {
  icon: ServiceIconKey;
  title: string;
  description: string;
  active?: boolean;
};

type ServiceAudienceProps = {
  description: string;
  audiences: readonly ServiceAudienceItem[];
};

/**
 * Shows the service's reach (commercial/residential) as two cards rather
 * than treating them as separate services — same card language as
 * ServiceBenefits, one row.
 */
export default function ServiceAudience({ description, audiences }: ServiceAudienceProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const grid = serviceCardGridClasses(audiences.length);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.fromTo(
          ".audience-card",
          { y: 28, autoAlpha: 0 },
          {
            y: 0,
            autoAlpha: 1,
            duration: 0.7,
            ease: "power3.out",
            stagger: 0.12,
            scrollTrigger: { trigger: rootRef.current, start: "top 80%" },
          },
        );
      });

      mm.add("(prefers-reduced-motion: reduce)", () => {
        gsap.set(".audience-card", { y: 0, autoAlpha: 1 });
      });

      return () => mm.revert();
    },
    { scope: rootRef },
  );

  return (
    <section className="section-y bg-white" ref={rootRef}>
      <div className="container-page">
        <SectionHeading
          eyebrow="Abrangência"
          title="Soluções para diferentes empreendimentos"
          description={description}
        />

        <div className={`mt-10 ${grid.container}`}>
          {audiences.map((audience, index) => {
            const Icon = SERVICE_ICON_MAP[audience.icon];
            return (
              <div
                key={index}
                className={`${grid.item} audience-card rounded-2xl border border-gray-light/70 bg-[#f7f6f6] p-8`}
              >
                <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-white text-primary-muted">
                  <Icon className="h-7 w-7" />
                </div>
                <h3 className="mt-6 text-xl font-bold text-foreground">
                  {audience.title}
                </h3>
                <p className="mt-2.5 text-[15px] leading-relaxed text-gray-medium">
                  {audience.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
