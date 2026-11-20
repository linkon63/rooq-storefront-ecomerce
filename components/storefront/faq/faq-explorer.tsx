"use client";

import { useMemo, useState } from "react";
import { FiSearch, FiX } from "react-icons/fi";
import { Disclosure } from "@/components/storefront/shared/disclosure";
import type { Messages } from "@/lib/i18n/messages";
import type { Faq, FaqCategory } from "@/utils/storefront/faqs";

const CATEGORY_ORDER: FaqCategory[] = ["delivery", "orders", "sizing", "craft"];

type FaqExplorerProps = {
  faqs: Faq[];
  labels: Messages["faq"];
};

/** Interactive FAQ browser with live keyword search and category filtering. */
export function FaqExplorer({ faqs, labels }: FaqExplorerProps) {
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<FaqCategory | "all">("all");

  const normalizedQuery = query.trim().toLowerCase();

  const counts = useMemo(() => {
    const map: Record<FaqCategory, number> = { delivery: 0, orders: 0, sizing: 0, craft: 0 };
    for (const faq of faqs) map[faq.category] += 1;
    return map;
  }, [faqs]);

  const filtered = useMemo(() => {
    return faqs.filter((faq) => {
      if (activeCategory !== "all" && faq.category !== activeCategory) return false;
      if (!normalizedQuery) return true;
      return faq.question.toLowerCase().includes(normalizedQuery) || faq.answer.toLowerCase().includes(normalizedQuery);
    });
  }, [faqs, activeCategory, normalizedQuery]);

  const showGrouped = activeCategory === "all" && !normalizedQuery;

  const grouped = useMemo(() => {
    if (!showGrouped) return [];
    return CATEGORY_ORDER.map((category) => ({
      category,
      items: filtered.filter((faq) => faq.category === category),
    })).filter((group) => group.items.length > 0);
  }, [filtered, showGrouped]);

  const resetFilters = () => {
    setQuery("");
    setActiveCategory("all");
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4">
        <div className="relative">
          <label htmlFor="faq-search" className="sr-only">
            {labels.searchLabel}
          </label>
          <FiSearch aria-hidden className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-stone" />
          <input
            id="faq-search"
            type="text"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={labels.searchPlaceholder}
            className="h-12 w-full border border-line bg-chalk pr-11 pl-11 text-[0.9375rem] text-ink placeholder:text-stone/75 focus:border-ink focus:outline-none"
          />
          {query ? (
            <button
              type="button"
              onClick={() => setQuery("")}
              aria-label={labels.clearSearch}
              className="absolute top-1/2 right-3 inline-flex size-8 -translate-y-1/2 items-center justify-center text-stone transition-colors hover:text-ink"
            >
              <FiX aria-hidden className="size-4" />
            </button>
          ) : null}
        </div>

        <div className="flex flex-wrap gap-2" role="group" aria-label={labels.eyebrow}>
          <FilterPill
            active={activeCategory === "all"}
            label={labels.allCategories}
            count={faqs.length}
            onClick={() => setActiveCategory("all")}
          />
          {CATEGORY_ORDER.map((category) =>
            counts[category] > 0 ? (
              <FilterPill
                key={category}
                active={activeCategory === category}
                label={labels.categories[category]}
                count={counts[category]}
                onClick={() => setActiveCategory(category)}
              />
            ) : null,
          )}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-start gap-3 border border-line bg-selvedge/25 p-6">
          <h2 className="type-h3">{labels.emptyTitle}</h2>
          <p className="max-w-[48ch] text-[0.9375rem] text-stone">{labels.emptyBody}</p>
          <button
            type="button"
            onClick={resetFilters}
            className="type-label mt-1 inline-flex h-10 items-center bg-ink px-4 text-chalk transition-colors hover:bg-dye"
          >
            {labels.resetFilters}
          </button>
        </div>
      ) : showGrouped ? (
        <div className="flex flex-col gap-10">
          {grouped.map((group, groupIndex) => (
            <section key={group.category} aria-labelledby={`faq-cat-${group.category}`} className="flex flex-col gap-3">
              <div className="flex items-baseline justify-between border-b border-ink/15 pb-2">
                <h2 id={`faq-cat-${group.category}`} className="type-label text-dye">
                  {labels.categories[group.category]}
                </h2>
                <span className="type-meta text-stone">{group.items.length}</span>
              </div>
              <div className="border-t border-line">
                {group.items.map((faq, index) => (
                  <Disclosure key={faq.question} title={faq.question} open={groupIndex === 0 && index === 0}>
                    <p className="max-w-[64ch] text-stone">{faq.answer}</p>
                  </Disclosure>
                ))}
              </div>
            </section>
          ))}
        </div>
      ) : (
        <div className="border-t border-line">
          {filtered.map((faq, index) => (
            <Disclosure key={faq.question} title={faq.question} open={index === 0}>
              <p className="max-w-[64ch] text-stone">{faq.answer}</p>
            </Disclosure>
          ))}
        </div>
      )}
    </div>
  );
}

function FilterPill({
  active,
  label,
  count,
  onClick,
}: {
  active: boolean;
  label: string;
  count: number;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={`type-label inline-flex h-9 items-center gap-2 border px-3.5 transition-colors ${
        active
          ? "border-ink bg-ink text-chalk"
          : "border-line bg-chalk text-ink hover:border-ink hover:bg-selvedge/30"
      }`}
    >
      <span>{label}</span>
      <span className={`type-meta ${active ? "text-chalk/75" : "text-stone"}`}>{count}</span>
    </button>
  );
}

