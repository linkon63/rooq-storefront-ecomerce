import Image from "next/image";
import type { Look } from "@/types/storefront/catalog";
import { ProductCard } from "../product-card/product-card";

/**
 * "Shop the look": the styled photo beside every piece in it. On phones the
 * pieces scroll sideways under the photo.
 */
export function LookSection({ look, index }: { look: Look; index: number }) {
  const title = look.title ?? `Look ${index + 1}`;
  const headingId = `look-${look.id}`;
  return (
    <section aria-labelledby={headingId} className="grid gap-6 md:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] md:gap-10">
      <div className="relative aspect-[4/5] overflow-hidden bg-selvedge md:sticky md:top-20 md:self-start">
        {look.imageUrl ? <Image src={look.imageUrl} alt={title} fill sizes="(min-width: 768px) 40vw, 100vw" className="object-cover" /> : null}
      </div>
      <div className="flex flex-col gap-5">
        <div>
          <h2 id={headingId} className="font-wide text-2xl font-bold">
            {title}
          </h2>
          {look.description ? <p className="mt-2 max-w-[56ch] text-stone">{look.description}</p> : null}
          <p className="mt-1 text-sm text-stone">{look.products.length} pieces in this look</p>
        </div>
        <ul className="rail-scroll -mx-4 flex gap-3 overflow-x-auto px-4 md:mx-0 md:grid md:grid-cols-2 md:gap-5 md:overflow-visible md:px-0 xl:grid-cols-3">
          {look.products.map((product) => (
            <li key={product.id} className="w-[46%] shrink-0 md:w-auto">
              <ProductCard product={product} />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
