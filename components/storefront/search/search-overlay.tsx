"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";
import { FiSearch } from "react-icons/fi";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { ERROR_MESSAGES } from "@/lib/constants/error-messages";
import { SEARCH_DEBOUNCE_MS } from "@/lib/constants/storefront";
import { searchProducts } from "@/lib/shop-api";
import { useAppDispatch } from "@/lib/store/hooks";
import { setSearchOpen } from "@/lib/store/slices/ui-slice";
import type { ProductCard } from "@/types/storefront/catalog";
import { Modal } from "../shared/modal";
import { SearchResults } from "./search-results";

const SUGGESTIONS = ["Linen shirt", "Wide-leg trousers", "Sneakers", "Denim jacket", "Kurta", "Tote bag"];

/** Type-ahead product search; Enter opens the full shop results. */
export function SearchOverlay() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const [term, setTerm] = useState("");
  const [results, setResults] = useState<ProductCard[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const debounced = useDebouncedValue(term.trim(), SEARCH_DEBOUNCE_MS);
  const close = () => dispatch(setSearchOpen(false));

  useEffect(() => {
    if (debounced.length < 2) return;
    const controller = new AbortController();
    searchProducts(debounced, controller.signal)
      .then((list) => {
        setResults(list.data);
        setError(null);
      })
      .catch(() => {
        if (!controller.signal.aborted) setError(ERROR_MESSAGES.storefront.searchFailed);
      });
    return () => controller.abort();
  }, [debounced]);

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!term.trim()) return;
    close();
    router.push(`/shop?q=${encodeURIComponent(term.trim())}`);
  }

  const showResults = debounced.length >= 2;

  return (
    <Modal open onOpenChange={(open) => (open ? null : close())} title="Search" placement="right">
      <div className="flex flex-col gap-6 px-4 py-5">
        <form role="search" onSubmit={submit} className="relative">
          <label htmlFor="site-search" className="sr-only">
            Search products
          </label>
          <FiSearch aria-hidden className="pointer-events-none absolute left-3 top-1/2 size-5 -translate-y-1/2 text-stone" />
          <input
            id="site-search"
            type="search"
            autoFocus
            value={term}
            onChange={(event) => setTerm(event.target.value)}
            placeholder="Shirts, trainers, linen…"
            autoComplete="off"
            className="h-12 w-full rounded border border-line bg-chalk pl-10 pr-3 text-base"
          />
        </form>
        {showResults ? (
          <SearchResults results={results} error={error} term={debounced} onNavigate={close} />
        ) : (
          <div>
            <p className="mb-3 text-sm text-stone">Popular searches</p>
            <ul className="flex flex-wrap gap-2">
              {SUGGESTIONS.map((suggestion) => (
                <li key={suggestion}>
                  <button
                    type="button"
                    onClick={() => setTerm(suggestion)}
                    className="rounded-full border border-line px-3.5 py-1.5 text-sm hover:border-ink"
                  >
                    {suggestion}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </Modal>
  );
}
