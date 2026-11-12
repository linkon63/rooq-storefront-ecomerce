import { whatsappHref } from "@/lib/shop-contact";

type Props = { shopName: string; phone: string; hours: string; whatsapp: string; facebookUrl?: string; orderNote?: string };

const LINK = "font-semibold text-stone-700 underline";

export function InvoiceFooter({ shopName, phone, hours, whatsapp, facebookUrl, orderNote }: Props) {
  return (
    <>
      {orderNote ? (
        <div className="mt-6 border-t border-stone-200 pt-4">
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-stone-400">Order Note</p>
          <p className="mt-1 text-xs text-stone-600">{orderNote}</p>
        </div>
      ) : null}
      <div className="invoice-keep mt-8 grid grid-cols-1 gap-6 border-t border-stone-200 pt-5 sm:grid-cols-[1fr_auto] print:grid-cols-[1fr_auto]">
        <div className="text-[11px] leading-relaxed text-stone-500">
          <p className="font-semibold text-stone-700">Thank you for shopping with {shopName}.</p>
          <p className="mt-1">
            Please check the items and sizes before paying the rider. Keep this invoice — a return or exchange is settled against the invoice number above.
          </p>
          <p className="mt-1">
            Questions? Call {phone} ({hours}), or message us on our{" "}
            {facebookUrl ? (
              <a className={LINK} href={facebookUrl} rel="noopener noreferrer" target="_blank">
                Facebook page
              </a>
            ) : (
              "Facebook page"
            )}{" "}
            or WhatsApp:{" "}
            <a className={LINK} href={whatsappHref(whatsapp)} rel="noopener noreferrer" target="_blank">
              {whatsapp}
            </a>
            .
          </p>
        </div>
        <div className="text-center">
          <div className="h-10 border-b border-dashed border-stone-400 sm:w-40 print:w-40" />
          <p className="mt-1.5 text-[10px] uppercase tracking-wider text-stone-400">Authorised Signature</p>
        </div>
      </div>
      <p className="mt-6 text-center text-[10px] text-stone-400">This is a computer-generated invoice and is valid without a signature.</p>
    </>
  );
}
