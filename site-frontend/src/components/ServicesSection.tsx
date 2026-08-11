"use client";

import { useRef } from "react";
import Link from "next/link";
import { motion } from "motion/react";
import { useGSAP } from "@gsap/react";
import { gsap } from "@/lib/gsap";
import { services } from "@/lib/content";
import SectionHeading from "./SectionHeading";
import SectionAmbiance from "./SectionAmbiance";
import {
  TurnstileIcon,
  CctvIcon,
  AccessIcon,
  ClockIcon,
  GardenIcon,
  ShieldIcon,
  ArrowRightIcon,
} from "./icons";

const iconMap = {
  turnstile: TurnstileIcon,
  cctv: CctvIcon,
  access: AccessIcon,
  clock: ClockIcon,
  garden: GardenIcon,
  shield: ShieldIcon,
};

export default function ServicesSection() {
  const rootRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
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
    },
    { scope: rootRef },
  );

  return (
    <section
      id="servicos"
      className="section-y relative overflow-hidden bg-white"
      ref={rootRef}
    >
      <SectionAmbiance topFadeFrom="rgba(32,26,26,0.04)" />
      <div className="container-page relative z-10">
        <SectionHeading
          eyebrow="Somos Especialistas"
          title="Soluções completas em segurança patrimonial"
          description="Da recepção ao monitoramento remoto, cada serviço é conduzido por equipes treinadas e processos auditados — pensados para empresas, condomínios e indústrias."
        />

        <div className="mt-14 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((service) => {
            const Icon = iconMap[service.icon];
            return (
              <Link key={service.title} href={service.href} className="service-card block">
                <motion.div
                  className="group relative h-full overflow-hidden rounded-2xl border border-gray-light/70 bg-white p-8 transition-shadow duration-300 hover:shadow-[0_20px_45px_rgba(147,32,38,0.16)]"
                  whileHover={{ y: -6, scale: 1.015 }}
                  transition={{ type: "spring", stiffness: 300, damping: 22 }}
                >
                  <div className="absolute inset-x-0 top-0 h-1 origin-left scale-x-0 bg-primary transition-transform duration-300 group-hover:scale-x-100" />
                  <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-[#f7f6f6] text-primary-muted transition-all duration-300 group-hover:scale-110 group-hover:bg-primary group-hover:text-white">
                    <Icon className="h-7 w-7" />
                  </div>
                  <h3 className="mt-6 text-lg font-bold text-foreground">
                    {service.title}
                  </h3>
                  <p className="mt-2.5 text-[15px] leading-relaxed text-gray-medium">
                    {service.description}
                  </p>
                  <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-primary">
                    Saiba mais
                    <ArrowRightIcon className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
                  </span>
                </motion.div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
