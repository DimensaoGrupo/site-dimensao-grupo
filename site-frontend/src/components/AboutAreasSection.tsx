"use client";

import { useRef } from "react";
import Link from "next/link";
import { useGSAP } from "@gsap/react";
import { gsap } from "@/lib/gsap";
import { services } from "@/lib/content";
import SectionHeading from "./SectionHeading";
import { ArrowRightIcon } from "./icons";

/**
 * Areas of operation as a typographic list rather than another card grid —
 * ServicesSection on the home page already owns that treatment, so this
 * stays deliberately text-first (numbered rows, no icons/boxes) while still
 * reusing the same `services` data (and its `/servicos/*` hrefs).
 */
export default function AboutAreasSection() {
  const rootRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      gsap.fromTo(
        ".area-row",
        { y: 20, autoAlpha: 0 },
        {
          y: 0,
          autoAlpha: 1,
          duration: 0.6,
          ease: "power3.out",
          stagger: 0.08,
          scrollTrigger: { trigger: rootRef.current, start: "top 80%" },
        },
      );
    },
    { scope: rootRef },
  );

  return (
    <section className="section-y bg-white" ref={rootRef}>
      <div className="container-page">
        <SectionHeading
          eyebrow="Áreas de Atuação"
          title="Soluções completas em segurança patrimonial"
          description="Da recepção ao monitoramento remoto, cada frente é conduzida por equipes treinadas e processos auditados."
        />

        <div className="mt-12 border-t border-gray-light/70">
          {services.map((service, i) => (
            <Link
              key={service.title}
              href={service.href}
              className="area-row group flex flex-col gap-2 border-b border-gray-light/70 py-7 transition-colors hover:bg-[#f7f6f6] sm:flex-row sm:items-baseline sm:justify-between sm:gap-10 sm:px-2"
            >
              <div className="flex items-baseline gap-4 sm:w-2/5 sm:shrink-0">
                <span className="font-display text-sm font-bold text-gray-medium">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h3 className="text-xl font-bold text-foreground transition-colors group-hover:text-primary md:text-2xl">
                  {service.title}
                </h3>
              </div>
              <p className="text-sm leading-relaxed text-gray-medium sm:max-w-md sm:text-right">
                {service.description}
              </p>
              <ArrowRightIcon className="hidden h-5 w-5 shrink-0 text-primary opacity-0 transition-all duration-200 group-hover:translate-x-1 group-hover:opacity-100 sm:block" />
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
