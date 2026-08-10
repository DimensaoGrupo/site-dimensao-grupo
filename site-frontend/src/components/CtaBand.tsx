"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "@/lib/gsap";
import { useRollingHover } from "@/hooks/useRollingHover";
import RollingText from "./RollingText";

type CtaBandProps = {
  title?: string;
  text?: string;
  buttonLabel?: string;
  href?: string;
};

/**
 * Closing CTA band — reuses the exact dark radial-gradient treatment from
 * the home MissionSection and the CTA button styling from Hero/Header, so
 * whatever page ends with this still feels like the same site. Shared by
 * /sobre-nos and the service pages; defaults match the original
 * /sobre-nos copy so that page didn't need to change when this became
 * parametrized. `href` defaults to "#contato" (not "/#contato") on the
 * assumption the Footer — which owns that id — renders on the same page;
 * pass "/#contato" explicitly if it doesn't.
 */
export default function CtaBand({
  title = "Pronto para proteger o que mais importa?",
  text = "Fale com nossos consultores e conheça a solução ideal para sua empresa ou condomínio.",
  buttonLabel = "Entre em Contato",
  href = "#contato",
}: CtaBandProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const cta = useRollingHover();

  useGSAP(
    () => {
      gsap.fromTo(
        ".cta-band-fade",
        { y: 20, autoAlpha: 0 },
        {
          y: 0,
          autoAlpha: 1,
          duration: 0.7,
          ease: "power3.out",
          stagger: 0.12,
          scrollTrigger: { trigger: rootRef.current, start: "top 82%" },
        },
      );
    },
    { scope: rootRef },
  );

  return (
    <section
      ref={rootRef}
      className="section-y relative overflow-hidden bg-[#201a1a] bg-[radial-gradient(ellipse_at_top,_#661615_0%,_#201a1a_65%)] bg-[length:100%_140%]"
    >
      <div className="container-page relative z-10 text-center">
        <h2 className="cta-band-fade text-3xl font-extrabold text-white md:text-4xl">
          {title}
        </h2>
        <p className="cta-band-fade mx-auto mt-4 max-w-xl text-base text-white/75 md:text-lg">
          {text}
        </p>
        <a
          href={href}
          className="cta-band-fade mt-8 inline-flex items-center gap-2 rounded-full bg-primary px-7 py-3.5 text-sm font-semibold text-white transition-colors duration-200 hover:bg-primary-dark"
          {...cta.handlers}
        >
          <RollingText text={buttonLabel} active={cta.active} />
        </a>
      </div>
    </section>
  );
}
