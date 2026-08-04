"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FiChevronDown, FiChevronUp, FiGrid, FiList, FiX } from "react-icons/fi";

import ProductCard from "./ProductCard";
import type { ShopCategory, ShopProduct } from "@/lib/shop-api";

type Facet = "categories" | "price" | "discount";

const PAGE_SIZES = [9, 12, 15];

const PRICE_BANDS = [
  { id: "0-250", label: "Under ৳250", min: 0, max: 250 },
  { id: "250-500", label: "৳250 – ৳500", min: 250, max: 500 },
  { id: "500-1000", label: "৳500 – ৳1,000", min: 500, max: 1000 },
  { id: "1000-2000", label: "৳1,000 – ৳2,000", min: 1000, max: 2000 },
  { id: "2000-", label: "৳2,000 and above", min: 2000, max: Number.POSITIVE_INFINITY },
];

const DISCOUNT_BANDS = [
  { id: "any", label: "Any discount", min: 1 },
  { id: "10", label: "10% and above", min: 10 },
  { id: "20", label: "20% and above", min: 20 },
  { id: "30", label: "30% and above", min: 30 },
];

const SORTS = [
  { id: "popularity", label: "Popularity" },
  { id: "price-asc", label: "Price: Low to High" },
  { id: "price-desc", label: "Price: High to Low" },
  { id: "name-asc", label: "Name: A to Z" },
];

const discountOf = (product: ShopProduct) =>
  product.originalPrice && product.originalPrice > product.price
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

