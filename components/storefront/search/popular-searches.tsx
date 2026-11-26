"use client";

import { useEffect, useState } from "react";
import { listProducts } from "@/lib/shop-api";

const LIMIT = 6;

/** Popular saree names from the catalogue; hidden while loading or if the request fails. */
export function PopularSearches({ onPick }: { onPick: (term: string) => void }) {
  const [names, setNames] = useState<string[]>([]);

  useEffect(() => {
    const controller = new AbortController();
    listProducts({ sort: "popular", limit: LIMIT, facets: false }, controller.signal)
      .then((list) => setNames([...new Set(list.data.map((product) => product.name))]))
      .catch(() => {
        /* Optional shortcuts: typing a search still works without them. */
      });
    return () => controller.abort();
  }, []);

  if (names.length === 0) return null;
  return (
    <div>
      <p className="mb-3 text-sm text-stone">Popular sarees</p>
      <ul className="flex flex-wrap gap-2">
        {names.map((name) => (
          <li key={name}>
            <button type="button" onClick={() => onPick(name)} className="rounded-full border border-line px-3.5 py-1.5 text-left text-sm hover:border-ink">
              {name}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
