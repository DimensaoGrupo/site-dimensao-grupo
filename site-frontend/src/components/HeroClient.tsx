"use client";

import { useRef } from "react";
import Image from "next/image";
import { motion, type PanInfo } from "motion/react";
import { useGSAP } from "@gsap/react";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { useCarouselAutoplay } from "@/hooks/useCarouselAutoplay";
import { MOTION_DURATION, MOTION_OFFSET, MOTION_STAGGER, GSAP_EASE } from "@/lib/motionTokens";
import CarouselProgress from "./CarouselProgress";
import CtaLink from "./ui/CtaLink";

export type HeroSlide = {
  id: number;
  image: string;
  /** Falls back to `image` when absent — see the <picture>-style pair of <Image> below. */
  mobileImage: string | null;
  eyebrow: string;
  title: string;
  text: string;
  /** Both present or both null (enforced in src/lib/banners/actions.ts) — no CTA renders at all otherwise. */
  ctaLabel: string | null;
  ctaHref: string | null;
};

const AUTOPLAY_MS = 6500;
const DRAG_OFFSET_THRESHOLD = 60;
// Motion reports velocity in px/ms (not px/s) — ~0.5 is a brisk flick.
const DRAG_VELOCITY_THRESHOLD = 0.5;

// `min-h` (not a fixed `h-[92vh]`) + the section itself as a flex column
// anchored to the end — the 92vh figure is a floor for the common case
// (short eyebrow/headline/description), not a ceiling. A longer CMS-entered
// headline/description simply grows the section downward from there; it
// never gets clipped by a fixed box, never slides under the header (the top
// padding below still reserves that space regardless of height), and the
// full-bleed background (absolute inset-0 on bgLayerRef) stretches to match
// whatever height the section ends up at. See #home in globals.css for the
// matching notebook-height floor. Mobile padding is tighter than desktop's
// (pt-16/pb-14 vs pt-[124px]/pb-28) — there's far less vertical room to
// spend on a 390x844-class phone.
const HERO_SECTION_CLASS =
  "relative isolate flex min-h-[92vh] w-full flex-col justify-end overflow-hidden bg-ink pt-16 md:pt-[124px]";
const HERO_CONTENT_CLASS = "container-page relative z-10 pb-14 md:pb-28";

