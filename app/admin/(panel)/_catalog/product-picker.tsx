"use client";

import { useEffect, useState } from "react";
import { catalogApi } from "@/lib/admin-api/catalog";
import { ERROR_MESSAGES } from "@/lib/constants/error-messages";
import { errorText } from "@/utils/error-text";
import { moveItem } from "@/utils/catalog/form-values";
import { AdminIcon } from "../../_components/admin-icons";
import { IconButton } from "./button";
import { inputClass } from "./field";

export type PickedProduct = { id: string; name: string; imageUrl: string | null };

/** Search-and-add list of products, kept in the order shown (first = first on the page). */
export function ProductPicker({ value, onChange }: { value: PickedProduct[]; onChange: (next: PickedProduct[]) => void }) {
  const [term, setTerm] = useState("");
  const [results, setResults] = useState<PickedProduct[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const search = term.trim();
    if (search.length < 2) return;
    const timer = window.setTimeout(async () => {
      try {
        const res = await catalogApi.products.list(new URLSearchParams({ scope: "admin", facets: "false", limit: "8", search }));
        setResults(res.data.map((p) => ({ id: p.id, name: p.name, imageUrl: p.image?.url ?? null })));
        setError(null);
      } catch (err) {
        setError(errorText(err, ERROR_MESSAGES.ui.loadFailed));
      }
    }, 250);
    return () => window.clearTimeout(timer);
  }, [term]);

  const chosen = new Set(value.map((p) => p.id));
  const add = (product: PickedProduct) => !chosen.has(product.id) && onChange([...value, product]);

  return (
    <div className="grid gap-3">
      <div className="relative">
        <input className={inputClass} type="search" aria-label="Search products to add" placeholder="Search products by name, style code or SKU" value={term} onChange={(e) => setTerm(e.target.value)} />
        {term.trim().length >= 2 && results.length ? (
          <ul className="absolute z-10 mt-1 max-h-64 w-full overflow-y-auto rounded-lg border border-slate-200 bg-white shadow-lg">
            {results.map((product) => (
              <li key={product.id}>
                <button type="button" disabled={chosen.has(product.id)} onClick={() => add(product)} className="flex w-full items-center gap-3 px-3 py-2 text-left text-sm hover:bg-slate-50 disabled:opacity-40">
                  <Thumb src={product.imageUrl} />
                  <span className="flex-1">{product.name}</span>
                  {chosen.has(product.id) ? <span className="text-xs text-slate-500">Added</span> : <AdminIcon className="h-4 w-4 text-blue-600" name="plus" />}
                </button>
              </li>
            ))}
          </ul>
        ) : null}
      </div>
      {error ? <p className="text-sm text-red-700">{error}</p> : null}
      {value.length ? (
        <ol className="divide-y divide-slate-100 rounded-lg border border-slate-200">
          {value.map((product, index) => (
            <li key={product.id} className="flex items-center gap-3 px-3 py-2 text-sm">
              <span className="w-5 tabular-nums text-slate-400">{index + 1}</span>
              <Thumb src={product.imageUrl} />
              <span className="flex-1 text-slate-800">{product.name}</span>
              <IconButton label={`Move ${product.name} up`} disabled={index === 0} onClick={() => onChange(moveItem(value, index, -1))}><AdminIcon className="h-4 w-4 -rotate-90" name="arrow-right" /></IconButton>
              <IconButton label={`Move ${product.name} down`} disabled={index === value.length - 1} onClick={() => onChange(moveItem(value, index, 1))}><AdminIcon className="h-4 w-4 rotate-90" name="arrow-right" /></IconButton>
              <IconButton label={`Remove ${product.name}`} onClick={() => onChange(value.filter((p) => p.id !== product.id))}><AdminIcon className="h-4 w-4" name="x" /></IconButton>
            </li>
          ))}
        </ol>
      ) : (
        <p className="text-sm text-slate-500">No products added yet.</p>
      )}
    </div>
  );
}

function Thumb({ src }: { src: string | null }) {
  return src ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt="" className="h-10 w-8 rounded object-cover" loading="lazy" />
  ) : (
    <span className="h-10 w-8 rounded bg-slate-100" />
  );
}
