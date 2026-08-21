"use client";

import { useRef } from "react";
import Image from "next/image";
import { useGSAP } from "@gsap/react";
import { gsap } from "@/lib/gsap";
import SectionHeading from "./SectionHeading";
import { aboutImages } from "@/lib/content";

/**
 * Small, asymmetric — one large image plus two stacked beside it — rather
 * than a full gallery grid, per the brief's "poucas imagens grandes e bem
 * utilizadas" preference over filling space.
 */
export default function AboutGallery() {
  const rootRef = useRef<HTMLDivElement>(null);
  const [big, ...rest] = aboutImages.gallery;

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.fromTo(
          ".gallery-item",
          { y: 30, autoAlpha: 0, scale: 1.04 },
          {
            y: 0,
            autoAlpha: 1,
            scale: 1,
            duration: 0.8,
            ease: "power3.out",
            stagger: 0.12,
            scrollTrigger: { trigger: rootRef.current, start: "top 78%" },
          },
        );
      });

      mm.add("(prefers-reduced-motion: reduce)", () => {
        gsap.set(".gallery-item", { y: 0, autoAlpha: 1, scale: 1 });
      });

      return () => mm.revert();
    },
    { scope: rootRef },
  );

  return (
    <section className="section-y bg-white" ref={rootRef}>
      <div className="container-page">
        <SectionHeading
          eyebrow="Nossa Estrutura"
          title="Um retrato de quem cuida do seu patrimônio"
        />

        <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div className="gallery-item relative aspect-[4/5] overflow-hidden rounded-3xl sm:aspect-auto sm:row-span-2">
            <Image
              src={big.src}
              alt={big.alt}
              fill
              sizes="(min-width: 640px) 45vw, 90vw"
              className="object-cover"
              loading="lazy"
            />
          </div>
          {rest.map((img) => (
            <div
              key={img.src}
              className="gallery-item relative aspect-[4/3] overflow-hidden rounded-3xl"
            >
              <Image
                src={img.src}
                alt={img.alt}
                fill
                sizes="(min-width: 640px) 45vw, 90vw"
                className="object-cover"
                loading="lazy"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
