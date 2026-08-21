"use client";

import { useRef } from "react";
import Image from "next/image";
import { useGSAP } from "@gsap/react";
import { gsap } from "@/lib/gsap";

export type ClientItem = { id: number; name: string; logo: string };

type TrackItem = ClientItem & { key: string; isOriginal: boolean };

// Below this, repeating even a handful of times still reads as "the same
// couple of logos going by" rather than a flow of clients — a static
// centered row communicates trust better than a stuttering loop of 1-2
// items (see task: "não quero um loop estranho com grandes espaços
// vazios").
const MIN_FOR_MARQUEE = 3;
// The real list is repeated until the track holds at least this many items
// before being duplicated for the seamless loop, so a short client list
// doesn't produce one big empty stretch per lap.
const MIN_TRACK_ITEMS = 10;
// Pixels/second — deliberately slow and constant regardless of how many
// logos exist (duration is derived from the track's actual rendered width,
// not a fixed number), per "movimento... lento; suave; linear".
const DESKTOP_SPEED = 34;
const MOBILE_SPEED = 18;

export default function ClientsSectionClient({ clients }: { clients: ClientItem[] }) {
  const rootRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const tweenRef = useRef<gsap.core.Tween | null>(null);

  const animate = clients.length >= MIN_FOR_MARQUEE;
  const repeatCount = animate ? Math.max(1, Math.ceil(MIN_TRACK_ITEMS / clients.length)) : 1;

  // `isOriginal` marks only the first pass through the real list — every
  // repeat added purely to densify the loop, and the entire duplicated
  // second half added to make it seamless, are flagged as repeats. A global
  // reduced-motion rule (globals.css) hides everything but the originals
  // and lets the track wrap, so a user with reduced motion sees the real,
  // deduplicated client list laid out statically — never a frozen loop
  // mid-repeat, never blank logos waiting on an animation that won't run.
  const baseSet: TrackItem[] = animate
    ? Array.from({ length: repeatCount }, (_, r) =>
        clients.map((c) => ({ ...c, key: `${c.id}-${r}`, isOriginal: r === 0 })),
      ).flat()
    : clients.map((c) => ({ ...c, key: `${c.id}-0`, isOriginal: true }));

  const trackItems: TrackItem[] = animate
    ? [...baseSet, ...baseSet.map((item) => ({ ...item, key: `${item.key}-dup`, isOriginal: false }))]
    : baseSet;

  useGSAP(
    () => {
      if (!animate || !trackRef.current) return;

      const mm = gsap.matchMedia();

      // Two separate mm.add() calls — same proven pattern as every other
      // reduced-motion branch in this codebase (StatsSectionClient,
      // SectionHeading, CertificationsSectionClient, ...). The combined
      // multi-condition object form (`mm.add({a:query,b:query}, cb)`) was
      // tried here first and silently never invoked its callback at all —
      // confirmed by direct instrumentation (no console output, no inline
      // transform ever applied, track permanently static). Not worth
      // chasing further when the two-call form is already proven reliable
      // everywhere else in this project.
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const halfWidth = trackRef.current!.scrollWidth / 2;
        const isMobile = window.innerWidth < 640;
        const pxPerSecond = isMobile ? MOBILE_SPEED : DESKTOP_SPEED;
        const tween = gsap.to(trackRef.current, {
          xPercent: -50,
          duration: halfWidth / pxPerSecond,
          ease: "none",
          repeat: -1,
        });
        tweenRef.current = tween;

        return () => {
          tween.kill();
          tweenRef.current = null;
        };
      });

      mm.add("(prefers-reduced-motion: reduce)", () => {
        gsap.set(trackRef.current, { xPercent: 0 });
      });

      return () => mm.revert();
    },
    { scope: rootRef, dependencies: [animate, clients.map((c) => c.id).join(",")] },
  );

  const handleEnter = () => {
    if (tweenRef.current) gsap.to(tweenRef.current, { timeScale: 0.12, duration: 0.6, ease: "power2.out" });
  };
  const handleLeave = () => {
    if (tweenRef.current) gsap.to(tweenRef.current, { timeScale: 1, duration: 0.6, ease: "power2.out" });
  };

  return (
    // Same tighter custom padding as StatsSectionClient instead of the
    // shared --section-y token — keeps the two adjacent compact "strip"
    // sections at a matching rhythm.
    <section className="relative overflow-hidden bg-white py-10 md:py-12 lg:py-14" ref={rootRef}>
      {/* Deliberately not SectionHeading here — no big animated headline,
          just a small centered label so the logos themselves are the
          protagonist (see task: "quero uma composição muito mais discreta
          e elegante... sem headline grande abaixo; sem texto explicativo").
          Sized up one notch from the first pass (text-xs -> text-sm/base)
          — it was reading as too small/isolated to work as the section's
          title, even though it's deliberately not a full headline. */}
      <p className="text-center text-sm font-bold tracking-[0.2em] text-primary uppercase md:text-base">
        Alguns dos nossos clientes
      </p>

      <div
        className={
          animate
            ? "clients-marquee-mask relative mt-5 overflow-hidden md:mt-6"
            : "container-page mt-5 md:mt-6"
        }
        onMouseEnter={animate ? handleEnter : undefined}
        onMouseLeave={animate ? handleLeave : undefined}
      >
        <div
          ref={trackRef}
          className={
            animate
              ? "clients-marquee-track flex w-max items-center gap-x-10 sm:gap-x-14 lg:gap-x-20"
              : "flex flex-wrap items-center justify-center gap-x-10 gap-y-8 sm:gap-x-14"
          }
        >
          {trackItems.map((client) => (
            <div
              key={client.key}
              className={`relative h-12 w-32 shrink-0 sm:h-16 sm:w-44 md:h-20 md:w-56 lg:h-28 lg:w-72 ${
                client.isOriginal ? "" : "clients-marquee-repeat"
              }`}
            >
              <Image
                src={client.logo}
                alt={client.name}
                fill
                sizes="(min-width: 1024px) 288px, (min-width: 768px) 224px, (min-width: 640px) 176px, 128px"
                unoptimized={client.logo.endsWith(".svg")}
                className="object-contain opacity-75 transition-opacity duration-300 hover:opacity-100"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
