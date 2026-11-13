"use client";

import { useState } from "react";
import { toast } from "sonner";
import { abandonedCartsApi } from "@/lib/admin-api/abandoned-carts";
import { ERROR_MESSAGES } from "@/lib/constants/error-messages";
import { SUCCESS_MESSAGES } from "@/lib/constants/success-messages";
import type { AdminAbandonedCart } from "@/types/commerce/abandoned-cart";
import { errorText } from "@/utils/error-text";
import { PageHeader } from "../../_components/admin-ui";
import { useAsyncData } from "../_catalog/use-async-data";
import { Card } from "../_catalog/table";
import { Pager } from "../_catalog/pager";
import { SelectInput, TextInput } from "../_catalog/field";
import { EmptyBlock, ErrorBlock, LoadingBlock } from "../_catalog/data-states";
import { CartTable } from "./_components/cart-table";

/** Checkouts where the shopper gave a name and phone but never placed the order. */
export default function AbandonedCartsPage() {
  const [status, setStatus] = useState("OPEN");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const params = new URLSearchParams({ page: String(page), limit: "25", ...(status ? { status } : {}), ...(search.trim() ? { search: search.trim() } : {}) });
  const carts = useAsyncData(() => abandonedCartsApi.list(params), params.toString());

  async function remove(row: AdminAbandonedCart) {
    try {
      await abandonedCartsApi.remove(row.id);
      toast.success(SUCCESS_MESSAGES.common.deleted("Cart"));
      await carts.reload();
    } catch (err) {
      toast.error(errorText(err, ERROR_MESSAGES.ui.deleteFailed));
    }
  }

  return (
    <div className="grid gap-6 pb-10">
      <PageHeader title="Abandoned carts" description="Shoppers who typed their name and phone at checkout but did not order. Call or WhatsApp them to finish the order." />
      <Card>
        <div className="flex flex-wrap items-center gap-3 border-b border-slate-100 px-4 py-3">
          <h2 className="mr-auto font-semibold text-slate-900">Carts</h2>
          <div className="w-44">
            <SelectInput aria-label="Status" value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }}>
              <option value="OPEN">Abandoned</option>
              <option value="RECOVERED">Recovered</option>
              <option value="">All</option>
            </SelectInput>
          </div>
          <div className="w-64"><TextInput type="search" aria-label="Search carts" placeholder="Name or phone" value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} /></div>
        </div>
        {carts.loading ? <LoadingBlock label="Loading carts" /> : null}
        {carts.error ? <div className="p-4"><ErrorBlock message={carts.error} onRetry={carts.reload} /></div> : null}
        {carts.data && !carts.loading ? (
          carts.data.data.length ? (
            <>
              <CartTable rows={carts.data.data} onDelete={remove} />
              <Pager page={carts.data.meta.page} totalPages={carts.data.meta.totalPages} total={carts.data.meta.total} onPage={setPage} />
            </>
          ) : (
            <EmptyBlock title="No carts here" body="Carts appear once a shopper enters a name and phone at checkout." />
          )
        ) : null}
      </Card>
    </div>
  );
}
