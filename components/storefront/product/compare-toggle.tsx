"use client";

import Link from "next/link";
import { useCompareToggle } from "@/hooks/use-compare";
import type { ProductSnapshot } from "@/utils/storefront/snapshots";

export function CompareToggle({ snapshot }: { snapshot: ProductSnapshot }) {
  const { compared, toggle } = useCompareToggle(snapshot.id);
  return (
    <div className="flex items-center gap-3 text-sm">
      <label className="inline-flex items-center gap-2">
        <input
          type="checkbox"
          checked={compared}
          onChange={() => toggle(snapshot)}
          className="size-4 accent-[var(--color-ink)]"
        />
        Compare
      </label>
      {compared ? (
        <Link href="/compare" className="underline underline-offset-4 hover:text-dye-deep">
          View comparison
        </Link>
      ) : null}
    </div>
  );
}
