"use client";

import { useState } from "react";
import { useCurrency } from "@/hooks/use-currency";
import { AdminIcon, PageHeader } from "../../_components/admin-shell";
import { WholesaleConvertModal } from "./_components/wholesale-convert-modal";
import { WholesaleDetailModal } from "./_components/wholesale-detail-modal";
import { WholesaleTable } from "./_components/wholesale-table";
import { useWholesaleRequests } from "./_hooks/use-wholesale-requests";

export default function WholesaleRequestsPage() {
  const { symbol } = useCurrency();
  const wholesale = useWholesaleRequests();
  const [converting, setConverting] = useState(false);
  const selected = wholesale.selected;

  return (
    <>
      <PageHeader
        title="Wholesale Requests"
        description="Review B2B requests, approve or reject them, and convert approved requests into wholesale orders."
        action={
          <button aria-label="Refresh" className="grid h-11 w-11 place-items-center rounded-lg border border-slate-300 bg-white shadow-xs hover:bg-slate-50" onClick={() => void wholesale.reload()} type="button">
            <AdminIcon className="h-5 w-5" name="refresh" />
          </button>
        }
      />
      <WholesaleTable
        error={wholesale.error}
        filter={wholesale.filter}
        isLoading={wholesale.isLoading}
        onFilter={wholesale.setFilter}
        onOpen={(request) => void wholesale.open(request)}
        requests={wholesale.requests}
      />
      {selected && !converting ? (
        <WholesaleDetailModal
          busy={wholesale.isActing}
          onClose={wholesale.close}
          onConvert={() => setConverting(true)}
          onStatus={wholesale.setStatus}
          request={selected}
          symbol={symbol}
        />
      ) : null}
      {selected && converting ? (
        <WholesaleConvertModal
          busy={wholesale.isActing}
          onClose={() => {
            setConverting(false);
            wholesale.close();
          }}
          onConvert={(draft) =>
            wholesale.convert({
              addressId: draft.addressId,
              items: draft.items.map((line) => ({ requestItemId: line.requestItemId, quantity: Number(line.quantity || 0), unitPrice: Number(line.unitPrice || 0) })),
              discount: Number(draft.discount || 0),
              shippingCost: Number(draft.shippingCost || 0),
              tax: Number(draft.tax || 0),
            })
          }
          request={selected}
          symbol={symbol}
        />
      ) : null}
    </>
  );
}
