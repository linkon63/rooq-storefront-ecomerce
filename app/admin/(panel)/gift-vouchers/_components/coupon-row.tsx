"use client";

import type { CouponResponse } from "@/types/commerce/coupon";
import { formatMoney } from "@/utils/admin/format";
import { formatDateTime } from "@/utils/format-date";
import { COUPON_STATE_TONE, couponState, couponUsageLabel, couponValueLabel } from "@/utils/orders/coupon-display";
import { AdminIcon, StatusToggle } from "../../../_components/admin-shell";

type Props = { coupon: CouponResponse; symbol: string; now: Date; onEdit: () => void; onDelete: () => void; onToggle: () => void };

export function CouponRow({ coupon, symbol, now, onEdit, onDelete, onToggle }: Props) {
  const state = couponState(coupon, now);
  return (
    <tr className="odd:bg-white even:bg-slate-50/70">
      <td className="px-5 py-4 font-mono text-sm font-semibold text-slate-800">{coupon.code}</td>
      <td className="px-5 py-4 text-sm font-semibold tabular-nums text-slate-700">{couponValueLabel(coupon, symbol)}</td>
      <td className="px-5 py-4 text-sm tabular-nums text-slate-600">{couponUsageLabel(coupon)}</td>
      <td className="px-5 py-4 text-sm text-slate-600">{coupon.minOrderAmount ? formatMoney(coupon.minOrderAmount, symbol) : "—"}</td>
      <td className="px-5 py-4 text-xs text-slate-600">
        {coupon.startsAt ? formatDateTime(coupon.startsAt) : "Now"} → {coupon.expiresAt ? formatDateTime(coupon.expiresAt) : "No expiry"}
      </td>
      <td className="px-5 py-4">
        <span className={`inline-block rounded-md border px-2.5 py-0.5 text-xs font-semibold capitalize ${COUPON_STATE_TONE[state]}`}>{state.replace("-", " ")}</span>
      </td>
      <td className="px-5 py-4">
        <div className="flex items-center gap-3">
          <StatusToggle checked={coupon.isActive} onChange={onToggle} />
          <button aria-label={`Edit ${coupon.code}`} className="grid h-9 w-9 place-items-center rounded-lg border border-slate-300" onClick={onEdit} type="button">
            <AdminIcon className="h-4 w-4" name="edit" />
          </button>
          <button aria-label={`Delete ${coupon.code}`} className="grid h-9 w-9 place-items-center rounded-lg border border-rose-200 text-rose-600" onClick={onDelete} type="button">
            <AdminIcon className="h-4 w-4" name="trash" />
          </button>
        </div>
      </td>
    </tr>
  );
}
