"use client";

import { useRef } from "react";
import { motion } from "motion/react";
import { useGSAP } from "@gsap/react";
import { gsap } from "@/lib/gsap";
import { services } from "@/lib/content";
import SectionHeading from "./SectionHeading";
import {
  ReceptionIcon,
  CctvIcon,
  AccessIcon,
  ClockIcon,
  GardenIcon,
  ShieldIcon,
} from "./icons";

const iconMap = {
  reception: ReceptionIcon,
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
    <section id="servicos" className="section-y bg-white" ref={rootRef}>
      <div className="container-page">
        <SectionHeading
          eyebrow="Somos Especialistas"
          title="Soluções completas em segurança patrimonial"
          description="Da recepção ao monitoramento remoto, cada serviço é conduzido por equipes treinadas e processos auditados — pensados para empresas, condomínios e indústrias."
        />

        <div className="mt-14 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((service) => {
            const Icon = iconMap[service.icon];
            return (
              <motion.div
                key={service.title}
                className="service-card group relative overflow-hidden rounded-2xl border border-gray-light/70 bg-white p-8"
                whileHover={{ y: -6, scale: 1.015 }}
                transition={{ type: "spring", stiffness: 300, damping: 22 }}
              >
                <div className="absolute inset-x-0 top-0 h-1 origin-left scale-x-0 bg-primary transition-transform duration-300 group-hover:scale-x-100" />
                <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-[#f7f6f6] text-primary-muted transition-colors duration-300 group-hover:bg-primary group-hover:text-white">
                  <Icon className="h-7 w-7" />
                </div>
                <h3 className="mt-6 text-lg font-bold text-foreground">
                  {service.title}
                </h3>
                <p className="mt-2.5 text-[15px] leading-relaxed text-gray-medium">
                  {service.description}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
