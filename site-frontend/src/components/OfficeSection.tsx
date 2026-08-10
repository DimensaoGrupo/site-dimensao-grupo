"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "@/lib/gsap";
import SectionHeading from "./SectionHeading";
import { officeInfo } from "@/lib/content";
import { MapPinIcon, PhoneIcon, ArrowRightIcon } from "./icons";

/**
 * Office + map together, matching the "[info][map]" composition suggested
 * for this section. The map is a plain Google Maps `output=embed` iframe —
 * no API key, no new dependency — sized and framed (rounded corners, card
 * treatment) so it reads as part of the layout instead of a raw iframe
 * dropped on the page.
 */
export default function OfficeSection() {
  const rootRef = useRef<HTMLDivElement>(null);
  const mapSrc = `https://www.google.com/maps?q=${encodeURIComponent(officeInfo.fullAddress)}&output=embed`;
  const directionsHref = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(officeInfo.fullAddress)}`;

  useGSAP(
    () => {
      gsap.fromTo(
        ".office-copy",
        { y: 24, autoAlpha: 0 },
        {
          y: 0,
          autoAlpha: 1,
          duration: 0.7,
          ease: "power3.out",
          scrollTrigger: { trigger: rootRef.current, start: "top 78%" },
        },
      );
      gsap.fromTo(
        ".office-map",
        { y: 32, autoAlpha: 0 },
        {
          y: 0,
          autoAlpha: 1,
          duration: 0.8,
          ease: "power3.out",
          delay: 0.15,
          scrollTrigger: { trigger: rootRef.current, start: "top 78%" },
        },
      );
    },
    { scope: rootRef },
  );

  return (
    <section className="section-y bg-[#f7f6f6]" ref={rootRef}>
      <div className="container-page grid grid-cols-1 items-center gap-12 lg:grid-cols-2 lg:gap-16">
        <div className="office-copy">
          <SectionHeading
            eyebrow="Nosso Escritório"
            title="Uma estrutura pronta para atender você"
          />
          <p className="mt-6 text-base leading-relaxed text-gray-medium md:text-lg">
            {officeInfo.description}
          </p>

          <div className="mt-8 overflow-hidden rounded-2xl bg-[#201a1a] p-7 text-white sm:p-8">
            <div className="flex items-start gap-4">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/20 text-primary">
                <MapPinIcon className="h-5 w-5" />
              </span>
              <p className="pt-1.5 text-lg leading-relaxed font-medium text-white">
                {officeInfo.addressLines.join(", ")}
              </p>
            </div>

            <div className="mt-6 flex items-center gap-4 border-t border-white/10 pt-6">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/20 text-primary">
                <PhoneIcon className="h-5 w-5" />
              </span>
              <a
                href={`tel:${officeInfo.phone}`}
                className="text-base font-semibold text-white transition-colors hover:text-primary"
              >
                {officeInfo.phoneLabel}
              </a>
            </div>

            <a
              href={directionsHref}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-7 inline-flex items-center justify-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-white transition-colors duration-200 hover:bg-primary-dark"
            >
              Abrir rota
              <ArrowRightIcon className="h-4 w-4" />
            </a>
          </div>
        </div>

        <div className="office-map relative aspect-[4/3] w-full overflow-hidden rounded-3xl shadow-[0_20px_50px_rgba(32,26,26,0.12)] lg:aspect-square">
          <iframe
            src={mapSrc}
            title="Localização do Grupo Dimensão no mapa"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            className="h-full w-full border-0"
          />
        </div>
      </div>
    </section>
  );
}
