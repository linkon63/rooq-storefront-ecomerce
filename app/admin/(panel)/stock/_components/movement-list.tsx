import { STOCK_MOVEMENT_LABELS } from "@/lib/constants/catalog";
import { formatAdminDateTime } from "@/utils/catalog/form-values";
import type { AdminMovement } from "@/types/catalog-admin";

export function MovementList({ movements }: { movements: AdminMovement[] }) {
  if (!movements.length) return <p className="text-sm text-slate-500">No stock movements recorded yet.</p>;
  return (
    <ol className="divide-y divide-slate-100 text-sm">
      {movements.map((m) => (
        <li key={m.id} className="grid grid-cols-[1fr_auto] gap-x-4 gap-y-0.5 py-2.5">
          <span className="font-medium text-slate-900">
            {STOCK_MOVEMENT_LABELS[m.type]}
            {m.order ? <span className="ml-2 text-xs text-slate-500">Order {m.order.orderNumber}</span> : null}
            {m.returnRequest ? <span className="ml-2 text-xs text-slate-500">{m.returnRequest.requestNumber}</span> : null}
          </span>
          <span className={`text-right font-semibold tabular-nums ${m.quantity >= 0 ? "text-emerald-700" : "text-red-700"}`}>{m.quantity > 0 ? `+${m.quantity}` : m.quantity}</span>
          <span className="text-xs text-slate-500">{formatAdminDateTime(m.createdAt)}{m.createdBy ? ` · ${m.createdBy.name}` : ""}{m.reason ? ` · ${m.reason}` : ""}</span>
          <span className="text-right text-xs tabular-nums text-slate-500">→ {m.stockAfter}</span>
        </li>
      ))}
    </ol>
  );
}
