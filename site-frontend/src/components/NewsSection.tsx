"use client";

import { useRef } from "react";
import Image from "next/image";
import { useGSAP } from "@gsap/react";
import { gsap } from "@/lib/gsap";
import { news } from "@/lib/content";
import { useRollingHover } from "@/hooks/useRollingHover";
import SectionHeading from "./SectionHeading";
import RollingText from "./RollingText";
import { ArrowRightIcon } from "./icons";

function formatDate(iso: string) {
  return new Date(`${iso}T00:00:00`).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

function NewsCard({ item }: { item: (typeof news)[number] }) {
  const readMore = useRollingHover();

  return (
    <article className="news-card group flex flex-col overflow-hidden rounded-2xl border border-gray-light/70 transition-shadow duration-300 hover:shadow-[0_20px_40px_rgba(32,26,26,0.1)]">
      <div className="news-card-media relative aspect-[16/10] w-full overflow-hidden">
        <Image
          src={item.image}
          alt=""
          fill
          sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />
      </div>
      <div className="flex flex-1 flex-col p-6">
        <time
          dateTime={item.date}
          className="text-xs font-semibold tracking-[0.1em] text-gray-medium uppercase"
        >
          {formatDate(item.date)}
        </time>
        <h3 className="mt-3 text-base leading-snug font-bold text-foreground">
          {item.title}
        </h3>
        <p className="mt-2.5 flex-1 text-sm leading-relaxed text-gray-medium">
          {item.excerpt}
        </p>
        <a
          href="#"
          className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-primary transition-colors hover:text-primary-dark"
          {...readMore.handlers}
        >
          <RollingText text="Leia mais" active={readMore.active} />
          <ArrowRightIcon className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
        </a>
      </div>
    </article>
  );
}

export default function NewsSection() {
  const rootRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      gsap.fromTo(
        ".news-card",
        { y: 32, autoAlpha: 0 },
        {
          y: 0,
          autoAlpha: 1,
          duration: 0.7,
          ease: "power3.out",
          stagger: 0.1,
          scrollTrigger: { trigger: rootRef.current, start: "top 78%" },
        },
      );
      // Wrapper (not the <Image> itself) so the entrance settle doesn't
      // fight the existing CSS hover-zoom, which animates the image's own
      // transform independently.
      gsap.fromTo(
        ".news-card-media",
        { scale: 1.08 },
        {
          scale: 1,
          duration: 1,
          ease: "power3.out",
          stagger: 0.1,
          scrollTrigger: { trigger: rootRef.current, start: "top 78%" },
        },
      );
    },
    { scope: rootRef },
  );

  return (
    <section id="noticias" className="section-y bg-white" ref={rootRef}>
      <div className="container-page">
        <SectionHeading
          eyebrow="Blog"
          title="Últimas Notícias"
          description="Conteúdo produzido pelos nossos especialistas para manter você atualizado sobre segurança patrimonial."
        />

        <div className="mt-14 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {news.map((item) => (
            <NewsCard key={item.title} item={item} />
          ))}
        </div>
      </div>
    </section>
  );
}
