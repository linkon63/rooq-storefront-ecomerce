"use client";

import { useMemo, useState } from "react";
import type { CouponResponse } from "@/types/commerce/coupon";
import { useCurrency } from "@/hooks/use-currency";
import { AdminIcon, PageHeader } from "../../_components/admin-shell";
import { ConfirmModal } from "../../_components/confirm-modal";
import { CouponFormModal } from "./_components/coupon-form-modal";
import { CouponRow } from "./_components/coupon-row";
import { useCoupons } from "./_hooks/use-coupons";

const HEADINGS = ["Code", "Value", "Used", "Min. order", "Valid", "Status", "Actions"];

/** Coupons & vouchers: checkout codes (percentage or fixed), with limits and validity windows. */
export default function CouponsPage() {
  const { symbol } = useCurrency();
  const { coupons, isLoading, error, save, remove, toggle } = useCoupons();
  const [editing, setEditing] = useState<CouponResponse | "new" | null>(null);
  const [deleting, setDeleting] = useState<CouponResponse | null>(null);
  const [search, setSearch] = useState("");
  const now = useMemo(() => new Date(), []);
  const visible = coupons.filter((c) => c.code.toLowerCase().includes(search.trim().toLowerCase()));

  return (
    <>
      <PageHeader
        title="Coupons & Vouchers"
        description="Codes shoppers enter at checkout and staff apply at the POS."
        action={
          <button className="inline-flex h-11 items-center gap-2 rounded-lg bg-blue-600 px-5 text-sm font-semibold text-white" onClick={() => setEditing("new")} type="button">
            <AdminIcon className="h-4 w-4" name="plus" />
            New coupon
          </button>
        }
      />
      <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xs">
        <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm font-medium text-slate-600">Displaying {visible.length} coupons</p>
          <label className="flex h-11 w-full max-w-sm items-center gap-3 rounded-lg border-2 border-slate-200 px-4 focus-within:border-blue-500">
            <AdminIcon className="h-5 w-5 text-slate-400" name="search" />
            <span className="sr-only">Search coupons</span>
            <input className="w-full bg-transparent text-sm outline-none" onChange={(e) => setSearch(e.target.value)} placeholder="Search codes…" type="search" value={search} />
          </label>
        </div>
        {error ? <p className="mx-5 mb-4 rounded-lg bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">{error}</p> : null}
        <div className="overflow-x-auto">
          <table className="w-full min-w-[960px] text-left">
            <thead className="bg-slate-50">
              <tr>
                {HEADINGS.map((h) => (
                  <th className="px-5 py-4 text-sm font-semibold text-slate-700" key={h} scope="col">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td className="px-5 py-8 text-sm font-semibold text-slate-500" colSpan={HEADINGS.length}>
                    Loading coupons…
                  </td>
                </tr>
              ) : visible.length === 0 ? (
                <tr>
                  <td className="px-5 py-8 text-sm font-semibold text-slate-500" colSpan={HEADINGS.length}>
                    No coupons yet.
                  </td>
                </tr>
              ) : (
                visible.map((coupon) => (
                  <CouponRow
                    coupon={coupon}
                    key={coupon.id}
                    now={now}
                    onDelete={() => setDeleting(coupon)}
                    onEdit={() => setEditing(coupon)}
                    onToggle={() => void toggle(coupon)}
                    symbol={symbol}
                  />
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
      {editing ? (
        <CouponFormModal
          coupon={editing === "new" ? null : editing}
          onClose={() => setEditing(null)}
          onSave={(input) => save(input, editing === "new" ? undefined : editing.id)}
        />
      ) : null}
      <ConfirmModal
        cancelText="Keep it"
        confirmText="Delete coupon"
        isOpen={deleting !== null}
        message={`Delete coupon "${deleting?.code ?? ""}"? Orders that used it keep the code on record.`}
        onClose={() => setDeleting(null)}
        onConfirm={() => {
          if (deleting) void remove(deleting.id);
          setDeleting(null);
        }}
        title="Delete coupon"
      />
    </>
  );
}
