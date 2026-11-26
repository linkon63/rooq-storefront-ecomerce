"use client";

import { useState } from "react";
import { FiClock } from "react-icons/fi";
import { readRecentSearches } from "@/lib/storefront/recent-searches";

/** Mounted only inside the search overlay (client side), so storage is read once on open. */
export function RecentSearches({ onPick }: { onPick: (term: string) => void }) {
  const [terms] = useState(readRecentSearches);
  if (terms.length === 0) return null;
  return (
    <div className="mb-6">
      <p className="mb-1 text-sm text-stone">Recent searches</p>
      <ul>
        {terms.map((term) => (
          <li key={term}>
            <button type="button" onClick={() => onPick(term)} className="press flex h-11 w-full items-center gap-3 text-left text-sm">
              <FiClock aria-hidden className="size-4 text-stone" />
              {term}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
