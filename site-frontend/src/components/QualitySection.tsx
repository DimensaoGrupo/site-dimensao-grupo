"use client";

import { useRef } from "react";
import Image from "next/image";
import { useGSAP } from "@gsap/react";
import { gsap } from "@/lib/gsap";
import SectionAmbiance from "./SectionAmbiance";

export default function QualitySection() {
  const rootRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      gsap.fromTo(
        ".quality-seal",
        { y: 20, autoAlpha: 0 },
        {
          y: 0,
          autoAlpha: 1,
          duration: 0.6,
          ease: "power2.out",
          stagger: 0.15,
          scrollTrigger: { trigger: rootRef.current, start: "top 82%" },
        },
      );
      gsap.fromTo(
        ".quality-text",
        { y: 20, autoAlpha: 0 },
        {
          y: 0,
          autoAlpha: 1,
          duration: 0.7,
          ease: "power2.out",
          delay: 0.1,
          scrollTrigger: { trigger: rootRef.current, start: "top 82%" },
        },
      );
    },
    { scope: rootRef },
  );

  return (
    <section
      className="section-y relative overflow-hidden border-t border-gray-light/60 bg-[#f7f6f6]"
      ref={rootRef}
    >
      <SectionAmbiance topFadeFrom="rgba(32,26,26,0.02)" />
      <div className="container-page relative z-10 grid grid-cols-1 items-center gap-12 lg:grid-cols-[auto_1fr] lg:gap-16">
        <div className="quality-seal shrink-0">
          <Image
            src="/images/certificados.svg"
            alt="Selos de Certificação ISO 9001 e IQNET"
            width={1920}
            height={1080}
            // Next's image optimizer 400s on SVG sources unless
            // dangerouslyAllowSVG is set globally (next.config.ts) — this is
            // a trusted local static asset, so skip the optimizer for it
            // rather than touch that global config.
            unoptimized
            className="h-40 w-auto md:h-48 lg:h-56"
            loading="lazy"
          />
        </div>

        <div className="quality-text">
          <span className="text-xs font-bold tracking-[0.2em] text-primary uppercase">
            Política de Qualidade
          </span>
          <p className="mt-4 max-w-3xl text-base leading-relaxed text-gray-medium md:text-lg">
            Buscar a excelência na qualidade da prestação de serviços,
            identificando e atendendo, com ética e responsabilidade, as
            expectativas dos nossos clientes. Conscientizar nossos
            colaboradores da importância em manter um ambiente participativo,
            visando a melhoria contínua dos processos.
          </p>
        </div>
      </div>
    </section>
  );
}
