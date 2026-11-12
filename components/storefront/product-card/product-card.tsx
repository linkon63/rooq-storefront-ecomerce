import Image from "next/image";
import Link from "next/link";
import type { ProductCard as ProductCardData } from "@/types/storefront/catalog";
import { snapshotFromCard } from "@/utils/storefront/snapshots";
import { Price } from "../shared/price";
import { CardActions } from "./card-actions";
import { CardLabel } from "./card-label";
import { CardSwatches } from "./card-swatches";

export const CARD_IMAGE_SIZES = "(min-width: 1280px) 22vw, (min-width: 768px) 30vw, 48vw";

type ProductCardProps = {
  product: ProductCardData;
  /** Above-the-fold cards load eagerly. */
  priority?: boolean;
};

/**
 * Grid and rail card. No box: the image sits on a selvedge well, text below,
 * left-aligned. Hover swaps to the second image on devices that can hover.
 * Interactive bits (wishlist, quick view) are a client island beside the link.
 */
export function ProductCard({ product, priority = false }: ProductCardProps) {
  const href = `/product/${product.slug}`;
  const alt = product.image?.alt ?? product.name;
  return (
    <article className="group relative flex flex-col">
      <div className="relative aspect-[3/4] overflow-hidden bg-selvedge">
        <Link href={href} className="absolute inset-0" aria-label={product.name}>
          {product.image ? (
            <Image
              src={product.image.url}
              alt={alt}
              fill
              sizes={CARD_IMAGE_SIZES}
              priority={priority}
              className="object-cover"
            />
          ) : (
            <span className="absolute inset-0 grid place-items-center font-expanded text-3xl font-extrabold text-ink/15">
              rooq
            </span>
          )}
          {product.hoverImage ? (
            <Image
              src={product.hoverImage.url}
              alt=""
              fill
              sizes={CARD_IMAGE_SIZES}
              className="object-cover opacity-0 transition-opacity duration-300 [@media(hover:hover)]:group-hover:opacity-100"
            />
          ) : null}
        </Link>
        <div className="pointer-events-none absolute left-2 top-2">
          <CardLabel product={product} />
        </div>
        <CardActions productId={product.id} snapshot={snapshotFromCard(product)} />
      </div>
      <div className="flex flex-col gap-1 pt-3">
        {product.brand?.name ? <p className="text-xs text-stone">{product.brand.name}</p> : null}
        <h3 className="text-[0.9375rem] font-medium leading-snug">
          <Link href={href} className="hover:underline hover:underline-offset-4">
            {product.name}
          </Link>
        </h3>
        <Price price={product.price} compareAtPrice={product.compareAtPrice} className="text-[0.9375rem]" />
        <CardSwatches colors={product.colors} />
      </div>
    </article>
  );
}
