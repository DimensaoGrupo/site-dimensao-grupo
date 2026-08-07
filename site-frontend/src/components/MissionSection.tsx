"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "@/lib/gsap";
import SectionHeading from "./SectionHeading";

export default function MissionSection() {
  const rootRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      gsap.fromTo(
        rootRef.current,
        { backgroundPosition: "50% 42%" },
        {
          backgroundPosition: "50% 58%",
          ease: "none",
          scrollTrigger: {
            trigger: rootRef.current,
            start: "top bottom",
            end: "bottom top",
            scrub: true,
          },
        },
      );
      gsap.fromTo(
        ".mission-quote",
        { y: 16, autoAlpha: 0 },
        {
          y: 0,
          autoAlpha: 1,
          duration: 0.7,
          ease: "power2.out",
          delay: 0.3,
          scrollTrigger: { trigger: rootRef.current, start: "top 75%" },
        },
      );
    },
    { scope: rootRef },
  );

  return (
    <section
      ref={rootRef}
      className="relative overflow-hidden bg-[#201a1a] bg-[radial-gradient(ellipse_at_top,_#661615_0%,_#201a1a_65%)] bg-[length:100%_140%] section-y"
    >
      <div className="container-page relative z-10">
        <SectionHeading
          eyebrow="Nossa Missão"
          title="Excelência a serviço da tranquilidade de quem confia em nós"
          align="center"
          tone="light"
        />
        <p className="mission-quote mx-auto mt-8 max-w-3xl text-center text-lg leading-relaxed text-white/85 md:text-xl">
          &ldquo;Nossa missão é a plena satisfação do cliente com excelência
          no atendimento às suas demandas. A partir do desenvolvimento e
          oferta de produtos e serviços que contribuam para a melhoria da
          qualidade de vida das pessoas, buscando sempre a melhoria contínua
          dos processos e serviços prestados.&rdquo;
        </p>
      </div>
    </section>
  );
}