export default function HeroClient({ slides }: { slides: HeroSlide[] }) {
  const rootRef = useRef<HTMLElement>(null);
  const bgLayerRef = useRef<HTMLDivElement>(null);
  const imageRefs = useRef<(HTMLDivElement | null)[]>([]);
  const textRefs = useRef<(HTMLDivElement | null)[]>([]);
  const scrimRef = useRef<HTMLDivElement>(null);
  const techLineRef = useRef<SVGPathElement>(null);
  const prevIndexRef = useRef(0);

  const { index, progress, goTo, next, prev, isReducedMotion, interactionHandlers } =
    useCarouselAutoplay({ slideCount: slides.length, durationMs: AUTOPLAY_MS });

  // --- Entrance: a single cinematic timeline, once, on mount. Nothing here
  // loops or keeps moving after it finishes — the only thing alive
  // afterwards is the (separate) subtle scroll effect below. ---
  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const firstText = textRefs.current[0];
        const tl = gsap.timeline({ defaults: { ease: GSAP_EASE.out } });

        tl.fromTo(
          imageRefs.current[0],
          { autoAlpha: 0, scale: 1.06 },
          { autoAlpha: 1, scale: 1, duration: MOTION_DURATION.slow, ease: GSAP_EASE.outStrong },
        )
          .fromTo(scrimRef.current, { autoAlpha: 0 }, { autoAlpha: 1, duration: MOTION_DURATION.base }, 0.15)
          .fromTo(
            firstText?.querySelector(".hero-kicker") ?? null,
            { y: MOTION_OFFSET.sm, autoAlpha: 0 },
            { y: 0, autoAlpha: 1, duration: MOTION_DURATION.base },
            0.5,
          )
          .fromTo(
            firstText?.querySelector(".hero-headline") ?? null,
            { y: MOTION_OFFSET.lg, autoAlpha: 0 },
            { y: 0, autoAlpha: 1, duration: MOTION_DURATION.slow, ease: GSAP_EASE.outStrong },
            0.62,
          )
          .fromTo(
            firstText?.querySelector(".hero-subheadline") ?? null,
            { y: MOTION_OFFSET.sm, autoAlpha: 0 },
            { y: 0, autoAlpha: 1, duration: MOTION_DURATION.base },
            0.85,
          )
          .fromTo(
            firstText?.querySelector(".hero-cta") ?? null,
            { y: MOTION_OFFSET.sm, autoAlpha: 0 },
            { y: 0, autoAlpha: 1, duration: MOTION_DURATION.base },
            1.0,
          );

        if (techLineRef.current) {
          const length = techLineRef.current.getTotalLength();
          tl.fromTo(
            techLineRef.current,
            { strokeDasharray: length, strokeDashoffset: length, autoAlpha: 0 },
            { strokeDashoffset: 0, autoAlpha: 1, duration: MOTION_DURATION.slow, ease: "power1.inOut" },
            1.1,
          );
        }

        return () => tl.kill();
      });

      // Reduced motion: everything visible immediately, nothing animates in.
      mm.add("(prefers-reduced-motion: reduce)", () => {
        gsap.set(imageRefs.current[0], { autoAlpha: 1, scale: 1 });
        gsap.set(scrimRef.current, { autoAlpha: 1 });
        const firstTextEls = firstTextChildren(textRefs.current[0]);
        if (firstTextEls) gsap.set(firstTextEls, { y: 0, autoAlpha: 1 });
        if (techLineRef.current) gsap.set(techLineRef.current, { autoAlpha: 1, strokeDashoffset: 0 });
      });

      // Slides after the first stay hidden either way until they become active.
      gsap.set(imageRefs.current.slice(1), { autoAlpha: 0, scale: 1.08 });
      gsap.set(
        textRefs.current.slice(1).flatMap((el) => (el ? [...el.children] : [])),
        { y: 0, autoAlpha: 0 },
      );

      return () => mm.revert();
    },
    { scope: rootRef },
  );

  // --- Slide crossfade on index change (multi-banner compatibility — see
  // docs/HOME_IMPLEMENTATION_READINESS.md §2). The tech-line is Hero-level
  // chrome, not per-slide, so it's untouched by this. ---
  useGSAP(
    () => {
      const previous = prevIndexRef.current;
      if (previous === index) return;

      gsap.killTweensOf(imageRefs.current.filter(Boolean));
      gsap.killTweensOf(textRefs.current.flatMap((el) => (el ? [...el.children] : [])));

      imageRefs.current.forEach((img, i) => {
        if (img && i !== previous && i !== index) gsap.set(img, { autoAlpha: 0, scale: 1.08 });
      });
      textRefs.current.forEach((textEl, i) => {
        if (textEl && i !== previous && i !== index) gsap.set([...textEl.children], { y: MOTION_OFFSET.sm, autoAlpha: 0 });
      });

      const dur = isReducedMotion ? 0.2 : MOTION_DURATION.slow;
      const outTextDur = isReducedMotion ? 0.15 : 0.35;
      const inTextDelay = outTextDur + 0.15;
      const outgoingImg = imageRefs.current[previous];
      const incomingImg = imageRefs.current[index];
      const outgoingText = textRefs.current[previous];
      const incomingText = textRefs.current[index];

      gsap.to(outgoingImg, { autoAlpha: 0, duration: dur, ease: "power2.inOut" });
      gsap.fromTo(
        incomingImg,
        { autoAlpha: 0, scale: 1.06 },
        { autoAlpha: 1, scale: 1, duration: dur + 3.2, ease: "power1.out" },
      );

      if (outgoingText) {
        gsap.to([...outgoingText.children], { y: -MOTION_OFFSET.sm, autoAlpha: 0, duration: outTextDur, ease: "power2.in" });
      }
      if (incomingText) {
        gsap.fromTo(
          [...incomingText.children],
          { y: MOTION_OFFSET.sm, autoAlpha: 0 },
          {
            y: 0,
            autoAlpha: 1,
            duration: MOTION_DURATION.base,
            ease: GSAP_EASE.outStrong,
            stagger: MOTION_STAGGER,
            delay: inTextDelay,
          },
        );
      }

      prevIndexRef.current = index;
    },
    { dependencies: [index], scope: rootRef },
  );

  // --- Scroll: very subtle parallax + fade, capped to the Hero's own
  // height (never a long scroll-scrubbed range) — off entirely under
  // reduced motion, not just shortened. ---
  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const trigger = ScrollTrigger.create({
          trigger: rootRef.current,
          start: "top top",
          end: "bottom top",
          scrub: 0.4,
          animation: gsap
            .timeline()
            .to(bgLayerRef.current, { yPercent: 8, ease: "none" }, 0)
            .to(rootRef.current, { autoAlpha: 0.88, ease: "none" }, 0),
        });
        return () => trigger.kill();
      });

      return () => mm.revert();
    },
    { scope: rootRef },
  );

  const handleDragEnd = (_event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    interactionHandlers.onDragEnd();
    if (info.offset.x <= -DRAG_OFFSET_THRESHOLD || info.velocity.x <= -DRAG_VELOCITY_THRESHOLD) {
      next();
    } else if (info.offset.x >= DRAG_OFFSET_THRESHOLD || info.velocity.x >= DRAG_VELOCITY_THRESHOLD) {
      prev();
    }
  };

  if (slides.length === 0) {
    // No active banners — keep the section shell (height/background) so the
    // page below doesn't jump, instead of indexing into an empty array.
    return <section id="home" className={HERO_SECTION_CLASS} />;
  }

  return (
    <section
      id="home"
      ref={rootRef}
      className={HERO_SECTION_CLASS}
      aria-roledescription={slides.length > 1 ? "carousel" : undefined}
      aria-label="Grupo Dimensão"
      onFocus={interactionHandlers.onFocus}
      onBlur={interactionHandlers.onBlur}
    >
      <div ref={bgLayerRef} className="absolute inset-0">
        {/* Opacity here is a CSS fallback for the very first paint (before
            GSAP's useGSAP effect has run) — otherwise every slide renders
            fully visible and stacked on refresh/first mount. GSAP takes over
            via inline styles the moment it runs. */}
        {slides.map((slide, i) => (
          <div
            key={slide.id}
            ref={(el) => {
              imageRefs.current[i] = el;
            }}
            className={`absolute inset-0 ${i === index ? "opacity-100" : "opacity-0"}`}
            aria-hidden={i !== index}
          >
            <Image
              src={slide.image}
              alt=""
              fill
              priority={i === 0}
              sizes="100vw"
              // Next's optimizer 400s on SVG sources unless dangerouslyAllowSVG
              // is set globally (next.config.ts) — out of scope for a Hero-only
              // change. The hand-authored placeholder/illustrative banner
              // assets are trusted local SVGs, so skip the optimizer only for
              // those; real uploaded photos (webp, already sized by the
              // upload pipeline) keep full Next image optimization.
              unoptimized={slide.image.endsWith(".svg")}
              className="hidden object-cover md:block"
            />
            <Image
              src={slide.mobileImage || slide.image}
              alt=""
              fill
              priority={i === 0}
              sizes="100vw"
              unoptimized={(slide.mobileImage || slide.image).endsWith(".svg")}
              className="block object-cover md:hidden"
            />
          </div>
        ))}
      </div>

      <div
        ref={scrimRef}
        className="absolute inset-0 bg-gradient-to-t from-ink/90 via-ink/45 to-ink/15"
      />

      {/* The one tech detail (docs/HOME_EXPERIENCE_BLUEPRINT.md §4, Conceito
          C) — a single line that draws once on load and then sits static as
          a quiet signature. Not a HUD: no loop, no second element, no fake
          data. Hidden on mobile — screen space there is better spent on
          content (see §15 of the same doc). */}
      <svg
        aria-hidden="true"
        viewBox="0 0 220 160"
        className="pointer-events-none absolute top-28 right-10 hidden h-32 w-44 lg:top-32 lg:right-16 xl:block"
      >
        <path
          ref={techLineRef}
          d="M 4 4 L 4 100 L 130 100 L 216 156"
          fill="none"
          stroke="#ffffff"
          strokeOpacity="0.35"
          strokeWidth="1.5"
        />
        <circle cx="4" cy="4" r="3" fill="#932026" />
        <circle cx="216" cy="156" r="2.5" fill="#ffffff" fillOpacity="0.5" />
      </svg>

      {slides.length > 1 && (
        <motion.div
          className="absolute inset-0 touch-pan-y"
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.15}
          onDragStart={interactionHandlers.onDragStart}
          onDragEnd={handleDragEnd}
        />
      )}

      <div className={HERO_CONTENT_CLASS}>
        {/* max-w-3xl (was max-w-2xl/672px) — text-display is a large,
            fluid font (up to 5.5rem), and the narrower cap forced even a
            moderate-length title into 4 lines, far more cramped than the
            CMS admin's own banner preview (a much smaller ad-hoc font in
            BannerForm.tsx, not a shared component) suggests. Widening this
            wrapper is the structural fix — the description paragraph below
            keeps its own separate max-w-lg, so body copy doesn't stretch
            past a comfortable reading width just because the title area
            grew. Still well inside container-page's 1280px cap on every
            desktop breakpoint tested. */}
        <div className="relative max-w-5xl">
          {slides.map((slide, i) => (
            <div
              key={slide.id}
              ref={(el) => {
                textRefs.current[i] = el;
              }}
              id={`hero-slide-panel-${i}`}
              role={slides.length > 1 ? "tabpanel" : undefined}
              aria-labelledby={slides.length > 1 ? `hero-slide-tab-${i}` : undefined}
              className={i === index ? "block" : "pointer-events-none absolute inset-0 opacity-0"}
              aria-hidden={i !== index}
            >
              <span className="hero-kicker block text-caption font-semibold tracking-[0.22em] text-white/70 uppercase">
                {slide.eyebrow}
              </span>
              <h1 className="hero-headline mt-3 text-display leading-[1.05] font-display font-extrabold text-white md:mt-5">
                {slide.title}
              </h1>
              <p className="hero-subheadline mt-4 max-w-lg text-base text-white/85 md:mt-6 md:text-lg">{slide.text}</p>
              {slide.ctaLabel && slide.ctaHref && (
                <div className="hero-cta mt-8">
                  <CtaLink href={slide.ctaHref} label={slide.ctaLabel} size="lg" />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {slides.length > 1 && (
        <div className="absolute inset-x-0 bottom-8 z-10">
          <CarouselProgress
            count={slides.length}
            activeIndex={index}
            progress={progress}
            labels={slides.map((slide) => slide.eyebrow)}
            idPrefix="hero-slide"
            onSelect={goTo}
          />
        </div>
      )}
    </section>
  );
}

function firstTextChildren(el: HTMLDivElement | null) {
  return el ? [...el.children] : null;
}
