"use client";

import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";
import { catalogApi } from "@/lib/admin-api/catalog";
import { ERROR_MESSAGES } from "@/lib/constants/error-messages";
import { SUCCESS_MESSAGES } from "@/lib/constants/success-messages";
import { PRODUCT_STATUSES, PRODUCT_STATUS_LABELS } from "@/lib/constants/catalog";
import { errorText } from "@/utils/error-text";
import type { AdminProductRow } from "@/types/catalog-admin";
import { PageHeader } from "../../_components/admin-ui";
import { AdminIcon } from "../../_components/admin-icons";
import { ConfirmModal } from "../../_components/confirm-modal";
import { useAsyncData } from "../_catalog/use-async-data";
import { Card, DataTable } from "../_catalog/table";
import { Pager } from "../_catalog/pager";
import { CheckboxField, SelectInput, TextInput } from "../_catalog/field";
import { EmptyBlock, ErrorBlock, LoadingBlock } from "../_catalog/data-states";
import { ProductListRow } from "./_components/product-list-row";

const linkButton = "inline-flex h-10 items-center gap-2 rounded-lg bg-blue-600 px-4 text-sm font-semibold text-white hover:bg-blue-700";

export default function ProductsPage() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [archived, setArchived] = useState(false);
  const [page, setPage] = useState(1);
  const [archiving, setArchiving] = useState<AdminProductRow | null>(null);
  const params = new URLSearchParams({ scope: "admin", facets: "false", page: String(page), limit: "25", ...(status ? { status } : {}), ...(archived ? { includeArchived: "true" } : {}), ...(search.trim() ? { search: search.trim() } : {}) });
  const products = useAsyncData(() => catalogApi.products.list(params), params.toString());

  async function archive() {
    if (!archiving) return;
    try {
      await catalogApi.products.archive(archiving.id);
      toast.success(SUCCESS_MESSAGES.catalog.productArchived);
      setArchiving(null);
      await products.reload();
    } catch (err) {
      toast.error(errorText(err, ERROR_MESSAGES.ui.deleteFailed));
    }
  }

  async function restore(product: AdminProductRow) {
    try {
      await catalogApi.products.restore(product.id);
      toast.success(SUCCESS_MESSAGES.catalog.productRestored);
      await products.reload();
    } catch (err) {
      toast.error(errorText(err, ERROR_MESSAGES.ui.saveFailed));
    }
  }

  const reset = () => setPage(1);
  return (
    <div className="grid gap-6 pb-10">
      <PageHeader title="Products" description="Every style in the catalogue with its colours, sizes and stock." action={<Link href="/admin/products/new" className={linkButton}><AdminIcon className="h-4 w-4" name="plus" />New product</Link>} />
      <Card>
        <div className="flex flex-wrap items-center gap-3 border-b border-slate-100 px-4 py-3">
          <div className="w-72"><TextInput type="search" aria-label="Search products" placeholder="Name, style code, SKU or brand" value={search} onChange={(e) => { setSearch(e.target.value); reset(); }} /></div>
          <div className="w-40">
            <SelectInput aria-label="Status" value={status} onChange={(e) => { setStatus(e.target.value); reset(); }}>
              <option value="">Any status</option>
              {PRODUCT_STATUSES.map((s) => <option key={s} value={s}>{PRODUCT_STATUS_LABELS[s]}</option>)}
            </SelectInput>
          </div>
          <CheckboxField label="Include archived" checked={archived} onChange={(v) => { setArchived(v); reset(); }} />
        </div>
        {products.loading ? <LoadingBlock label="Loading products" /> : null}
        {products.error ? <div className="p-4"><ErrorBlock message={products.error} onRetry={products.reload} /></div> : null}
        {products.data && !products.loading ? (
          products.data.data.length ? (
            <>
              <DataTable headings={["Product", "Brand / category", "Price", "Colours & sizes", "Stock", "Status", ""]} minWidth={1000}>
                {products.data.data.map((product) => (
                  <ProductListRow key={product.id} product={product} onArchive={() => setArchiving(product)} onRestore={() => restore(product)} />
                ))}
              </DataTable>
              <Pager page={products.data.meta.page} totalPages={products.data.meta.totalPages} total={products.data.meta.total} onPage={setPage} />
            </>
          ) : (
            <EmptyBlock title="No products found" body="Clear the filters, or add your first style." action={<Link href="/admin/products/new" className={linkButton}>New product</Link>} />
          )
        ) : null}
      </Card>
      <ConfirmModal isOpen={!!archiving} onClose={() => setArchiving(null)} onConfirm={archive} title="Archive product" message={`Archive "${archiving?.name ?? ""}"? It leaves the shop but stays on past orders. You can restore it later.`} confirmText="Archive" />
    </div>
  );
}
