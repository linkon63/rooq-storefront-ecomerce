import Image from "next/image";
import Link from "next/link";
import type { ProductCard } from "@/types/storefront/catalog";
import { Price } from "../../shared/price";

/** The product under a reel: photo, name and price, opening its page. */
export function ReelProductLink({ product }: { product: ProductCard }) {
  return (
    <Link href={`/product/${product.slug}`} className="group flex items-center gap-3">
      {product.image ? (
        <span className="relative aspect-[3/4] w-12 shrink-0 overflow-hidden rounded bg-selvedge/40">
          <Image src={product.image.url} alt="" fill sizes="48px" className="object-cover" />
        </span>
      ) : null}
      <span className="flex min-w-0 flex-col gap-1">
        <span className="type-meta truncate uppercase underline-offset-4 group-hover:underline">{product.name}</span>
        <Price price={product.price} compareAtPrice={product.compareAtPrice} className="type-meta" />
      </span>
    </Link>
  );
}