export default function ShopBrowser({
  products,
  categories,
}: {
  products: ShopProduct[];
  categories: ShopCategory[];
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const searchTerm = searchParams.get("search") ?? "";
  const categoryParam = searchParams.get("category");

  const [openFacet, setOpenFacet] = useState<Facet | null>("categories");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedPrice, setSelectedPrice] = useState<string[]>([]);
  const [selectedDiscount, setSelectedDiscount] = useState<string | null>(null);
  const [pageSize, setPageSize] = useState(12);
  const [sort, setSort] = useState("popularity");
  const [layout, setLayout] = useState<"grid" | "list">("grid");

  // A category can arrive from the header menu or a footer link.
  useEffect(() => {
    setSelectedCategories(categoryParam ? [categoryParam] : []);
  }, [categoryParam]);

  /** Category names with how many products each holds, biggest first. */
  const categoryFacets = useMemo(() => {
    const counts = new Map<string, number>();
    for (const product of products) {
      if (!product.category) continue;
      counts.set(product.category, (counts.get(product.category) ?? 0) + 1);
    }
    // Keep the API's category ordering, then append any not in the tree.
    const ordered = categories.map((c) => c.name).filter((name) => counts.has(name));
    for (const name of counts.keys()) if (!ordered.includes(name)) ordered.push(name);
    return ordered.map((name) => ({ name, count: counts.get(name) ?? 0 }));
  }, [products, categories]);

  const filtered = useMemo(() => {
    let list = products;

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(term) ||
          p.category.toLowerCase().includes(term) ||
          p.team.toLowerCase().includes(term),
      );
    }

    if (selectedCategories.length) {
      list = list.filter((p) => selectedCategories.includes(p.category));
    }

    if (selectedPrice.length) {
      const bands = PRICE_BANDS.filter((band) => selectedPrice.includes(band.id));
      list = list.filter((p) => bands.some((band) => p.price >= band.min && p.price < band.max));
    }

    if (selectedDiscount) {
      const band = DISCOUNT_BANDS.find((b) => b.id === selectedDiscount);
      if (band) list = list.filter((p) => discountOf(p) >= band.min);
    }

    const sorted = [...list];
    if (sort === "price-asc") sorted.sort((a, b) => a.price - b.price);
    if (sort === "price-desc") sorted.sort((a, b) => b.price - a.price);
    if (sort === "name-asc") sorted.sort((a, b) => a.name.localeCompare(b.name));
    if (sort === "popularity") sorted.sort((a, b) => discountOf(b) - discountOf(a));

    return sorted;
  }, [products, searchTerm, selectedCategories, selectedPrice, selectedDiscount, sort]);

  const visible = filtered.slice(0, pageSize);

  const activeChips = [
    ...selectedCategories.map((name) => ({
      key: `cat-${name}`,
      label: `${name}(${categoryFacets.find((c) => c.name === name)?.count ?? 0})`,
      clear: () => setSelectedCategories((prev) => prev.filter((c) => c !== name)),
    })),
    ...selectedPrice.map((id) => ({
      key: `price-${id}`,
      label: PRICE_BANDS.find((band) => band.id === id)?.label ?? id,
      clear: () => setSelectedPrice((prev) => prev.filter((p) => p !== id)),
    })),
    ...(selectedDiscount
      ? [
          {
            key: `disc-${selectedDiscount}`,
            label: DISCOUNT_BANDS.find((b) => b.id === selectedDiscount)?.label ?? selectedDiscount,
            clear: () => setSelectedDiscount(null),
          },
        ]
      : []),
    ...(searchTerm
      ? [{ key: "search", label: `“${searchTerm}”`, clear: () => router.push("/shop") }]
      : []),
  ];

  const clearAll = () => {
    setSelectedCategories([]);
    setSelectedPrice([]);
    setSelectedDiscount(null);
    if (searchTerm || categoryParam) router.push("/shop");
  };

  const toggle = <T,>(list: T[], value: T) =>
    list.includes(value) ? list.filter((entry) => entry !== value) : [...list, value];

  return (
    <>
      {/* ── Page heading ────────────────────────────────────────────────── */}
      <div className="border-b border-gray-100 py-10 text-center md:py-14">
        <nav className="text-sm text-gray-500">
          <Link href="/" className="hover:text-[#4a9e2f]">
            Home
          </Link>
          <span>/ Shop Page</span>
        </nav>
        <h1 className="font-display mt-3 text-4xl font-semibold text-[#1f2a17] md:text-5xl">
          Shop Page
        </h1>
        <p className="mt-2 text-sm text-gray-500">{filtered.length} Items</p>
      </div>

      <div className="mx-auto max-w-[1600px] px-4 md:px-8">
        {/* ── Filter bar ────────────────────────────────────────────────── */}
        <div className="pt-8">
          <p className="text-xs text-gray-500">Filter By</p>

          <div className="mt-2 flex flex-wrap items-center gap-6 border-b border-gray-100 pb-3">
            <FacetToggle
              label="Categories"
              open={openFacet === "categories"}
              onClick={() => setOpenFacet(openFacet === "categories" ? null : "categories")}
            />
            <FacetToggle
              label="Price"
              open={openFacet === "price"}
              onClick={() => setOpenFacet(openFacet === "price" ? null : "price")}
            />
            <FacetToggle
              label="Discount"
              open={openFacet === "discount"}
              onClick={() => setOpenFacet(openFacet === "discount" ? null : "discount")}
            />
          </div>

          {openFacet === "categories" && (
            <div className="flex flex-wrap gap-x-10 gap-y-3 border-b border-gray-100 py-4">
              {categoryFacets.map((facet) => (
                <CheckboxRow
                  key={facet.name}
                  label={facet.name}
                  count={facet.count}
                  checked={selectedCategories.includes(facet.name)}
                  onChange={() => setSelectedCategories((prev) => toggle(prev, facet.name))}
                />
              ))}
              {!categoryFacets.length && (
                <p className="text-sm text-gray-400">No categories available</p>
              )}
            </div>
          )}

          {openFacet === "price" && (
            <div className="flex flex-wrap gap-x-10 gap-y-3 border-b border-gray-100 py-4">
              {PRICE_BANDS.map((band) => (
                <CheckboxRow
                  key={band.id}
                  label={band.label}
                  checked={selectedPrice.includes(band.id)}
                  onChange={() => setSelectedPrice((prev) => toggle(prev, band.id))}
                />
              ))}
            </div>
          )}

          {openFacet === "discount" && (
            <div className="flex flex-wrap gap-x-10 gap-y-3 border-b border-gray-100 py-4">
              {DISCOUNT_BANDS.map((band) => (
                <CheckboxRow
                  key={band.id}
                  label={band.label}
                  checked={selectedDiscount === band.id}
                  onChange={() =>
                    setSelectedDiscount(selectedDiscount === band.id ? null : band.id)
                  }
                />
              ))}
            </div>
          )}
        </div>

        {/* ── Active filters + view controls ────────────────────────────── */}
        <div className="flex flex-wrap items-center justify-between gap-4 py-4">
          <div className="flex flex-wrap items-center gap-3">
            {activeChips.map((chip) => (
              <button
                key={chip.key}
                type="button"
                onClick={chip.clear}
                className="flex items-center gap-2 border border-gray-200 px-3 py-1.5 text-xs text-gray-600 transition-colors hover:border-[#4a9e2f] hover:text-[#4a9e2f]"
              >
                <FiX size={12} />
                {chip.label}
              </button>
            ))}
            {activeChips.length > 0 && (
              <button
                type="button"
                onClick={clearAll}
                className="text-xs text-gray-500 underline hover:text-[#4a9e2f]"
              >
                Clear Filters
              </button>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-1.5 text-xs text-gray-500">
              <span>Show:</span>
              {PAGE_SIZES.map((size, index) => (
                <span key={size} className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setPageSize(size)}
                    className={
                      pageSize === size
                        ? "font-semibold text-[#4a9e2f]"
                        : "hover:text-[#4a9e2f]"
                    }
                  >
                    {size}
                  </button>
                  {index < PAGE_SIZES.length - 1 && <span className="text-gray-300">/</span>}
                </span>
              ))}
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setLayout("grid")}
                aria-label="Grid view"
                aria-pressed={layout === "grid"}
                className={`flex h-8 w-8 items-center justify-center ${
                  layout === "grid" ? "bg-[#1f2a17] text-white" : "text-gray-500 hover:text-[#4a9e2f]"
                }`}
              >
                <FiGrid size={15} />
              </button>
              <button
                type="button"
                onClick={() => setLayout("list")}
                aria-label="List view"
                aria-pressed={layout === "list"}
                className={`flex h-8 w-8 items-center justify-center ${
                  layout === "list" ? "bg-[#1f2a17] text-white" : "text-gray-500 hover:text-[#4a9e2f]"
                }`}
              >
                <FiList size={15} />
              </button>
            </div>

            <div className="flex items-center border border-gray-200">
              <span className="border-r border-gray-200 px-3 py-2 text-xs text-gray-600">
                Sort By
              </span>
              <select
                value={sort}
                onChange={(event) => setSort(event.target.value)}
                aria-label="Sort products"
                className="bg-transparent px-3 py-2 text-xs text-gray-700 outline-none"
              >
                {SORTS.map((option) => (
                  <option key={option.id} value={option.id}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* ── Results ───────────────────────────────────────────────────── */}
        {visible.length ? (
          <div
            className={
              layout === "grid"
                ? "grid grid-cols-2 gap-x-6 gap-y-10 pb-16 md:grid-cols-3 lg:grid-cols-4 lg:gap-x-8 lg:gap-y-12"
                : "grid grid-cols-1 gap-8 pb-16 sm:grid-cols-2"
            }
          >
            {visible.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="py-20 text-center">
            <p className="font-display text-xl text-[#1f2a17]">No products match these filters</p>
            <button
              type="button"
              onClick={clearAll}
              className="mt-4 bg-[#4a9e2f] px-6 py-2.5 text-sm text-white transition-colors hover:bg-[#3d8626]"
            >
              Clear Filters
            </button>
          </div>
        )}

        {visible.length < filtered.length && (
          <div className="pb-16 text-center">
            <button
              type="button"
              onClick={() => setPageSize((size) => size + 12)}
              className="border border-[#4a9e2f] px-8 py-2.5 text-sm text-[#4a9e2f] transition-colors hover:bg-[#4a9e2f] hover:text-white"
            >
              Load more
            </button>
          </div>
        )}
      </div>
    </>
  );
}

function FacetToggle({
  label,
  open,
  onClick,
}: {
  label: string;
  open: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-expanded={open}
      className={`flex items-center gap-1.5 pb-1 text-sm transition-colors ${
        open
          ? "border-b-2 border-[#1f2a17] font-semibold text-[#1f2a17]"
          : "text-gray-600 hover:text-[#4a9e2f]"
      }`}
    >
      {label}
      {open ? <FiChevronUp size={14} /> : <FiChevronDown size={14} />}
    </button>
  );
}

function CheckboxRow({
  label,
  count,
  checked,
  onChange,
}: {
  label: string;
  count?: number;
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <label className="flex cursor-pointer items-center gap-2 text-sm text-gray-700">
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="h-4 w-4 accent-[#1f2a17]"
      />
      <span>{label}</span>
      {count !== undefined && <span className="text-xs text-gray-400">({count})</span>}
    </label>
  );
}
