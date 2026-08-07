"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "@/lib/gsap";
import { stats } from "@/lib/content";

export default function StatsSection() {
  const rootRef = useRef<HTMLDivElement>(null);
  const valueRefs = useRef<(HTMLSpanElement | null)[]>([]);

  useGSAP(
    () => {
      gsap.fromTo(
        ".stat-item",
        { y: 28, autoAlpha: 0 },
        {
          y: 0,
          autoAlpha: 1,
          duration: 0.7,
          ease: "power3.out",
          stagger: 0.12,
          scrollTrigger: { trigger: rootRef.current, start: "top 80%" },
        },
      );

      stats.forEach((stat, i) => {
        const el = valueRefs.current[i];
        if (!el) return;
        const counter = { value: 0 };
        gsap.to(counter, {
          value: stat.value,
          duration: 1.8,
          ease: "power2.out",
          scrollTrigger: { trigger: rootRef.current, start: "top 80%" },
          onUpdate: () => {
            el.textContent = `${Math.round(counter.value)}${stat.suffix}`;
          },
        });
      });
    },
    { scope: rootRef },
  );

  return (
    <section className="section-y bg-[#f7f6f6]" ref={rootRef}>
      <div className="container-page grid grid-cols-2 gap-x-6 gap-y-12 lg:grid-cols-4">
        {stats.map((stat, i) => (
          <div key={stat.label} className="stat-item text-center">
            <span
              ref={(el) => {
                valueRefs.current[i] = el;
              }}
              className="block font-display text-4xl font-extrabold text-primary md:text-5xl"
            >
              0{stat.suffix}
            </span>
            <span className="mt-3 block text-sm font-medium text-gray-medium md:text-base">
              {stat.label}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}
