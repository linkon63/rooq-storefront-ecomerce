"use client";

import { useState, type FormEvent } from "react";
import { ERROR_MESSAGES } from "@/lib/constants/error-messages";

type Props = { busy: boolean; onSubmit: (input: { courierName: string; trackingNumber?: string }) => Promise<boolean> };

export function ShipmentForm({ busy, onSubmit }: Props) {
  const [courierName, setCourierName] = useState("");
  const [trackingNumber, setTrackingNumber] = useState("");
  const [error, setError] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!courierName.trim()) {
      setError(ERROR_MESSAGES.shipment.courierRequired);
      return;
    }
    setError("");
    const saved = await onSubmit({ courierName: courierName.trim(), trackingNumber: trackingNumber.trim() || undefined });
    if (saved) {
      setCourierName("");
      setTrackingNumber("");
    }
  }

  const input = "h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none transition-colors focus:border-blue-500";
  return (
    <form className="grid gap-2 sm:grid-cols-[1fr_1fr_auto]" noValidate onSubmit={submit}>
      <label>
        <span className="sr-only">Courier</span>
        <input autoComplete="off" className={input} name="courierName" onChange={(e) => setCourierName(e.target.value)} placeholder="Courier (e.g. Pathao)…" value={courierName} />
      </label>
      <label>
        <span className="sr-only">Tracking number</span>
        <input autoComplete="off" className={input} name="trackingNumber" onChange={(e) => setTrackingNumber(e.target.value)} placeholder="Tracking number…" spellCheck={false} value={trackingNumber} />
      </label>
      <button className="h-10 rounded-lg bg-slate-900 px-4 text-sm font-semibold text-white disabled:opacity-50" disabled={busy} type="submit">
        Add shipment
      </button>
      {error ? (
        <p aria-live="polite" className="text-xs font-semibold text-rose-600 sm:col-span-3">
          {error}
        </p>
      ) : null}
    </form>
  );
}
