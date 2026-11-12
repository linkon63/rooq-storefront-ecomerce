"use client";

import { useState } from "react";
import { catalogApi } from "@/lib/admin-api/catalog";
import type { AdminInventoryRow } from "@/types/catalog-admin";
import { PageHeader } from "../../_components/admin-ui";
import { useAsyncData } from "../_catalog/use-async-data";
import { Card, DataTable } from "../_catalog/table";
import { Pager } from "../_catalog/pager";
import { SelectInput, TextInput } from "../_catalog/field";
import { EmptyBlock, ErrorBlock, LoadingBlock } from "../_catalog/data-states";
import { AdjustStockModal } from "./_components/adjust-stock-modal";
import { MovementsModal } from "./_components/movements-modal";
import { InventoryRowView } from "./_components/inventory-row";
import { StockSummary } from "./_components/stock-summary";

type Filter = "all" | "low" | "out" | "attention";

const FILTER_PARAMS: Record<Filter, Record<string, string>> = {
  all: {},
  low: { lowStock: "true" },
  out: { outOfStock: "true" },
  attention: { lowStock: "true", outOfStock: "true", sort: "stock_asc" },
};

export default function StockPage() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const [page, setPage] = useState(1);
  const [adjusting, setAdjusting] = useState<AdminInventoryRow | null>(null);
  const [history, setHistory] = useState<AdminInventoryRow | null>(null);
  const params = new URLSearchParams({ page: String(page), limit: "30", ...FILTER_PARAMS[filter], ...(search.trim() ? { search: search.trim() } : {}) });
  const rows = useAsyncData(() => catalogApi.inventory.list(params), params.toString());
  const report = useAsyncData(() => catalogApi.inventory.lowStock(5), "low-stock");

  const pickFilter = (next: Filter) => {
    setFilter(next);
    setPage(1);
  };

  return (
    <div className="grid gap-6 pb-10">
      <PageHeader title="Stock" description="Stock per size and colour. Every change is written to the stock ledger." />
      {report.data ? <StockSummary report={report.data} onFilter={pickFilter} /> : null}
      <Card>
        <div className="flex flex-wrap items-center gap-3 border-b border-slate-100 px-4 py-3">
          <div className="w-72"><TextInput type="search" aria-label="Search stock" placeholder="Product, style code, SKU or barcode" value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} /></div>
          <div className="w-52">
            <SelectInput aria-label="Filter" value={filter} onChange={(e) => pickFilter(e.target.value as Filter)}>
              <option value="all">All variants</option>
              <option value="attention">Needs attention</option>
              <option value="low">Running low</option>
              <option value="out">Sold out</option>
            </SelectInput>
          </div>
        </div>
        {rows.loading ? <LoadingBlock label="Loading stock" /> : null}
        {rows.error ? <div className="p-4"><ErrorBlock message={rows.error} onRetry={rows.reload} /></div> : null}
        {rows.data && !rows.loading ? (
          rows.data.data.length ? (
            <>
              <DataTable headings={["Product", "Colour / size", "SKU", "Stock", "Alert at", "Status", ""]} minWidth={900}>
                {rows.data.data.map((row) => (
                  <InventoryRowView key={row.id} row={row} onAdjust={() => setAdjusting(row)} onHistory={() => setHistory(row)} />
                ))}
              </DataTable>
              <Pager page={rows.data.meta.page} totalPages={rows.data.meta.totalPages} total={rows.data.meta.total} onPage={setPage} />
            </>
          ) : (
            <EmptyBlock title="Nothing matches" body="No variants match this search or filter. Variants appear here once a product has sizes and colours." />
          )
        ) : null}
      </Card>
      {adjusting ? (
        <AdjustStockModal
          row={adjusting}
          onClose={() => setAdjusting(null)}
          onSaved={(updated) => {
            setAdjusting(null);
            rows.setData((current) => current && { ...current, data: current.data.map((r) => (r.id === updated.id ? updated : r)) });
            void report.reload();
          }}
        />
      ) : null}
      {history ? <MovementsModal variantId={history.id} title={`Stock history · ${history.sku}`} onClose={() => setHistory(null)} /> : null}
    </div>
  );
}
