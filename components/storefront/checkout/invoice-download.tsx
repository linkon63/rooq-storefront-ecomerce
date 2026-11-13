"use client";

import { useState } from "react";
import { FiDownload } from "react-icons/fi";
import { downloadInvoicePdf } from "@/lib/storefront/invoice-download";

type Props = { orderNumber: string; phone: string; className?: string };

export const DOWNLOAD_BUTTON =
  "h-12 items-center justify-center gap-2 rounded bg-dye px-6 text-sm font-semibold text-chalk hover:bg-dye-deep disabled:opacity-60";

/**
 * Downloads the invoice PDF of the order just placed. The server builds it
 * from the stored order, so the invoice number and every figure stay the same
 * on each download.
 */
export function InvoiceDownload({ orderNumber, phone, className = "" }: Props) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function download() {
    setBusy(true);
    setError(await downloadInvoicePdf(orderNumber, phone));
    setBusy(false);
  }

  return (
    <>
      <button type="button" onClick={() => void download()} disabled={busy} className={`${DOWNLOAD_BUTTON} ${className}`}>
        <FiDownload aria-hidden className="size-4" />
        {busy ? "Preparing invoice…" : "Download invoice (PDF)"}
      </button>
      {error ? (
        <p role="alert" className="w-full text-sm text-dye-deep">
          {error}
        </p>
      ) : null}
    </>
  );
}
