import Image from "next/image";
import Link from "next/link";
import { HOME_HERO_INTERVAL_MS } from "@/lib/constants/storefront";
import type { ProductCard } from "@/types/storefront/catalog";
import { Price } from "../shared/price";
import { ScreenImage } from "../shared/screen-image";
import { SnapSlider } from "../shared/snap-slider";

type HeroMobileProductsProps = {
  products: ProductCard[];
  labels: { region: string; dot: string; view: string };
  className?: string;
};

/** Phone hero: the newest pieces, one per slide, moving on every three seconds. */
export function HeroMobileProducts({ products, labels, className = "" }: HeroMobileProductsProps) {
  return (
    <SnapSlider label={labels.region} dotLabel={labels.dot} interval={HOME_HERO_INTERVAL_MS} className={`pt-3 ${className}`}>
      {products.map((product, index) => (
        <Link
          key={product.id}
          href={`/product/${product.slug}`}
          className="relative block aspect-4/5 w-full overflow-hidden bg-selvedge/40"
        >
          {product.image && index === 0 ? (
            <ScreenImage
              hiddenOn="(min-width: 1024px)"
              src={product.image.url}
              alt={product.name}
              fill
              sizes="100vw"
              className="object-cover"
            />
          ) : product.image ? (
            <Image src={product.image.url} alt={product.name} fill sizes="100vw" className="object-cover" />
          ) : null}
          <span className="absolute inset-x-0 bottom-0 flex flex-col gap-1 bg-linear-to-t from-ink/80 via-ink/40 to-transparent px-4 pb-4 pt-16 text-chalk">
            <span className="type-meta truncate uppercase">{product.name}</span>
            <Price price={product.price} compareAtPrice={product.compareAtPrice} className="type-meta" />
            <span className="type-label underline underline-offset-4">{labels.view} →</span>
          </span>
        </Link>
      ))}
    </SnapSlider>
  );
}
