"use client";

import { type KeyboardEvent } from "react";
import { motion, type MotionValue } from "motion/react";

type CarouselProgressProps = {
  count: number;
  activeIndex: number;
  /** 0→1 dwell progress for the active slide; ignored (dot renders solid) under reduced motion. */
  progress: MotionValue<number>;
  labels: string[];
  idPrefix: string;
  isReducedMotion: boolean;
  onSelect: (index: number) => void;
};

/**
 * Slide picker + autoplay progress indicator, following the WAI-ARIA
 * carousel-tablist pattern: one `role="tab"` per slide, roving tabindex, and
 * arrow-key navigation between them. Each dot's fill uses `scaleX` (not
 * `width`) so the running animation stays on the compositor.
 */
export default function CarouselProgress({
  count,
  activeIndex,
  progress,
  labels,
  idPrefix,
  isReducedMotion,
  onSelect,
}: CarouselProgressProps) {
  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    switch (event.key) {
      case "ArrowRight":
        event.preventDefault();
        onSelect((activeIndex + 1) % count);
        break;
      case "ArrowLeft":
        event.preventDefault();
        onSelect((activeIndex - 1 + count) % count);
        break;
      case "Home":
        event.preventDefault();
        onSelect(0);
        break;
      case "End":
        event.preventDefault();
        onSelect(count - 1);
        break;
    }
  };

  return (
    <div
      role="tablist"
      aria-label="Slides"
      onKeyDown={handleKeyDown}
      className="flex justify-center gap-3"
    >
      {labels.map((label, i) => {
        const isActive = i === activeIndex;
        return (
          <button
            key={label}
            id={`${idPrefix}-tab-${i}`}
            type="button"
            role="tab"
            aria-selected={isActive}
            aria-controls={`${idPrefix}-panel-${i}`}
            tabIndex={isActive ? 0 : -1}
            onClick={() => onSelect(i)}
            aria-label={`Ir para o slide ${i + 1}: ${label}`}
            className="group relative h-2 w-10 overflow-hidden rounded-full bg-white/30"
          >
            <motion.span
              aria-hidden="true"
              className="absolute inset-y-0 left-0 w-full origin-left rounded-full bg-white"
              style={{
                scaleX: isActive ? (isReducedMotion ? 1 : progress) : 0,
              }}
            />
          </button>
        );
      })}
    </div>
  );
}
