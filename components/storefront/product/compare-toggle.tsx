"use client";

import Link from "next/link";
import { LuGitCompareArrows } from "react-icons/lu";
import { FiCheck } from "react-icons/fi";
import { useCompareToggle } from "@/hooks/use-compare";
import type { ProductSnapshot } from "@/utils/storefront/snapshots";

/** Full-width "Add to compare" button under the buy actions; once added, a link to the comparison. */
export function CompareToggle({ snapshot }: { snapshot: ProductSnapshot }) {
  const { compared, toggle } = useCompareToggle(snapshot.id);
  const Icon = compared ? FiCheck : LuGitCompareArrows;
  return (
    <div className="flex flex-col gap-2">
      <button
        type="button"
        aria-pressed={compared}
        onClick={() => toggle(snapshot)}
        className={`inline-flex h-12 w-full items-center justify-center gap-2 rounded border px-6 text-sm font-semibold transition-colors ${
          compared ? "border-ink bg-ink text-chalk hover:bg-ink/85" : "border-line text-ink hover:border-ink"
        }`}
      >
        <Icon aria-hidden className="size-5" />
        {compared ? "Added to compare" : "Add to compare"}
      </button>
      {compared ? (
        <Link href="/compare" className="w-fit self-center text-sm font-medium underline underline-offset-4 hover:text-dye-deep">
          View comparison
        </Link>
      ) : null}
    </div>
  );
}
