"use client";

import Image from "next/image";
import Link from "next/link";
import { displayPrice } from "@/utils/storefront/variant-selection";
import { AddToBag } from "../product/add-to-bag";
import { BackInStockForm } from "../product/back-in-stock-form";
import { ColorPicker } from "../product/color-picker";
import { useProductSelection } from "../product/selection-context";
import { SizeGuideDialog } from "../product/size-guide-dialog";
import { SizePicker } from "../product/size-picker";
import { Price } from "../shared/price";

export function QuickViewBody({ onDone }: { onDone: () => void }) {
  const { state, meta } = useProductSelection();
  const { product, gallery, variant, color } = meta;
  const lead = gallery[0] ?? null;
  const { price, compareAtPrice } = displayPrice(product, variant);
  const lowStock = variant?.inStock ? variant.lowStockCount : null;

  return (
    <div className="grid gap-6 p-4 md:grid-cols-2 md:p-6">
      <div key={color?.id} className="relative aspect-[3/4] overflow-hidden bg-selvedge animate-[fade-in_.3s_ease-out]">
        {lead ? (
          <Image src={lead.url} alt={lead.alt ?? product.name} fill sizes="(min-width: 768px) 420px, 90vw" className="object-cover" />
        ) : null}
      </div>
      <div className="flex flex-col gap-5">
        <div>
          <p className="text-sm text-stone">{product.brand.name}</p>
          <h2 className="font-wide text-2xl font-bold leading-tight">{product.name}</h2>
          <Price price={price} compareAtPrice={compareAtPrice} className="mt-2 text-lg" />
        </div>
        <ColorPicker />
        <SizePicker />
        {lowStock !== null ? <p className="text-sm font-semibold text-dye-deep">Only {lowStock} left in this size</p> : null}
        <AddToBag image={lead?.url ?? null} onAdded={onDone} />
        <BackInStockForm />
        <Link href={`/product/${product.slug}`} onClick={onDone} className="text-sm font-semibold underline underline-offset-4">
          See full details
        </Link>
      </div>
      <SizeGuideDialog productId={product.id} chart={product.sizeChart} modelInfo={product.modelInfo} selectedSizeId={state.sizeId} />
    </div>
  );
}
