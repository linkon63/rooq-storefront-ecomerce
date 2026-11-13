"use client";

import { useRouter } from "next/navigation";
import { FiZap } from "react-icons/fi";
import { useAddToBag } from "./use-add-to-bag";

type BuyNowProps = {
  image: string | null;
  className?: string;
  /** Called before leaving for checkout (quick view closes itself). */
  onDone?: () => void;
};

/** Adds the chosen variant to the bag and goes straight to checkout. */
export function BuyNow({ image, className = "", onDone }: BuyNowProps) {
  const router = useRouter();
  const { addToBag, soldOut, pending } = useAddToBag(image);
  return (
    <button
      type="button"
      disabled={pending || soldOut}
      onClick={async () => {
        if (!(await addToBag())) return;
        onDone?.();
        router.push("/checkout");
      }}
      className={`type-ui inline-flex h-12 w-full items-center justify-center gap-2 border border-ink px-6 text-ink transition-colors hover:bg-ink hover:text-chalk disabled:cursor-not-allowed disabled:opacity-40 ${className}`}
    >
      <FiZap aria-hidden className="size-4" />
      Buy now
    </button>
  );
}
