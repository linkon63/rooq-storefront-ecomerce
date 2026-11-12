"use client";

import type { CouponBreakdown } from "@/types/admin/reports";
import { formatMoney } from "@/utils/admin/format";
import { formatDate } from "@/utils/format-date";
import { useCurrency } from "@/hooks/use-currency";
import { ReportTable } from "../../_components/report-table";

const COLUMNS = [
  { label: "Code" },
  { label: "Type" },
  { label: "Value", align: "right" },
  { label: "Used", align: "right" },
  { label: "Limit", align: "right" },
  { label: "Expires" },
] as const;

export function CouponsTable({ coupons }: { coupons: CouponBreakdown[] }) {
  const { symbol } = useCurrency();
  return (
    <ReportTable columns={COLUMNS}>
      {coupons.map((coupon) => (
        <tr className="border-b border-slate-50 font-black transition hover:bg-slate-50/50" key={coupon.id}>
          <td className="px-6 py-4">{coupon.code}</td>
          <td className="px-6 py-4 capitalize text-slate-600">{coupon.type}</td>
          <td className="px-6 py-4 text-right tabular-nums">
            {coupon.type === "percentage" ? `${coupon.value}%` : formatMoney(coupon.value, symbol)}
          </td>
          <td className="px-6 py-4 text-right tabular-nums">{coupon.usedCount}</td>
          <td className="px-6 py-4 text-right tabular-nums">{coupon.maxUsage ?? "No limit"}</td>
          <td className="px-6 py-4 text-slate-500">{coupon.expiresAt ? formatDate(coupon.expiresAt) : "Never"}</td>
        </tr>
      ))}
    </ReportTable>
  );
}
