"use client";

import { useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "motion/react";
import { useGSAP } from "@gsap/react";
import { gsap } from "@/lib/gsap";
import SectionHeading from "./SectionHeading";
import SymbolBackground from "./SymbolBackground";
import { ArrowRightIcon } from "./icons";

export type ServiceCardData = {
  // Reuses the service's own heroImage (required at the schema level, so
  // this is never null) instead of a second, dedicated card-image field —
  // see conversation: one photo per service today, not two uploads for a
  // single real photo. The generic icon (SERVICE_ICON_MAP) no longer
  // renders here; `services.icon` still exists in the CMS/schema, just
  // unused by this specific card.
  image: string;
  title: string;
  description: string;
  href: string;
};

export default function ServicesSection({ services }: { services: ServiceCardData[] }) {
  const rootRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const cards = gsap.utils.toArray<HTMLElement>(".service-card");
        gsap.fromTo(
          cards,
          { y: 36, autoAlpha: 0 },
          {
            y: 0,
            autoAlpha: 1,
            duration: 0.7,
            ease: "power3.out",
            stagger: 0.12,
            scrollTrigger: {
              trigger: rootRef.current,
              start: "top 78%",
            },
          },
        );
      });

      mm.add("(prefers-reduced-motion: reduce)", () => {
        gsap.set(".service-card", { y: 0, autoAlpha: 1 });
      });

      return () => mm.revert();
    },
    { scope: rootRef },
  );

  return (
    <section
      id="servicos"
      className="section-y relative overflow-hidden bg-white"
      ref={rootRef}
    >
      <SymbolBackground position="right" opacity={0.05} />
      <div className="container-page relative z-10">
        <SectionHeading
          eyebrow="Somos Especialistas"
          title="Soluções completas em segurança patrimonial"
          description="Da recepção ao monitoramento remoto, cada serviço é conduzido por equipes treinadas e processos auditados — pensados para empresas, condomínios e indústrias."
        />

        {/* flex-wrap + justify-center (not CSS grid) so a trailing incomplete
            row always centers itself — grid always left-anchors leftover
            cells, which is what made 4 or 5 items read as "N-1 cards + one
            orphan" instead of an intentional layout. Same fixed card width
            at every breakpoint regardless of total count, so this holds for
            3, 4, 5 or 6+ services without a per-count special case. */}
        <div className="mt-14 flex flex-wrap justify-center gap-6">
          {services.map((service) => (
            <Link
              key={service.title}
              href={service.href}
              className="service-card block w-full max-w-[420px] shrink-0 grow-0 sm:basis-[calc(50%-0.75rem)] lg:basis-[calc(33.333%-1rem)]"
            >
              <motion.div
                className="group relative h-full overflow-hidden rounded-2xl border border-gray-light/70 bg-white transition-shadow duration-300 hover:shadow-[0_20px_45px_rgba(147,32,38,0.16)]"
                whileHover={{ y: -6, scale: 1.015 }}
                transition={{ type: "spring", stiffness: 300, damping: 22 }}
              >
                {/* Reuses the service's own heroImage — same photo as its
                    /servicos/[slug] page, not a second dedicated upload.
                    2:1 (was 16:10) keeps the photo as the card's visual
                    anchor without letting it dominate the card the way a
                    taller crop did — a shorter, more editorial "photo band"
                    above the text instead of a near-square block. */}
                <div className="relative aspect-[2/1] w-full overflow-hidden">
                  <Image
                    src={service.image}
                    alt={service.title}
                    fill
                    sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                    unoptimized={service.image.endsWith(".svg")}
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
                <div className="p-8">
                  <h3 className="text-lg font-bold text-foreground">
                    {service.title}
                  </h3>
                  <p className="mt-2.5 text-[15px] leading-relaxed text-gray-medium">
                    {service.description}
                  </p>
                  <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-primary">
                    Saiba mais
                    <ArrowRightIcon className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
                  </span>
                </div>
              </motion.div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
