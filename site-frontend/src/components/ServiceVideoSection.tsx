"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { useGSAP } from "@gsap/react";
import { gsap } from "@/lib/gsap";

// The real video provided for Portaria Remota — lives only on this page,
// where a visitor who already read "O Serviço" is ready to see the Central
// de Atendimento in action (the Home no longer has any Portaria Remota
// section at all). Not CMS-driven — a single hardcoded asset for one
// specific service doesn't warrant a second content mechanism (same
// reasoning ServiceView.tsx documents for CtaBand's copy). This component is
// only ever rendered for the portaria-remota service — see ServiceView.tsx.
const YOUTUBE_ID = "qZg2U92S0io";

function PlayIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden="true">
      <path d="M8 5v14l11-7z" />
    </svg>
  );
}

/**
 * Click-to-play facade — the service's own hero photo doubles as the
 * video's poster, so nothing loads from YouTube until the visitor clicks.
 */
function VideoFrame({ image, alt }: { image: string; alt: string }) {
  const [playing, setPlaying] = useState(false);

  if (playing) {
    return (
      <iframe
        src={`https://www.youtube-nocookie.com/embed/${YOUTUBE_ID}?autoplay=1`}
        title="Vídeo institucional — Portaria Remota, Grupo Dimensão"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        className="absolute inset-0 h-full w-full"
      />
    );
  }

  return (
    <button
      type="button"
      onClick={() => setPlaying(true)}
      className="group absolute inset-0 h-full w-full cursor-pointer"
      aria-label="Assistir ao vídeo institucional sobre Portaria Remota"
    >
      <Image
        src={image}
        alt={alt}
        fill
        sizes="(min-width: 1024px) 60vw, 100vw"
        unoptimized={image.endsWith(".svg")}
        className="object-cover"
      />
      <span className="absolute inset-0 bg-ink/25 transition-colors duration-300 group-hover:bg-ink/35" />
      <span className="absolute inset-0 flex items-center justify-center">
        <span className="flex h-16 w-16 items-center justify-center rounded-full bg-white/95 text-ink shadow-lg transition-transform duration-300 group-hover:scale-105 md:h-20 md:w-20">
          <PlayIcon className="ml-1 h-6 w-6 md:h-7 md:w-7" />
        </span>
      </span>
    </button>
  );
}

type ServiceVideoSectionProps = {
  image: string;
  title: string;
  /** Reuses the service's own heroSubheading ("Central de Atendimento 24h") — no new copy invented for this label. */
  caption: string;
};

export default function ServiceVideoSection({ image, title, caption }: ServiceVideoSectionProps) {
  const rootRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.fromTo(
          ".video-fade",
          { y: 24, autoAlpha: 0 },
          {
            y: 0,
            autoAlpha: 1,
            duration: 0.7,
            ease: "power3.out",
            scrollTrigger: { trigger: rootRef.current, start: "top 80%" },
          },
        );
      });

      mm.add("(prefers-reduced-motion: reduce)", () => {
        gsap.set(".video-fade", { y: 0, autoAlpha: 1 });
      });

      return () => mm.revert();
    },
    { scope: rootRef },
  );

  return (
    <section className="section-y bg-white" ref={rootRef}>
      <div className="container-page">
        <span className="video-fade block text-center text-xs font-bold tracking-[0.2em] text-primary uppercase">
          {caption}
        </span>
        <div className="video-fade relative mx-auto mt-6 aspect-video w-full max-w-4xl overflow-hidden rounded-3xl bg-ink shadow-[0_20px_45px_rgba(32,26,26,0.12)]">
          <VideoFrame image={image} alt={title} />
        </div>
      </div>
    </section>
  );
}
