"use client";

import { Children, useState, type ReactNode } from "react";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";
import { SectionHeading } from "../../shared/section-heading";
import { useSnapSlider } from "../../shared/use-snap-slider";

type SpotlightCarouselProps = {
  children: ReactNode;
  title: string;
  titleId: string;
  previousLabel: string;
  nextLabel: string;
  /** Time each slide stays before the next one. */
  interval: number;
};

const ARROW = "grid size-10 place-items-center border border-line bg-paper transition-colors hover:border-ink";

/**
 * One slide per view with previous/next buttons beside the title. A progress
 * bar fills while a slide waits and moves on when full; hovering or touching
 * the slide pauses it. With reduced motion there is no bar and no autoplay.
 */
export function SpotlightCarousel({ children, title, titleId, previousLabel, nextLabel, interval }: SpotlightCarouselProps) {
  const slides = Children.toArray(children);
  const count = slides.length;
  const { track, active, goTo, reduced } = useSnapSlider();
  const [held, setHeld] = useState(false);
  const move = (step: number) => goTo((active + step + count) % count);
  const hold = () => setHeld(true);
  const release = () => setHeld(false);

  const arrows =
    count > 1 ? (
      <div className="flex shrink-0 gap-2">
        <button type="button" onClick={() => move(-1)} aria-label={previousLabel} className={ARROW}>
          <FiChevronLeft aria-hidden className="size-5" />
        </button>
        <button type="button" onClick={() => move(1)} aria-label={nextLabel} className={ARROW}>
          <FiChevronRight aria-hidden className="size-5" />
        </button>
      </div>
    ) : null;

  return (
    <div role="region" aria-roledescription="carousel" aria-label={title}>
      <SectionHeading id={titleId} title={title} action={arrows} />
      {count > 1 && !reduced ? (
        <div aria-hidden className="mb-3 h-1 overflow-hidden bg-ink/10">
          {/* Keyed by slide, so the fill starts over after every move. */}
          <div
            key={active}
            onAnimationEnd={() => move(1)}
            style={{ animationDuration: `${interval}ms`, animationPlayState: held ? "paused" : "running" }}
            className="spotlight-progress h-full origin-left bg-dye"
          />
        </div>
      ) : null}
      <ul
        ref={track}
        onPointerEnter={hold}
        onPointerLeave={release}
        onTouchStart={hold}
        onTouchEnd={release}
        className="rail-scroll relative flex gap-3 overflow-x-auto"
      >
        {slides.map((slide, index) => (
          <li key={index} aria-roledescription="slide" className="flex w-full shrink-0">
            {slide}
          </li>
        ))}
      </ul>
    </div>
  );
}
