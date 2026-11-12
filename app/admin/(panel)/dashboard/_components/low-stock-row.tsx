import Image from "next/image";
import Link from "next/link";
import type { LowStockAlert } from "@/types/dashboard";
import { isLightColor } from "@/utils/color";

/** One variant in the low-stock list: thumbnail, colour swatch, size, units left. */
export function LowStockRow({ alert }: { alert: LowStockAlert }) {
  return (
    <li>
      <Link className="flex items-center gap-3 rounded-lg px-2 py-2 transition hover:bg-slate-50" href={`/admin/products/${alert.product.id}/edit`}>
        <span className="relative h-11 w-9 shrink-0 overflow-hidden rounded-md border border-slate-200 bg-slate-100">
          {alert.imageUrl ? <Image alt="" className="object-cover" fill sizes="36px" src={alert.imageUrl} unoptimized={!alert.imageUrl.startsWith("/")} /> : null}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm font-black text-slate-800">{alert.product.name}</span>
          <span className="flex items-center gap-1.5 text-xs font-medium text-slate-500">
            <span
              aria-hidden
              className={`inline-block h-3 w-3 rounded-full ${isLightColor(alert.color.hex) ? "border border-slate-300" : ""}`}
              style={{ backgroundColor: alert.color.hex }}
            />
            {alert.color.name}, size {alert.size.label}
          </span>
        </span>
        <span className={`text-sm font-black tabular-nums ${alert.isOutOfStock ? "text-rose-600" : "text-amber-600"}`}>
          {alert.isOutOfStock ? "Sold out" : `${alert.stock} left`}
        </span>
      </Link>
    </li>
  );
}
