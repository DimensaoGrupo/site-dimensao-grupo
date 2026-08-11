"use client";

import { useRef } from "react";
import Image from "next/image";
import { useGSAP } from "@gsap/react";
import { gsap } from "@/lib/gsap";
import SectionHeading from "./SectionHeading";
import SectionAmbiance from "./SectionAmbiance";

export default function AboutSection() {
  const rootRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      gsap.fromTo(
        ".about-media",
        { y: 40, autoAlpha: 0 },
        {
          y: 0,
          autoAlpha: 1,
          duration: 0.8,
          ease: "power3.out",
          scrollTrigger: { trigger: rootRef.current, start: "top 75%" },
        },
      );
      gsap.fromTo(
        ".about-image",
        { scale: 1.08 },
        {
          scale: 1,
          duration: 1.1,
          ease: "power3.out",
          scrollTrigger: { trigger: rootRef.current, start: "top 75%" },
        },
      );
      gsap.fromTo(
        ".about-badge",
        { scale: 0.85, autoAlpha: 0 },
        {
          scale: 1,
          autoAlpha: 1,
          duration: 0.6,
          ease: "back.out(1.6)",
          delay: 0.4,
          scrollTrigger: { trigger: rootRef.current, start: "top 75%" },
        },
      );
    },
    { scope: rootRef },
  );

  return (
    <section
      id="sobre"
      className="section-y relative overflow-hidden bg-[#f7f6f6]"
      ref={rootRef}
    >
      <SectionAmbiance topFadeFrom="rgba(32,26,26,0.02)" />
      <div className="container-page relative z-10 grid grid-cols-1 items-center gap-14 lg:grid-cols-2 lg:gap-20">
        <div className="about-media relative order-2 lg:order-1">
          <div className="relative aspect-[4/5] w-full overflow-hidden rounded-3xl">
            <Image
              src="/images/about-dimensao.svg"
              alt="Equipe de segurança do Grupo Dimensão em atuação"
              fill
              sizes="(min-width: 1024px) 40vw, 90vw"
              className="about-image object-cover"
              loading="lazy"
            />
          </div>
          <div className="about-badge absolute -bottom-6 -right-4 flex flex-col items-center justify-center rounded-2xl bg-primary px-7 py-6 text-center text-white shadow-[0_20px_40px_rgba(147,32,38,0.35)] sm:-right-8">
            <span className="text-4xl font-extrabold">32</span>
            <span className="mt-1 text-xs font-semibold tracking-[0.14em] uppercase">
              anos de mercado
            </span>
          </div>
        </div>

        <div className="order-1 lg:order-2">
          <SectionHeading
            eyebrow="Sobre Nós"
            title="Experiência que se traduz em confiança"
          />
          <p className="mt-6 text-base leading-relaxed text-gray-medium md:text-lg">
            Há 32 anos no mercado, o Grupo Dimensão vem trabalhando e se
            aperfeiçoando para oferecer as melhores soluções em serviços
            tais como: Sistemas de Segurança Inteligente, Monitoramento,
            Portaria e Portaria remota, Vigilância, Zeladoria e Limpeza.
          </p>
          <p className="mt-4 text-base leading-relaxed text-gray-medium md:text-lg">
            Com tecnologia de ponta, atendimento personalizado, qualidade de
            serviço e experiência, buscamos a melhoria contínua dos nossos
            serviços e a satisfação do cliente que é nosso maior patrimônio.
          </p>
          <a
            href="#servicos"
            className="mt-8 inline-flex items-center gap-2 border-b-2 border-primary pb-1 text-sm font-semibold text-primary transition-colors hover:text-primary-dark hover:border-primary-dark"
          >
            Conheça nossos serviços
          </a>
        </div>
      </div>
    </section>
  );
}
