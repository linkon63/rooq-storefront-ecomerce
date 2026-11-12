"use client";

import type { ProductDiscountBreakdown } from "@/types/admin/reports";
import { formatMoney } from "@/utils/admin/format";
import { useCurrency } from "@/hooks/use-currency";
import { ReportTable } from "../../_components/report-table";

const COLUMNS = [
  { label: "Offer" },
  { label: "Value", align: "right" },
  { label: "Status" },
  { label: "Products sold" },
  { label: "Units", align: "right" },
  { label: "Revenue", align: "right" },
] as const;

export function OfferBreakdownTable({ offers }: { offers: ProductDiscountBreakdown[] }) {
  const { symbol } = useCurrency();
  return (
    <ReportTable columns={COLUMNS}>
      {offers.map((offer) => {
        const units = offer.products.reduce((sum, product) => sum + product.totalSold, 0);
        const revenue = offer.products.reduce((sum, product) => sum + product.revenue, 0);
        return (
          <tr className="border-b border-slate-50 font-black transition hover:bg-slate-50/50" key={offer.discountId}>
            <td className="px-6 py-4">{offer.discountName}</td>
            <td className="px-6 py-4 text-right tabular-nums">
              {offer.type === "percentage" ? `${offer.value}%` : formatMoney(offer.value, symbol)}
            </td>
            <td className="px-6 py-4 capitalize text-slate-600">{offer.status}</td>
            <td className="px-6 py-4 font-medium text-slate-600">{offer.products.map((product) => product.productName).join(", ")}</td>
            <td className="px-6 py-4 text-right tabular-nums">{units}</td>
            <td className="px-6 py-4 text-right tabular-nums">{formatMoney(revenue, symbol)}</td>
          </tr>
        );
      })}
    </ReportTable>
  );
}
