import { FaFacebook } from "react-icons/fa6";
import { StarRating } from "../shared/star-rating";
import type { PublicGalleryEntry } from "@/types/gallery";

type GalleryCardProps = { entry: PublicGalleryEntry; onZoom: (imageIndex: number) => void };

/** One entry: tappable photo(s), stars, name, city and feedback. */
export function GalleryCard({ entry, onZoom }: GalleryCardProps) {
  const isFacebook = entry.source === "FACEBOOK";
  return (
    <article className="flex flex-col border border-line bg-paper">
      <div className={isFacebook ? "" : "grid gap-[3px]"}>
        {entry.images.map((image, index) => (
          <button
            key={image.id}
            type="button"
            onClick={() => onZoom(index)}
            aria-label={`Zoom photo ${index + 1} by ${entry.name}`}
            className="block w-full cursor-zoom-in bg-selvedge"
          >
            {/* Media route URLs are served as-is; dimensions reserve the space. */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={image.url}
              alt={image.alt ?? `Photo by ${entry.name}`}
              width={image.width ?? undefined}
              height={image.height ?? undefined}
              loading="lazy"
              className="h-auto w-full"
            />
          </button>
        ))}
      </div>
      <div className="flex flex-col gap-2 p-4">
        <div className="flex items-center justify-between gap-2">
          <StarRating rating={entry.rating} />
          {isFacebook ? (
            <span className="inline-flex items-center gap-1 text-xs text-stone">
              <FaFacebook aria-hidden className="size-3.5" /> Facebook
            </span>
          ) : null}
        </div>
        <p className="text-[0.9375rem] leading-relaxed">{entry.feedback}</p>
        <p className="text-sm font-semibold">
          {entry.name}
          {entry.city ? <span className="font-normal text-stone">, {entry.city}</span> : null}
        </p>
      </div>
    </article>
  );
}
