"use client";

import Link from "next/link";
import { useState } from "react";
import type { ShopCategoryNode } from "@/types/storefront/catalog";
import { categoryHref } from "@/utils/storefront/nav";
import { EmptyState } from "../shared/empty-state";
import { CategoryTile } from "./category-tile";

/** Departments down the left, the chosen one's categories on the right. */
export function CategoryBrowser({ roots }: { roots: ShopCategoryNode[] }) {
  const [selectedId, setSelectedId] = useState(roots[0]?.id ?? null);
  const selected = roots.find((root) => root.id === selectedId);
  if (!selected) {
    return (
      <div className="px-4">
        <EmptyState title="No categories yet" body="Browse every piece in the shop." action={{ label: "Open the shop", href: "/shop" }} />
      </div>
    );
  }
  const children = (selected.children ?? []).filter((child) => child.isActive !== false);

  return (
    <div className="grid min-h-[70dvh] grid-cols-[6.5rem_minmax(0,1fr)] md:grid-cols-[12rem_minmax(0,1fr)]">
      <ul className="border-r border-selvedge bg-selvedge/30">
        {roots.map((root) => (
          <li key={root.id}>
            <button
              type="button"
              aria-pressed={root.id === selected.id}
              onClick={() => setSelectedId(root.id)}
              className={`min-h-14 w-full border-l-4 px-3 py-3 text-left text-sm ${root.id === selected.id ? "border-dye bg-chalk font-semibold" : "border-transparent"}`}
            >
              {root.name}
            </button>
          </li>
        ))}
        <li>
          <Link href="/sale" className="flex min-h-14 items-center border-l-4 border-transparent px-3 text-sm font-semibold text-dye-deep">
            Sale
          </Link>
        </li>
      </ul>
      <div className="flex flex-col gap-4 p-4">
        <ul className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {(children.length ? children : [selected]).map((category) => (
            <li key={category.id}>
              <CategoryTile category={category} />
            </li>
          ))}
        </ul>
        <Link href={categoryHref(selected)} className="press flex h-12 items-center justify-center rounded border border-ink text-sm font-semibold">
          {selected.isComingSoon ? `${selected.name} is coming soon` : `View all ${selected.name}`}
        </Link>
      </div>
    </div>
  );
}
