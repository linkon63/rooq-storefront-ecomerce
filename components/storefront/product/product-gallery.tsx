"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import { useState } from "react";
import { FiMaximize2 } from "react-icons/fi";
import { useProductSelection } from "./selection-context";

const GalleryZoom = dynamic(() => import("./gallery-zoom").then((module) => module.GalleryZoom), { ssr: false });

/**
 * Gallery for the selected colour. Phones: a swipeable strip with dots.
 * Desktop: a two-column stack. Any image opens the zoom viewer.
 */
export function ProductGallery() {
  const { meta } = useProductSelection();
  const { gallery, product, color } = meta;
  const [zoomIndex, setZoomIndex] = useState<number | null>(null);
  const [active, setActive] = useState(0);
  const altBase = color ? `${product.name} in ${color.name}` : product.name;

  if (gallery.length === 0) {
    return <div className="aspect-[3/4] w-full bg-selvedge" aria-hidden />;
  }

  return (
    <div key={color?.id ?? "all"} className="animate-[fade-in_.35s_ease-out]">
      <ul
        className="rail-scroll -mx-4 flex overflow-x-auto md:mx-0 md:grid md:grid-cols-2 md:gap-2 md:overflow-visible"
        onScroll={(event) => {
          const node = event.currentTarget;
          setActive(Math.round(node.scrollLeft / Math.max(1, node.clientWidth)));
        }}
      >
        {gallery.map((image, index) => (
          <li key={image.id} className={`relative w-full shrink-0 md:w-auto ${index === 0 ? "md:col-span-2" : ""}`}>
            <button
              type="button"
              onClick={() => setZoomIndex(index)}
              className="group relative block aspect-[3/4] w-full cursor-zoom-in overflow-hidden bg-selvedge"
              aria-label={`Zoom image ${index + 1} of ${gallery.length}`}
            >
              <Image
                src={image.url}
                alt={image.alt ?? `${altBase}, view ${index + 1}`}
                fill
                priority={index === 0}
                sizes={index === 0 ? "(min-width: 1024px) 55vw, 100vw" : "(min-width: 1024px) 27vw, 100vw"}
                className="object-cover"
              />
              <span className="absolute bottom-3 right-3 grid size-9 place-items-center rounded-full bg-paper/90 opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">
                <FiMaximize2 aria-hidden className="size-4" />
              </span>
            </button>
          </li>
        ))}
      </ul>
      {gallery.length > 1 ? (
        <div className="mt-3 flex justify-center gap-1.5 md:hidden" aria-hidden>
          {gallery.map((image, index) => (
            <span key={image.id} className={`h-1 rounded-full transition-all ${index === active ? "w-5 bg-ink" : "w-1.5 bg-line"}`} />
          ))}
        </div>
      ) : null}
      {zoomIndex !== null ? (
        <GalleryZoom images={gallery} startIndex={zoomIndex} altBase={altBase} onClose={() => setZoomIndex(null)} />
      ) : null}
    </div>
  );
}
