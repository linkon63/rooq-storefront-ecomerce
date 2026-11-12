"use client";

import { formatMoney } from "@/utils/admin/format";
import type { ConvertLineDraft } from "@/utils/orders/wholesale";

const INPUT = "h-10 rounded-lg border-2 border-slate-200 bg-white px-3 text-sm outline-none focus:border-blue-500";

type Props = { line: ConvertLineDraft; symbol: string; onChange: (field: "quantity" | "unitPrice", value: string) => void };

export function ConvertLineRow({ line, symbol, onChange }: Props) {
  return (
    <tr>
      <td className="px-4 py-3 text-sm font-semibold text-slate-800">{line.label}</td>
      <td className="px-4 py-3">
        <input aria-label={`Quantity for ${line.label}`} className={`${INPUT} w-24`} inputMode="numeric" min={1} onChange={(e) => onChange("quantity", e.target.value)} type="number" value={line.quantity} />
      </td>
      <td className="px-4 py-3">
        <input aria-label={`Unit price for ${line.label}`} className={`${INPUT} w-32`} inputMode="decimal" min={0} onChange={(e) => onChange("unitPrice", e.target.value)} placeholder="0.00" step="0.01" type="number" value={line.unitPrice} />
      </td>
      <td className="px-4 py-3 text-sm font-semibold tabular-nums text-slate-800">{formatMoney(Number(line.quantity || 0) * Number(line.unitPrice || 0), symbol)}</td>
    </tr>
  );
}
