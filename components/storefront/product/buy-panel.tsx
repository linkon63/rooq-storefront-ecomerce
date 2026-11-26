"use client";

import { DEPARTMENT_LABELS } from "@/lib/constants/catalog";
import { snapshotFromDetail } from "@/utils/storefront/snapshots";
import { displayPrice } from "@/utils/storefront/variant-selection";
import { WishlistButton } from "../product-card/wishlist-button";
import { LabelTag } from "../shared/label-tag";
import { PhoneBuyBar } from "./phone-buy-bar";
import { Price } from "../shared/price";
import { AddToBag } from "./add-to-bag";
import { BuyNow } from "./buy-now";
import { BackInStockForm } from "./back-in-stock-form";
import { ColorPicker } from "./color-picker";
import { CompareToggle } from "./compare-toggle";
import { useProductSelection } from "./selection-context";
import { SizeGuideDialog } from "./size-guide-dialog";
import { SizePicker } from "./size-picker";
import { StickyBagBar } from "./sticky-bag-bar";
import { StockSpool } from "./stock-spool";

/** Name, price, colour and size pickers, and the bag/wishlist actions. */
export function BuyPanel() {
  const { state, meta } = useProductSelection();
  const { product, variant, gallery } = meta;
  const { price, compareAtPrice } = displayPrice(product, variant);
  const lowStock = variant?.inStock ? variant.lowStockCount : null;
  const leadImage = gallery[0]?.url ?? null;
  const snapshot = snapshotFromDetail(product, leadImage);

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-2">
        <p className="text-sm text-stone">
          {product.brand.name} <span aria-hidden>/</span> {DEPARTMENT_LABELS[product.department]}
        </p>
        <h1 className="font-wide text-[1.75rem] font-bold leading-[1.1] md:text-4xl">{product.name}</h1>
        <div className="flex flex-wrap items-center gap-3">
          <Price price={price} compareAtPrice={compareAtPrice} className="text-lg" />
          {product.isOnSale && product.discountPercent > 0 ? <LabelTag tone="dye">−{product.discountPercent}%</LabelTag> : null}
        </div>
      </header>

      <ColorPicker />
      <SizePicker />

      {lowStock !== null ? <StockSpool left={lowStock} /> : null}

      <div id="buy-actions" className="flex gap-2 max-md:hidden">
        <AddToBag image={leadImage} className="flex-1" />
        <WishlistButton productId={product.id} snapshot={snapshot} variant="labelled" />
      </div>
      <BuyNow image={leadImage} className="max-md:hidden" />
      <StickyBagBar anchorId="buy-actions" image={leadImage} />
      <PhoneBuyBar image={leadImage} />
      <BackInStockForm />
      <CompareToggle snapshot={snapshot} />

      <SizeGuideDialog
        productId={product.id}
        chart={product.sizeChart}
        modelInfo={product.modelInfo}
        selectedSizeId={state.sizeId}
      />
    </div>
  );
}
