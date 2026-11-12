import type { AddressForm } from "@/types/storefront/ui";

const LABEL = "mb-2 text-[10px] font-bold uppercase tracking-[0.18em] text-dye-deep";

export function InvoiceParties({ address, cityLine }: { address: AddressForm; cityLine: string }) {
  return (
    <div className="my-6 grid grid-cols-1 gap-6 sm:grid-cols-2 print:grid-cols-2">
      <div>
        <p className={LABEL}>Billed To</p>
        <p className="text-sm font-semibold text-stone-800">{address.fullName}</p>
        <p className="mt-1 text-xs text-stone-600">{address.phone}</p>
        {address.email ? <p className="text-xs text-stone-600">{address.email}</p> : null}
      </div>
      <div>
        <p className={LABEL}>Delivery Address</p>
        <p className="text-xs leading-relaxed text-stone-700">
          {address.addressLine1}
          {address.addressLine2 ? `, ${address.addressLine2}` : ""}
          {cityLine || address.postalCode ? (
            <>
              <br />
              {cityLine}
              {address.postalCode ? `${cityLine ? " - " : ""}${address.postalCode}` : ""}
            </>
          ) : null}
          <br />
          {address.country}
        </p>
      </div>
    </div>
  );
}
