import type { OrderResponse as Order } from "@/types/commerce/order";
import { formatDateTime } from "@/utils/format-date";
import { OrderStatusPill } from "./order-status-pill";

/** Status history, newest first, with who changed it and the note they filed. */
export function OrderHistoryCard({ order }: { order: Order }) {
  if (!order.statusLogs.length) return null;
  return (
    <section className="mt-4 rounded-lg border border-slate-200/60 bg-white p-5 shadow-xs">
      <h3 className="mb-4 text-xs font-semibold uppercase tracking-wider text-slate-400">History</h3>
      <ol className="space-y-3">
        {order.statusLogs.map((log) => (
          <li className="flex flex-wrap items-start gap-3 text-xs" key={log.id}>
            <OrderStatusPill status={log.status} />
            <span className="text-slate-500">{formatDateTime(log.createdAt)}</span>
            {log.changedBy ? <span className="text-slate-400">by {log.changedBy.name}</span> : null}
            {log.note ? <p className="w-full whitespace-pre-line text-slate-700">{log.note}</p> : null}
          </li>
        ))}
      </ol>
    </section>
  );
}
