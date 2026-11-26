"use client";

import { Children, useEffect, useState, type ReactNode } from "react";
import { useSnapSlider } from "./use-snap-slider";

type SnapSliderProps = {
  children: ReactNode;
  /** Accessible name of the slider. */
  label: string;
  /** Dot label with `{n}` for the slide number. */
  dotLabel: string;
  /** Auto-advance every `interval` ms (off with reduced motion or while touched). */
  interval?: number;
  className?: string;
};

/**
 * One slide per view, swiped with native scroll-snap, with dots below. With
 * `interval` it moves on by itself and loops; touching or hovering holds it.
 */
export function SnapSlider({ children, label, dotLabel, interval, className = "" }: SnapSliderProps) {
  const slides = Children.toArray(children);
  const count = slides.length;
  const { track, active, goTo, reduced } = useSnapSlider();
  const [held, setHeld] = useState(false);

  useEffect(() => {
    if (!interval || reduced || held || count < 2) return;
    const timer = window.setInterval(() => {
      const list = track.current;
      if (!list || list.offsetParent === null || document.hidden) return;
      goTo((active + 1) % count);
    }, interval);
    return () => window.clearInterval(timer);
    // goTo only reads the track ref; `active` restarts the wait after each move.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [interval, reduced, held, count, active]);

  const hold = () => setHeld(true);
  const release = () => setHeld(false);

  return (
    <div className={className} role="region" aria-roledescription="carousel" aria-label={label}>
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
      {count > 1 ? (
        <div className="mt-3 flex justify-center gap-1">
          {slides.map((_, index) => (
            <button
              key={index}
              type="button"
              onClick={() => goTo(index)}
              aria-label={dotLabel.replace("{n}", String(index + 1))}
              aria-current={index === active || undefined}
              className="grid size-6 place-items-center"
            >
              <span
                aria-hidden
                className={`h-1.5 rounded-full transition-all duration-300 ${index === active ? "w-5 bg-dye" : "w-1.5 bg-ink/25"}`}
              />
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
