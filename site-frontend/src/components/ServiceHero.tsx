"use client";

import { useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useGSAP } from "@gsap/react";
import { gsap } from "@/lib/gsap";
import { useRollingHover } from "@/hooks/useRollingHover";
import RollingText from "./RollingText";

type ServiceHeroProps = {
  title: string;
  subheading: string;
  intro: string;
  image: string;
};

/**
 * Hero for individual /servicos/* pages — same dark-panel treatment as
 * AboutHero (eyebrow pill, type scale, header offset), plus a breadcrumb
 * back to the home Services section. Generic/prop-driven so the next
 * service page reuses this instead of a copy.
 */
export default function ServiceHero({
  title,
  subheading,
  intro,
  image,
}: ServiceHeroProps) {
  const rootRef = useRef<HTMLElement>(null);
  const cta = useRollingHover();

  useGSAP(
    () => {
      gsap.fromTo(
        ".service-hero-fade",
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
        ".service-hero-media",
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
      <div className="container-page py-10 lg:py-16">
        <nav
          aria-label="Breadcrumb"
          className="service-hero-fade mb-8 flex items-center gap-2 text-xs font-medium tracking-[0.1em] text-white/50 uppercase"
        >
          <Link href="/#servicos" className="transition-colors hover:text-white">
            Serviços
          </Link>
          <span aria-hidden="true">/</span>
          <span className="text-white/80">{title}</span>
        </nav>

        <div className="grid grid-cols-1 items-center gap-14 lg:grid-cols-[1.1fr_0.9fr] lg:gap-16">
          <div>
            <span className="service-hero-fade inline-block rounded-full border border-white/25 bg-white/10 px-4 py-1.5 text-xs font-semibold tracking-[0.18em] text-white uppercase backdrop-blur-sm">
              {subheading}
            </span>
            <h1 className="service-hero-fade mt-5 text-4xl leading-[1.1] font-extrabold text-white md:text-5xl lg:text-6xl">
              {title}
            </h1>
            <p className="service-hero-fade mt-5 max-w-lg text-base text-white/85 md:text-lg">
              {intro}
            </p>
            <a
              href="#contato"
              className="service-hero-fade mt-8 inline-flex items-center gap-2 rounded-full bg-primary px-7 py-3.5 text-sm font-semibold text-white transition-colors duration-200 hover:bg-primary-dark"
              {...cta.handlers}
            >
              <RollingText text="Solicitar Orçamento" active={cta.active} />
            </a>
          </div>

          <div className="service-hero-media relative aspect-[4/5] w-full overflow-hidden rounded-3xl">
            <Image
              src={image}
              alt={title}
              fill
              priority
              sizes="(min-width: 1024px) 40vw, 90vw"
              className="object-cover"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
