import Image from "next/image";
import Link from "next/link";
import type { HeroSlide } from "@/types/storefront/content";
import { ScreenImage } from "../shared/screen-image";

type HeroSlidePhotoProps = {
  slide: HeroSlide;
  /** Second pass of the looping list: decorative, out of the tab order. */
  copy: boolean;
  eager: boolean;
  sizes: string;
  hiddenOn?: string;
};

/** One look in the hero line-up, linked to its product when it has one. */
export function HeroSlidePhoto({ slide, copy, eager, sizes, hiddenOn }: HeroSlidePhotoProps) {
  const alt = copy ? "" : (slide.product?.name ?? slide.image.alt ?? "");
  const shared = { src: slide.image.url, fill: true, sizes, className: "object-contain" };
  const photo = eager ? <ScreenImage {...shared} alt={alt} hiddenOn={hiddenOn} /> : <Image {...shared} alt={alt} />;
  if (!slide.product) return photo;
  return (
    <Link
      draggable={false}
      href={`/product/${slide.product.slug}`}
      tabIndex={copy ? -1 : undefined}
      aria-label={copy ? undefined : `View details: ${slide.product.name}`}
      className="absolute inset-0 block"
    >
      {photo}
    </Link>
  );
}
