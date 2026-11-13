"use client";

import { useState, type FormEvent } from "react";
import { FiDownload } from "react-icons/fi";
import { ERROR_MESSAGES } from "@/lib/constants/error-messages";
import { downloadInvoicePdf } from "@/lib/storefront/invoice-download";
import { isValidPhone } from "@/utils/storefront/forms";
import { TextField } from "../shared/text-field";
import { DOWNLOAD_BUTTON } from "./invoice-download";

/**
 * Invoice download when this tab no longer holds the order (the link opened
 * later or elsewhere): the shopper confirms the phone they ordered with.
 */
export function InvoiceLookup({ orderNumber }: { orderNumber: string }) {
  const [phone, setPhone] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (!isValidPhone(phone)) return setError(ERROR_MESSAGES.storefront.phoneInvalid);
    setBusy(true);
    setError(await downloadInvoicePdf(orderNumber, phone.trim()));
    setBusy(false);
  }

  return (
    <form onSubmit={(event) => void submit(event)} className="flex max-w-md flex-col gap-3 rounded border border-line bg-paper p-4">
      <p className="text-sm font-semibold">Download your invoice</p>
      <TextField
        id="invoice-phone"
        label="Phone number you ordered with"
        type="tel"
        inputMode="tel"
        autoComplete="tel"
        required
        placeholder="01XXXXXXXXX"
        value={phone}
        onChange={(event) => setPhone(event.target.value)}
        error={error}
      />
      <button type="submit" disabled={busy} className={`flex ${DOWNLOAD_BUTTON}`}>
        <FiDownload aria-hidden className="size-4" />
        {busy ? "Preparing invoice…" : "Download invoice (PDF)"}
      </button>
    </form>
  );
}
