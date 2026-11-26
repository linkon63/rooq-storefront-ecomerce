"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { displayPrice } from "@/utils/storefront/variant-selection";
import { Modal } from "../shared/modal";
import { Price } from "../shared/price";
import { AddToBag } from "./add-to-bag";
import { BuyNow } from "./buy-now";
import { ColorPicker } from "./color-picker";
import { useProductSelection } from "./selection-context";
import { SizePicker } from "./size-picker";
import { useAddToBag } from "./use-add-to-bag";

/**
 * Phones: Add to bag and Buy now are always on screen. With a colour or size
 * still to choose (or sold out), either one opens the options sheet.
 */
export function PhoneBuyBar({ image }: { image: string | null }) {
  const router = useRouter();
  const { meta } = useProductSelection();
  const { addToBag, soldOut, pending } = useAddToBag(image);
  const [choosing, setChoosing] = useState(false);
  const needsChoice = meta.problem !== null;
  const { price, compareAtPrice } = displayPrice(meta.product, meta.variant);

  async function act(checkout: boolean) {
    if (needsChoice) return setChoosing(true);
    if ((await addToBag()) && checkout) router.push("/checkout");
  }

  return (
    <>
      <div data-action-bar="solo" className="mobile-action-bar flex gap-2 md:hidden">
        <button type="button" disabled={pending} onClick={() => void act(false)} className="press h-12 flex-1 rounded border border-ink text-sm font-semibold disabled:opacity-60">
          {soldOut ? "Sold out: other options" : "Add to bag"}
        </button>
        {soldOut ? null : (
          <button type="button" disabled={pending} onClick={() => void act(true)} className="press h-12 flex-1 rounded bg-ink text-sm font-semibold text-chalk disabled:opacity-60">
            Buy now
          </button>
        )}
      </div>
      <Modal open={choosing} onOpenChange={setChoosing} title="Choose options" placement="bottom">
        <div className="flex flex-col gap-5 p-4 pb-[calc(1rem+env(safe-area-inset-bottom))]">
          <Price price={price} compareAtPrice={compareAtPrice} className="text-lg" />
          <ColorPicker />
          <SizePicker />
          <AddToBag image={image} onAdded={() => setChoosing(false)} />
          <BuyNow image={image} onDone={() => setChoosing(false)} />
        </div>
      </Modal>
    </>
  );
}
