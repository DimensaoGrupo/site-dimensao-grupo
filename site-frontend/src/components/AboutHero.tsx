"use client";

import { useRef } from "react";
import Image from "next/image";
import { useGSAP } from "@gsap/react";
import { gsap } from "@/lib/gsap";
import { aboutImages } from "@/lib/content";

/**
 * Hero for /sobre-nos. Deliberately not a reuse of the home Hero (that's a
 * carousel built around rotating service highlights, wrong shape for an
 * institutional intro) — but it borrows that hero's exact dark-panel
 * treatment (eyebrow pill, type scale, header offset) so the page still
 * reads as the same site.
 */
export default function AboutHero() {
  const rootRef = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      gsap.fromTo(
        ".about-hero-fade",
        { y: 24, autoAlpha: 0 },
        {
          y: 0,
          autoAlpha: 1,
          duration: 0.8,
          ease: "power3.out",
          stagger: 0.12,
        },
      );
      gsap.fromTo(
        ".about-hero-media",
        { scale: 1.06, autoAlpha: 0 },
        { scale: 1, autoAlpha: 1, duration: 1, ease: "power3.out", delay: 0.15 },
      );
    },
    { scope: rootRef },
  );

  return (
    <section
      ref={rootRef}
      className="relative overflow-hidden bg-[#201a1a] pt-24 pb-16 md:pt-[124px] md:pb-24"
    >
      <div className="container-page grid grid-cols-1 items-center gap-14 py-10 lg:grid-cols-[1.1fr_0.9fr] lg:gap-16 lg:py-16">
        <div>
          <span className="about-hero-fade inline-block rounded-full border border-white/25 bg-white/10 px-4 py-1.5 text-xs font-semibold tracking-[0.18em] text-white backdrop-blur-sm">
            SOBRE NÓS
          </span>
          <h1 className="about-hero-fade mt-5 text-4xl leading-[1.1] font-extrabold text-white md:text-5xl lg:text-6xl">
            Experiência que se traduz em confiança
          </h1>
          <p className="about-hero-fade mt-5 max-w-lg text-base text-white/85 md:text-lg">
            Há 32 anos no mercado, o Grupo Dimensão vem trabalhando e se
            aperfeiçoando para oferecer as melhores soluções em segurança
            patrimonial, portaria e monitoramento.
          </p>
          <div className="about-hero-fade mt-8 flex items-center gap-4 border-t border-white/10 pt-6">
            <span className="font-display text-4xl font-extrabold text-primary md:text-5xl">
              32
            </span>
            <span className="max-w-[11rem] text-sm leading-snug font-medium text-white/70">
              anos de mercado em segurança patrimonial
            </span>
          </div>
        </div>

        <div className="about-hero-media relative aspect-[4/5] w-full overflow-hidden rounded-3xl">
          <Image
            src={aboutImages.hero}
            alt="Grupo Dimensão"
            fill
            priority
            sizes="(min-width: 1024px) 40vw, 90vw"
            className="object-cover"
          />
        </div>
      </div>
    </section>
  );
}
