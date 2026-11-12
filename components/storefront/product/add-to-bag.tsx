"use client";

import { FiShoppingBag } from "react-icons/fi";
import { ERROR_MESSAGES } from "@/lib/constants/error-messages";
import { useAddToBag } from "./use-add-to-bag";

type AddToBagProps = {
  image: string | null;
  className?: string;
  /** Called after a successful add (quick view closes itself). */
  onAdded?: () => void;
};

export function AddToBag({ image, className = "", onAdded }: AddToBagProps) {
  const { addToBag, label, soldOut, pending, colorMissing } = useAddToBag(image);
  return (
    <div className={className}>
      <button
        type="button"
        onClick={async () => {
          if (await addToBag()) onAdded?.();
        }}
        disabled={pending}
        aria-disabled={soldOut}
        className={`inline-flex h-12 w-full items-center justify-center gap-2 rounded px-6 text-sm font-semibold transition-colors ${
          soldOut ? "bg-selvedge text-stone" : "bg-ink text-chalk hover:bg-ink-soft"
        }`}
      >
        <FiShoppingBag aria-hidden className="size-4" />
        {label}
      </button>
      {colorMissing ? (
        <p role="alert" className="mt-2 text-sm text-dye-deep">
          {ERROR_MESSAGES.variant.selectColor}
        </p>
      ) : null}
    </div>
  );
}
