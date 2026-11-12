import Image from "next/image";
import Logo from "@/components/storefront/shared/Logo";
import { SHOP_WEBSITE } from "@/lib/shop-contact";

type Props = { shopName: string; logo?: string | null; address: string; phone: string; details: [string, string][] };

/** Shop identity and logo, then the invoice title with its details. */
export function InvoiceLetterhead({ shopName, logo, address, phone, details }: Props) {
  return (
    <>
      <div className="flex items-start justify-between gap-6 border-b-2 border-ink pb-5">
        <div className="min-w-0">
          <p className="text-sm font-bold text-ink">{shopName}</p>
          <p className="mt-1 text-[11px] leading-relaxed text-stone-500">{address}</p>
          <p className="text-[11px] text-stone-500">{phone}</p>
          <a className="text-[11px] font-semibold text-ink" href={SHOP_WEBSITE.href}>
            {SHOP_WEBSITE.label}
          </a>
        </div>
        {logo ? (
          <Image alt={shopName} className="h-12 w-auto max-w-[45%] shrink-0 object-contain" height={48} priority src={logo} unoptimized width={160} />
        ) : (
          <Logo className="h-9 shrink-0" />
        )}
      </div>
      <div className="mt-5 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between print:flex-row print:items-start print:justify-between">
        <h2 className="font-display text-2xl font-bold uppercase tracking-[0.2em] text-ink">Invoice</h2>
        <table>
          <tbody className="text-[11px] text-stone-600">
            {details.map(([label, value]) => (
              <tr key={label}>
                <td className="pr-4 text-stone-400">{label}</td>
                <td className="font-semibold text-ink sm:text-right print:text-right">{value}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
