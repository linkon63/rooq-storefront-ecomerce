"use client";

import { useEffect, useState } from "react";
import { catalogApi } from "@/lib/admin-api/catalog";
import { ERROR_MESSAGES } from "@/lib/constants/error-messages";
import { errorText } from "@/utils/api-error";
import { AdminIcon } from "../../../../_components/admin-icons";

export type LinkedProduct = { id: string; name: string };

type Props = { value: LinkedProduct | null; disabled?: boolean; onChange: (next: LinkedProduct | null) => void };

/** Links one product to a slide: search by name, style code or SKU; "Unlink" clears it. */
export function ProductLinkField({ value, disabled, onChange }: Props) {
  const [term, setTerm] = useState("");
  const [results, setResults] = useState<LinkedProduct[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const search = term.trim();
    if (search.length < 2) return;
    const timer = window.setTimeout(async () => {
      try {
        const res = await catalogApi.products.list(new URLSearchParams({ scope: "admin", facets: "false", limit: "6", search }));
        setResults(res.data.map((product) => ({ id: product.id, name: product.name })));
        setError(null);
      } catch (err) {
        setError(errorText(err, ERROR_MESSAGES.ui.loadFailed));
      }
    }, 250);
    return () => window.clearTimeout(timer);
  }, [term]);

  if (value) {
    return (
      <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm">
        <AdminIcon className="h-4 w-4 text-blue-600" name="link" />
        <span className="flex-1 truncate font-semibold text-slate-800">{value.name}</span>
        <button type="button" disabled={disabled} onClick={() => onChange(null)} className="text-xs font-bold text-red-600 hover:underline disabled:opacity-40">
          Unlink
        </button>
      </div>
    );
  }

  return (
    <div className="relative">
      <input
        type="search"
        disabled={disabled}
        value={term}
        onChange={(e) => setTerm(e.target.value)}
        aria-label="Search a product to link"
        placeholder="Link a product (optional): search by name"
        className="h-10 w-full rounded-lg border border-slate-200 px-3 text-sm"
      />
      {term.trim().length >= 2 && results.length ? (
        <ul className="absolute z-10 mt-1 max-h-56 w-full overflow-y-auto rounded-lg border border-slate-200 bg-white shadow-lg">
          {results.map((product) => (
            <li key={product.id}>
              <button
                type="button"
                onClick={() => {
                  onChange(product);
                  setTerm("");
                }}
                className="w-full px-3 py-2 text-left text-sm hover:bg-slate-50"
              >
                {product.name}
              </button>
            </li>
          ))}
        </ul>
      ) : null}
      {error ? <p className="mt-1 text-xs text-red-700">{error}</p> : null}
    </div>
  );
}
