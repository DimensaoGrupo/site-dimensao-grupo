"use client";

import { useRef } from "react";
import Image from "next/image";
import { useGSAP } from "@gsap/react";
import { gsap } from "@/lib/gsap";
import SectionHeading from "./SectionHeading";
import SectionAmbiance from "./SectionAmbiance";
import RollingText from "./RollingText";
import { ArrowRightIcon } from "./icons";
import { useRollingHover } from "@/hooks/useRollingHover";

type AboutSectionClientProps = {
  eyebrow: string | null;
  title: string;
  content: string;
  image: string;
  /** Raw number from Statistics ("Anos de Experiência") — the badge's own
   * "anos de mercado" caption stays fixed presentation copy, not CMS text,
   * so the compact badge layout doesn't have to fit an arbitrary label. */
  years: number | null;
};

export default function AboutSectionClient({ eyebrow, title, content, image, years }: AboutSectionClientProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const cta = useRollingHover();
  // institutional_content.content stores the two paragraphs joined by a
  // blank line (see scripts/seed-institutional.ts) so the existing
  // two-paragraph layout survives the move to a single CMS text field.
  const paragraphs = content.split(/\n{2,}/).filter(Boolean);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: no-preference)", () => {
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
        if (years !== null) {
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
        }
      });

      mm.add("(prefers-reduced-motion: reduce)", () => {
        gsap.set(".about-media", { y: 0, autoAlpha: 1 });
        gsap.set(".about-image", { scale: 1 });
        if (years !== null) gsap.set(".about-badge", { scale: 1, autoAlpha: 1 });
      });

      return () => mm.revert();
    },
    { scope: rootRef, dependencies: [years] },
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
          {/* 4:5 (portrait) previously cropped landscape photos hard on the
              sides — a typical 3:2 photo lost ~45% of its width, cutting real
              subject matter. aspect-[4/3] keeps the section's tall-card/
              corner-badge composition without demanding a portrait source. */}
          <div className="relative aspect-[4/3] w-full overflow-hidden rounded-3xl">
            <Image
              src={image}
              alt="Equipe de segurança do Grupo Dimensão em atuação"
              fill
              sizes="(min-width: 1024px) 40vw, 90vw"
              unoptimized={image.endsWith(".svg")}
              className="about-image object-cover"
              loading="lazy"
            />
          </div>
          {years !== null && (
            <div className="about-badge absolute -bottom-6 -right-4 flex flex-col items-center justify-center rounded-2xl bg-primary px-7 py-6 text-center text-white shadow-[0_20px_40px_rgba(147,32,38,0.35)] sm:-right-8">
              <span className="text-4xl font-extrabold">{years}</span>
              <span className="mt-1 text-xs font-semibold tracking-[0.14em] uppercase">
                anos de mercado
              </span>
            </div>
          )}
        </div>

        <div className="order-1 lg:order-2">
          <SectionHeading eyebrow={eyebrow ?? undefined} title={title} />
          {paragraphs.map((paragraph, i) => (
            <p
              key={i}
              className={`${i === 0 ? "mt-6" : "mt-4"} text-base leading-relaxed text-gray-medium md:text-lg`}
            >
              {paragraph}
            </p>
          ))}
          <a
            href="#servicos"
            className="group mt-8 inline-flex items-center gap-2 text-base font-semibold text-primary transition-colors hover:text-primary-dark"
            {...cta.handlers}
          >
            <RollingText text="Conheça nossos serviços" active={cta.active} />
            <ArrowRightIcon className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
          </a>
        </div>
      </div>
    </section>
  );
}
