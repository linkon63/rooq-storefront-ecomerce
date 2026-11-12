"use client";

import { useState, type FormEvent } from "react";
import type { CouponInput, CouponResponse } from "@/types/commerce/coupon";
import { ERROR_MESSAGES } from "@/lib/constants/error-messages";
import { fromDateTimeInput, toDateTimeInput } from "@/utils/orders/coupon-display";
import { AdminIcon } from "../../../_components/admin-shell";

type Props = { coupon: CouponResponse | null; onClose: () => void; onSave: (input: CouponInput) => Promise<string | null> };

const INPUT = "h-11 w-full rounded-lg border-2 border-slate-200 bg-white px-3 text-sm outline-none transition-colors focus:border-blue-500";

export function CouponFormModal({ coupon, onClose, onSave }: Props) {
  const [code, setCode] = useState(coupon?.code ?? "");
  const [type, setType] = useState<CouponInput["type"]>(coupon?.type ?? "percentage");
  const [value, setValue] = useState(coupon ? String(coupon.value) : "");
  const [maxUsage, setMaxUsage] = useState(coupon?.maxUsage ? String(coupon.maxUsage) : "");
  const [minOrder, setMinOrder] = useState(coupon?.minOrderAmount ? String(coupon.minOrderAmount) : "");
  const [startsAt, setStartsAt] = useState(toDateTimeInput(coupon?.startsAt ?? null));
  const [expiresAt, setExpiresAt] = useState(toDateTimeInput(coupon?.expiresAt ?? null));
  const [isActive, setIsActive] = useState(coupon?.isActive ?? true);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!code.trim()) return setError(ERROR_MESSAGES.coupon.codeRequired);
    if (!(Number(value) > 0)) return setError(ERROR_MESSAGES.coupon.valueRequired);
    if (type === "percentage" && Number(value) > 100) return setError(ERROR_MESSAGES.coupon.percentageTooHigh);
    setSaving(true);
    const failure = await onSave({
      code: code.trim(),
      type,
      value: Number(value),
      maxUsage: maxUsage ? Number(maxUsage) : null,
      minOrderAmount: minOrder ? Number(minOrder) : null,
      startsAt: fromDateTimeInput(startsAt),
      expiresAt: fromDateTimeInput(expiresAt),
      isActive,
    });
    setSaving(false);
    if (failure) setError(failure);
    else onClose();
  }

  return (
    <div aria-labelledby="coupon-form-title" aria-modal="true" className="fixed inset-0 z-50 grid place-items-center overscroll-contain bg-slate-950/50 px-4" role="dialog">
      <form className="w-full max-w-xl rounded-xl bg-white p-6 shadow-2xl" noValidate onSubmit={submit}>
        <div className="mb-5 flex items-start justify-between">
          <h2 className="text-lg font-semibold text-slate-800" id="coupon-form-title">
            {coupon ? `Edit ${coupon.code}` : "New coupon"}
          </h2>
          <button aria-label="Close" className="grid h-9 w-9 place-items-center rounded-lg border border-slate-300" onClick={onClose} type="button">
            <AdminIcon className="h-4 w-4" name="x" />
          </button>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block sm:col-span-2">
            <span className="mb-1 block text-sm font-semibold text-slate-700">Code</span>
            <input autoComplete="off" className={`${INPUT} uppercase`} name="code" onChange={(e) => setCode(e.target.value)} placeholder="EID20…" spellCheck={false} value={code} />
          </label>
          <label className="block">
            <span className="mb-1 block text-sm font-semibold text-slate-700">Type</span>
            <select className={INPUT} onChange={(e) => setType(e.target.value as CouponInput["type"])} value={type}>
              <option value="percentage">Percentage off</option>
              <option value="fixed">Fixed amount off</option>
            </select>
          </label>
          <label className="block">
            <span className="mb-1 block text-sm font-semibold text-slate-700">Value</span>
            <input className={INPUT} inputMode="decimal" min={0} name="value" onChange={(e) => setValue(e.target.value)} step="0.01" type="number" value={value} />
          </label>
          <label className="block">
            <span className="mb-1 block text-sm font-semibold text-slate-700">Usage limit</span>
            <input className={INPUT} inputMode="numeric" min={1} name="maxUsage" onChange={(e) => setMaxUsage(e.target.value)} placeholder="Unlimited" type="number" value={maxUsage} />
          </label>
          <label className="block">
            <span className="mb-1 block text-sm font-semibold text-slate-700">Minimum order</span>
            <input className={INPUT} inputMode="decimal" min={0} name="minOrderAmount" onChange={(e) => setMinOrder(e.target.value)} placeholder="None" step="0.01" type="number" value={minOrder} />
          </label>
          <label className="block">
            <span className="mb-1 block text-sm font-semibold text-slate-700">Starts</span>
            <input className={INPUT} name="startsAt" onChange={(e) => setStartsAt(e.target.value)} type="datetime-local" value={startsAt} />
          </label>
          <label className="block">
            <span className="mb-1 block text-sm font-semibold text-slate-700">Expires</span>
            <input className={INPUT} name="expiresAt" onChange={(e) => setExpiresAt(e.target.value)} type="datetime-local" value={expiresAt} />
          </label>
          <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 sm:col-span-2">
            <input checked={isActive} onChange={(e) => setIsActive(e.target.checked)} type="checkbox" />
            Active
          </label>
        </div>
        {error ? (
          <p aria-live="polite" className="mt-4 rounded-lg bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">
            {error}
          </p>
        ) : null}
        <div className="mt-6 flex justify-end gap-3">
          <button className="h-11 rounded-lg border-2 border-slate-200 px-5 text-sm font-semibold text-slate-600" onClick={onClose} type="button">
            Cancel
          </button>
          <button className="h-11 rounded-lg bg-blue-600 px-5 text-sm font-semibold text-white disabled:bg-slate-400" disabled={saving} type="submit">
            {saving ? "Saving…" : "Save coupon"}
          </button>
        </div>
      </form>
    </div>
  );
}
