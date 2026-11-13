import Image from "next/image";
import Link from "next/link";
import type { ProductCard as ProductCardData } from "@/types/storefront/catalog";
import { snapshotFromCard } from "@/utils/storefront/snapshots";
import { Price } from "../shared/price";
import { CardActions } from "./card-actions";
import { CardLabel } from "./card-label";
import { CardSwatches } from "./card-swatches";

export const CARD_IMAGE_SIZES = "(min-width: 1280px) 22vw, (min-width: 1024px) 30vw, 50vw";
const FEATURE_IMAGE_SIZES = "(min-width: 1280px) 46vw, (min-width: 1024px) 62vw, 50vw";

type ProductCardProps = {
  product: ProductCardData;
  /** Above-the-fold cards load eagerly. */
  priority?: boolean;
  /** 2×2 tile: the image fills the whole grid area from lg up. */
  feature?: boolean;
};

/**
 * Grid and rail card. No box, no radius: just the photo. On devices with a
 * mouse the name, price and swatches fade up over the photo on hover or
 * keyboard focus; on touch they sit under it. The second photo cross-fades.
 */
export function ProductCard({ product, priority = false, feature = false }: ProductCardProps) {
  const href = `/product/${product.slug}`;
  const alt = product.image?.alt ?? product.name;
  const sizes = feature ? FEATURE_IMAGE_SIZES : CARD_IMAGE_SIZES;
  return (
    <article className="group relative flex h-full flex-col">
      <div
        className={`relative aspect-[3/4] overflow-hidden bg-selvedge/40 ${feature ? "lg:aspect-auto lg:flex-1" : ""}`}
      >
        <Link href={href} className="absolute inset-0" aria-label={product.name}>
          {product.image ? (
            <Image src={product.image.url} alt={alt} fill sizes={sizes} priority={priority} className="object-cover" />
          ) : (
            <span className="type-h2 absolute inset-0 grid place-items-center text-ink/15">rooq</span>
          )}
          {product.hoverImage ? (
            <Image
              src={product.hoverImage.url}
              alt=""
              fill
              sizes={sizes}
              className="object-cover opacity-0 transition-opacity duration-300 ease-(--ease-quiet) [@media(hover:hover)]:group-hover:opacity-100"
            />
          ) : null}
        </Link>
        <div className="pointer-events-none absolute left-2 top-2">
          <CardLabel product={product} />
        </div>
        <CardActions productId={product.id} snapshot={snapshotFromCard(product)} />
      </div>
      <div
        className="flex flex-col gap-1 px-2 pb-1 pt-2 [@media(pointer:fine)]:pointer-events-none [@media(pointer:fine)]:absolute [@media(pointer:fine)]:inset-x-0 [@media(pointer:fine)]:bottom-0 [@media(pointer:fine)]:bg-chalk/90 [@media(pointer:fine)]:p-3 [@media(pointer:fine)]:opacity-0 [@media(pointer:fine)]:transition-opacity [@media(pointer:fine)]:duration-300 [@media(pointer:fine)]:ease-(--ease-quiet) [@media(pointer:fine)]:group-focus-within:opacity-100 [@media(pointer:fine)]:group-hover:opacity-100"
      >
        <h3 className="type-meta uppercase">
          <Link href={href} className="pointer-events-auto hover:underline hover:underline-offset-4">
            {product.name}
          </Link>
        </h3>
        <Price price={product.price} compareAtPrice={product.compareAtPrice} className="type-meta" />
        <CardSwatches colors={product.colors} />
      </div>
    </article>
  );
}
