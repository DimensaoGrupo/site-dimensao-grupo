"use client";

import { useRef } from "react";
import Image from "next/image";
import { motion, type PanInfo } from "motion/react";
import { useGSAP } from "@gsap/react";
import { gsap } from "@/lib/gsap";
import { useCarouselAutoplay } from "@/hooks/useCarouselAutoplay";
import { useRollingHover } from "@/hooks/useRollingHover";
import CarouselProgress from "./CarouselProgress";
import RollingText from "./RollingText";

export type HeroSlide = {
  id: number;
  image: string;
  eyebrow: string;
  title: string;
  text: string;
};

const AUTOPLAY_MS = 6500;
const DRAG_OFFSET_THRESHOLD = 60;
// Motion reports velocity in px/ms (not px/s) — ~0.5 is a brisk flick.
const DRAG_VELOCITY_THRESHOLD = 0.5;

// Original bottom-anchored composition, restored as-is (see #home in
// globals.css for the one surgical addition: a min-height floor that only
// kicks in on short, wide "notebook" viewports — this file/structure is
// otherwise unchanged from the version that looked right on every other
// screen).
const HERO_SECTION_CLASS =
  "relative isolate h-[92vh] min-h-[560px] w-full overflow-hidden bg-[#201a1a] pt-24 md:pt-[124px]";
const HERO_CONTENT_CLASS =
  "container-page relative z-10 flex h-full items-end pb-24 md:pb-28";

export default function HeroClient({ slides }: { slides: HeroSlide[] }) {
  const rootRef = useRef<HTMLElement>(null);
  const imageRefs = useRef<(HTMLDivElement | null)[]>([]);
  const textRefs = useRef<(HTMLDivElement | null)[]>([]);
  const prevIndexRef = useRef(0);

  const { index, progress, goTo, next, prev, isReducedMotion, interactionHandlers } =
    useCarouselAutoplay({ slideCount: slides.length, durationMs: AUTOPLAY_MS });
  // Every slide shares the same CTA copy and only the active one is ever
  // interactive (the rest are pointer-events-none), so one shared hover
  // state is enough — no need to key it per slide.
  const ctaRoll = useRollingHover();

  useGSAP(
    () => {
      gsap.set(imageRefs.current[0], { autoAlpha: 1, scale: 1 });
      gsap.set(imageRefs.current.slice(1), { autoAlpha: 0, scale: 1.08 });
      gsap.set(textRefs.current[0]?.children ?? [], { y: 0, autoAlpha: 1 });
      gsap.set(
        textRefs.current.slice(1).flatMap((el) => (el ? [...el.children] : [])),
        { y: 24, autoAlpha: 0 },
      );
    },
    { scope: rootRef },
  );

  useGSAP(
    () => {
      const previous = prevIndexRef.current;
      if (previous === index) return;

      // A click before the previous crossfade finishes retriggers this
      // effect while its tweens are still running. GSAP's per-tween
      // overwrite doesn't reliably win that race — especially against the
      // incoming image's `fromTo`, which forces a hard reset — so multiple
      // slides were being left stuck at overlapping partial opacity. Killing
      // everything first guarantees a clean baseline for the new crossfade.
      gsap.killTweensOf(imageRefs.current.filter(Boolean));
      gsap.killTweensOf(
        textRefs.current.flatMap((el) => (el ? [...el.children] : [])),
      );

      // A slide that's neither outgoing nor incoming *this* transition can
      // still have been interrupted mid-fade by an earlier one (rapid
      // clicking through 3+ slides) — killing its tween alone leaves it
      // parked at whatever opacity it was at, not fully hidden. Pin every
      // uninvolved slide back to its resting state explicitly.
      imageRefs.current.forEach((img, i) => {
        if (img && i !== previous && i !== index) {
          gsap.set(img, { autoAlpha: 0, scale: 1.08 });
        }
      });
      textRefs.current.forEach((textEl, i) => {
        if (textEl && i !== previous && i !== index) {
          gsap.set([...textEl.children], { y: 24, autoAlpha: 0 });
        }
      });

      const dur = isReducedMotion ? 0.2 : 1.1;
      const outTextDur = isReducedMotion ? 0.15 : 0.4;
      const inTextDelay = outTextDur + 0.15;
      const outgoingImg = imageRefs.current[previous];
      const incomingImg = imageRefs.current[index];
      const outgoingText = textRefs.current[previous];
      const incomingText = textRefs.current[index];

      gsap.to(outgoingImg, { autoAlpha: 0, duration: dur, ease: "power2.inOut" });
      gsap.fromTo(
        incomingImg,
        { autoAlpha: 0, scale: 1.08 },
        { autoAlpha: 1, scale: 1, duration: dur + 3.5, ease: "power1.out" },
      );

      if (outgoingText) {
        gsap.to([...outgoingText.children], {
          y: -18,
          autoAlpha: 0,
          duration: outTextDur,
          ease: "power2.in",
        });
      }
      if (incomingText) {
        gsap.fromTo(
          [...incomingText.children],
          { y: 24, autoAlpha: 0 },
          {
            y: 0,
            autoAlpha: 1,
            duration: 0.8,
            ease: "power3.out",
            stagger: 0.1,
            delay: inTextDelay,
          },
        );
      }

      prevIndexRef.current = index;
    },
    { dependencies: [index], scope: rootRef },
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
      aria-roledescription="carousel"
      aria-label="Destaques Grupo Dimensão"
      onFocus={interactionHandlers.onFocus}
      onBlur={interactionHandlers.onBlur}
    >
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
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#201a1a]/85 via-[#201a1a]/35 to-[#201a1a]/10" />
        </div>
      ))}

      {/* Invisible drag surface for swipe navigation: sits above the slide
          images but below the text/CTA (which needs its own clicks), and
          snaps straight back (no visual travel) since the crossfade above
          handles the actual transition. */}
      <motion.div
        className="absolute inset-0 touch-pan-y"
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.15}
        onDragStart={interactionHandlers.onDragStart}
        onDragEnd={handleDragEnd}
      />

      <div className={HERO_CONTENT_CLASS}>
        <div className="relative max-w-2xl">
          {slides.map((slide, i) => (
            <div
              key={slide.id}
              ref={(el) => {
                textRefs.current[i] = el;
              }}
              id={`hero-slide-panel-${i}`}
              role="tabpanel"
              aria-labelledby={`hero-slide-tab-${i}`}
              className={
                i === index
                  ? "block"
                  : "pointer-events-none absolute inset-0 opacity-0"
              }
              aria-hidden={i !== index}
            >
              <span className="inline-block rounded-full border border-white/25 bg-white/10 px-4 py-1.5 text-xs font-semibold tracking-[0.18em] text-white backdrop-blur-sm">
                {slide.eyebrow}
              </span>
              <h1 className="mt-5 text-4xl leading-[1.1] font-extrabold text-white md:text-5xl lg:text-6xl">
                {slide.title}
              </h1>
              <p className="mt-5 max-w-lg text-base text-white/85 md:text-lg">
                {slide.text}
              </p>
              <a
                href="#contato"
                className="mt-8 inline-flex items-center gap-2 rounded-full bg-primary px-7 py-3.5 text-sm font-semibold text-white transition-colors duration-200 hover:bg-primary-dark"
                {...ctaRoll.handlers}
              >
                <RollingText text="Entre em Contato" active={ctaRoll.active} />
              </a>
            </div>
          ))}
        </div>
      </div>

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
    </section>
  );
}
