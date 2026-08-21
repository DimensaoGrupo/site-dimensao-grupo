"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useGSAP } from "@gsap/react";
import { gsap } from "@/lib/gsap";
import { useRollingHover } from "@/hooks/useRollingHover";
import SectionHeading from "./SectionHeading";
import SectionAmbiance from "./SectionAmbiance";
import RollingText from "./RollingText";
import { ArrowRightIcon } from "./icons";

// Matches the flex `gap-8` on the scroll track below — needed in JS to work
// out how far one arrow click should advance the strip.
const TRACK_GAP_PX = 32;
// Above this count the section switches from a static grid to a horizontal
// carousel; below/at it, arrows would have nothing left to reveal.
const CAROUSEL_THRESHOLD = 4;

export type NewsCardData = {
  slug: string;
  title: string;
  excerpt: string | null;
  coverImage: string | null;
  publishedAt: string | null;
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

function NewsCard({ item }: { item: NewsCardData }) {
  const readMore = useRollingHover();

  return (
    <article className="news-card group flex flex-col overflow-hidden rounded-2xl border border-gray-light/70 transition-shadow duration-300 hover:shadow-[0_20px_40px_rgba(32,26,26,0.1)]">
      <div className="news-card-media relative aspect-[16/10] w-full overflow-hidden bg-[#f7f6f6]">
        {item.coverImage && (
          <Image
            src={item.coverImage}
            alt=""
            fill
            sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
        )}
      </div>
      <div className="flex flex-1 flex-col p-6">
        {item.publishedAt && (
          <time
            dateTime={item.publishedAt}
            className="text-xs font-semibold tracking-[0.1em] text-gray-medium uppercase"
          >
            {formatDate(item.publishedAt)}
          </time>
        )}
        <h3 className="mt-3 text-base leading-snug font-bold text-foreground">
          {item.title}
        </h3>
        {item.excerpt && (
          <p className="mt-2.5 flex-1 text-sm leading-relaxed text-gray-medium">
            {item.excerpt}
          </p>
        )}
        <Link
          href={`/blog/${item.slug}`}
          className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-primary transition-colors hover:text-primary-dark"
          {...readMore.handlers}
        >
          <RollingText text="Leia mais" active={readMore.active} />
          <ArrowRightIcon className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
        </Link>
      </div>
    </article>
  );
}

export default function NewsSectionClient({ posts }: { posts: NewsCardData[] }) {
  const rootRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const isCarousel = posts.length > CAROUSEL_THRESHOLD;
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);

  const updateScrollState = useCallback(() => {
    const el = trackRef.current;
    if (!el) return;
    // A few px of slack absorbs sub-pixel rounding at the boundaries so the
    // arrows don't get stuck "enabled" one pixel short of the edge.
    setCanScrollPrev(el.scrollLeft > 4);
    setCanScrollNext(el.scrollLeft < el.scrollWidth - el.clientWidth - 4);
  }, []);

  useEffect(() => {
    if (!isCarousel) return;
    updateScrollState();
    window.addEventListener("resize", updateScrollState);
    return () => window.removeEventListener("resize", updateScrollState);
  }, [isCarousel, updateScrollState]);

  const scrollByCard = (direction: 1 | -1) => {
    const el = trackRef.current;
    if (!el) return;
    const firstCard = el.firstElementChild as HTMLElement | null;
    const step = (firstCard?.offsetWidth ?? el.clientWidth) + TRACK_GAP_PX;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    el.scrollBy({ left: direction * step, behavior: reduceMotion ? "auto" : "smooth" });
  };

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: no-preference)", () => {
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
      });

      mm.add("(prefers-reduced-motion: reduce)", () => {
        gsap.set(".news-card", { y: 0, autoAlpha: 1 });
        gsap.set(".news-card-media", { scale: 1 });
      });

      return () => mm.revert();
    },
    { scope: rootRef, dependencies: [posts.length] },
  );

  return (
    <section
      id="noticias"
      className="section-y relative overflow-hidden bg-white"
      ref={rootRef}
    >
      <SectionAmbiance topFadeFrom="rgba(32,26,26,0.02)" />
      <div className="container-page relative z-10">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <SectionHeading
            eyebrow="Blog"
            title="Últimas Notícias"
            description="Conteúdo produzido pelos nossos especialistas para manter você atualizado sobre segurança patrimonial."
          />
          <div className="mb-1 flex items-center gap-5">
            <Link
              href="/blog"
              className="text-sm font-semibold text-primary transition-colors hover:text-primary-dark"
            >
              Ver todos os posts →
            </Link>
            {isCarousel && (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => scrollByCard(-1)}
                  disabled={!canScrollPrev}
                  aria-label="Notícias anteriores"
                  className="group inline-flex h-9 w-9 items-center justify-center rounded-full border border-gray-light/70 text-foreground transition-all duration-200 hover:border-primary hover:text-primary active:scale-90 disabled:pointer-events-none disabled:opacity-30"
                >
                  <ArrowRightIcon className="h-4 w-4 rotate-180 transition-transform duration-200 group-hover:-translate-x-0.5" />
                </button>
                <button
                  type="button"
                  onClick={() => scrollByCard(1)}
                  disabled={!canScrollNext}
                  aria-label="Próximas notícias"
                  className="group inline-flex h-9 w-9 items-center justify-center rounded-full border border-gray-light/70 text-foreground transition-all duration-200 hover:border-primary hover:text-primary active:scale-90 disabled:pointer-events-none disabled:opacity-30"
                >
                  <ArrowRightIcon className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
                </button>
              </div>
            )}
          </div>
        </div>

        {posts.length === 0 ? (
          <p className="mt-14 text-sm text-gray-medium">Nenhum post publicado ainda.</p>
        ) : isCarousel ? (
          <div
            ref={trackRef}
            onScroll={updateScrollState}
            className="no-scrollbar mt-14 flex snap-x snap-mandatory gap-8 overflow-x-auto scroll-smooth pb-1"
          >
            {posts.map((item) => (
              <div
                key={item.slug}
                className="grid w-full shrink-0 snap-start sm:w-[calc(50%-1rem)] lg:w-[calc(25%-1.5rem)]"
              >
                <NewsCard item={item} />
              </div>
            ))}
          </div>
        ) : (
          <div className="mt-14 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {posts.map((item) => (
              <NewsCard key={item.slug} item={item} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
