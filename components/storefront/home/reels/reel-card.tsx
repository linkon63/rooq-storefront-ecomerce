"use client";

import { useEffect, useRef, useState } from "react";
import { usePrefersReducedMotion } from "@/hooks/use-media-query";

type ReelCardProps = { src: string; poster?: string; playLabel: string; pauseLabel: string };

/** One looping, silent reel. Plays while on screen; a tap pauses or plays it. */
export function ReelCard({ src, poster, playLabel, pauseLabel }: ReelCardProps) {
  const video = useRef<HTMLVideoElement>(null);
  const reduced = usePrefersReducedMotion();
  /** The shopper's own choice; until they tap, motion preference decides. */
  const [choice, setChoice] = useState<boolean | null>(null);
  const [playing, setPlaying] = useState(false);
  const wanted = choice ?? !reduced;

  useEffect(() => {
    const element = video.current;
    if (!element) return;
    if (!wanted) {
      element.pause();
      return;
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        // A browser may refuse autoplay; the poster and play button stay.
        if (entry.isIntersecting) element.play().catch(() => undefined);
        else element.pause();
      },
      { threshold: 0.5 },
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, [wanted]);

  return (
    <button
      type="button"
      onClick={() => setChoice(!playing)}
      aria-label={playing ? pauseLabel : playLabel}
      className="relative block aspect-[9/16] w-full cursor-pointer overflow-hidden rounded-lg"
    >
      <video
        ref={video}
        src={src}
        poster={poster}
        muted
        loop
        playsInline
        preload="none"
        aria-hidden="true"
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        className="size-full object-cover"
      />
      {playing ? null : (
        <span aria-hidden="true" className="absolute inset-0 m-auto grid size-14 place-items-center rounded-full bg-black/55 text-xl text-white">
          ▶
        </span>
      )}
    </button>
  );
}
