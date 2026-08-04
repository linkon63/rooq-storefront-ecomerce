"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { PiPlayCircle } from "react-icons/pi";
import { FiX } from "react-icons/fi";

/**
 * Thumbnails ship with the design and already carry their own "Play Video"
 * badge, so the card only adds a hover state. Per-video URLs are not in the API
 * yet, so each card falls back to the YouTube link held in shop settings.
 */
const VIDEOS = [
  // Left column, top to bottom …
  { thumbnail: "/images/home/video-3.png", title: "Organic food — chemical free consumables", url: "" },
  { thumbnail: "/images/home/video-4.png", title: "Straight from the farm", url: "" },
  // … then the right column, which sits a little lower.
  { thumbnail: "/images/home/video-1.png", title: "Fresh local produce", url: "" },
  { thumbnail: "/images/home/video-2.png", title: "What is organic food?", url: "" },
];

/** Pulls the id out of watch, share, embed and shorts URLs alike. */
function youtubeId(url: string): string | null {
  const match = url.match(
    /(?:youtube\.com\/(?:watch\?(?:.*&)?v=|embed\/|shorts\/)|youtu\.be\/)([\w-]{11})/,
  );
  return match ? match[1] : null;
}

export default function VideoGallery({ fallbackUrl = "" }: { fallbackUrl?: string }) {
  const [playingId, setPlayingId] = useState<string | null>(null);

  useEffect(() => {
    if (!playingId) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setPlayingId(null);
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [playingId]);

  const columns = [VIDEOS.slice(0, 2), VIDEOS.slice(2)];

  return (
    <section className="mx-auto max-w-[1600px] px-4 md:px-8">
      <div className="grid gap-5 lg:grid-cols-2 lg:gap-7">
        {columns.map((column, columnIndex) => (
          <div
            key={columnIndex}
            // The right column sits a little lower, as in the design.
            className={`grid gap-5 lg:gap-7 ${columnIndex === 1 ? "lg:mt-10" : ""}`}
          >
            {column.map((video) => {
              const id = youtubeId(video.url || fallbackUrl);

              const card = (
                <>
                  <Image
                    src={video.thumbnail}
                    alt={video.title}
                    fill
                    sizes="(max-width: 1024px) 100vw, 50vw"
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <span className="absolute inset-0 flex items-center justify-center bg-black/30 text-white opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                    <PiPlayCircle size={54} />
                  </span>
                </>
              );

              const shell = "group relative block aspect-video w-full overflow-hidden rounded-lg";

              return id ? (
                <button
                  key={video.thumbnail}
                  type="button"
                  onClick={() => setPlayingId(id)}
                  aria-label={`Play ${video.title}`}
                  className={`${shell} cursor-pointer`}
                >
                  {card}
                </button>
              ) : (
                <div key={video.thumbnail} className={shell}>
                  {card}
                </div>
              );
            })}
          </div>
        ))}
      </div>

      {playingId && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
          role="dialog"
          aria-modal="true"
          aria-label="Video player"
          onClick={() => setPlayingId(null)}
        >
          <div
            className="relative w-full max-w-4xl"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setPlayingId(null)}
              aria-label="Close video"
              className="absolute -top-11 right-0 flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
            >
              <FiX size={18} />
            </button>
            <div className="aspect-video w-full overflow-hidden rounded-lg bg-black">
              <iframe
                src={`https://www.youtube.com/embed/${playingId}?autoplay=1`}
                title="Organishi video"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="h-full w-full"
              />
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
