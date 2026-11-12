"use client";

import { useState } from "react";
import { toast } from "sonner";
import { catalogApi } from "@/lib/admin-api/catalog";
import { ERROR_MESSAGES } from "@/lib/constants/error-messages";
import { SUCCESS_MESSAGES } from "@/lib/constants/success-messages";
import { errorText } from "@/utils/error-text";
import type { AdminBackInStockSummary } from "@/types/catalog-admin";
import { Button } from "../../_catalog/button";
import { Card, DataTable, StatusPill } from "../../_catalog/table";
import { EmptyBlock } from "../../_catalog/data-states";

/** Most-wanted sizes: restock these first; notify once stock is back. */
export function DemandSummary({ rows, onNotified }: { rows: AdminBackInStockSummary[]; onNotified: () => void }) {
  const [busy, setBusy] = useState<string | null>(null);

  async function notify(row: AdminBackInStockSummary) {
    setBusy(row.variantId);
    try {
      const { notified } = await catalogApi.backInStock.notify(row.variantId);
      toast.success(SUCCESS_MESSAGES.catalog.customersNotified(notified));
      onNotified();
    } catch (err) {
      toast.error(errorText(err, ERROR_MESSAGES.mail.sendFailed));
    } finally {
      setBusy(null);
    }
  }

  return (
    <Card>
      <header className="border-b border-slate-100 px-4 py-3">
        <h2 className="font-semibold text-slate-900">Most requested</h2>
        <p className="text-sm text-slate-500">Pending requests per size. Restocking from zero emails them automatically.</p>
      </header>
      {rows.length ? (
        <DataTable headings={["Product", "Colour / size", "SKU", "Waiting", "Stock", ""]} minWidth={640}>
          {rows.map((row) => (
            <tr key={row.variantId}>
              <td className="px-4 py-3 font-medium text-slate-900">{row.productName}</td>
              <td className="px-4 py-3 text-slate-600">{row.colorName} / {row.sizeLabel}</td>
              <td className="px-4 py-3 font-mono text-xs text-slate-600">{row.sku}</td>
              <td className="px-4 py-3 tabular-nums font-semibold text-slate-900">{row.pending}</td>
              <td className="px-4 py-3">{row.stock > 0 ? <StatusPill tone="green">{row.stock} in stock</StatusPill> : <StatusPill tone="red">Out of stock</StatusPill>}</td>
              <td className="px-4 py-3 text-right">
                <Button tone="secondary" className="h-8" disabled={row.stock <= 0 || busy === row.variantId} onClick={() => notify(row)}>
                  {busy === row.variantId ? "Sending…" : "Email now"}
                </Button>
              </td>
            </tr>
          ))}
        </DataTable>
      ) : (
        <EmptyBlock title="Nobody is waiting" body="When a shopper asks to be told about a sold-out size, it shows up here." />
      )}
    </Card>
  );
}
