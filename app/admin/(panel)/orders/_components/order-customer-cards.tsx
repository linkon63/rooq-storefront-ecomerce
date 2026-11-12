import type { OrderResponse as Order } from "@/types/commerce/order";
import { orderCustomer } from "@/utils/orders/display";

function CardTitle({ children }: { children: string }) {
  return (
    <h3 className="mb-4 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-400">
      <span aria-hidden className="inline-block h-1.5 w-1.5 rounded-full bg-slate-400" />
      {children}
    </h3>
  );
}

export function OrderCustomerCards({ order }: { order: Order }) {
  const customer = orderCustomer(order);
  return (
    <div className="mb-4 grid gap-4 md:grid-cols-2">
      <section className="rounded-lg border border-slate-200/60 bg-white p-5 shadow-xs">
        <CardTitle>Customer</CardTitle>
        <div className="flex items-center gap-3">
          <span aria-hidden className="grid h-9 w-9 place-items-center rounded-full bg-slate-100 text-sm font-semibold text-slate-700">
            {customer.name.charAt(0).toUpperCase()}
          </span>
          <div className="min-w-0">
            <p className="flex items-center gap-2 truncate text-sm font-semibold text-slate-800">
              {customer.name}
              {customer.isGuest ? (
                <span className="rounded border border-slate-200 bg-slate-50 px-1.5 py-0.5 text-[10px] font-semibold uppercase text-slate-500">Guest</span>
              ) : null}
            </p>
            <p className="mt-0.5 truncate text-xs text-slate-400">{customer.email ?? "No email provided"}</p>
          </div>
        </div>
        {customer.phone ? (
          <p className="mt-3 text-xs text-slate-600">
            <span className="font-medium text-slate-400">Phone: </span>
            <a className="font-semibold hover:underline" href={`tel:${customer.phone}`}>
              {customer.phone}
            </a>
          </p>
        ) : null}
      </section>
      <section className="rounded-lg border border-slate-200/60 bg-white p-5 shadow-xs">
        <CardTitle>Shipping address</CardTitle>
        <p className="text-sm font-bold text-slate-900">{customer.name}</p>
        <p className="pt-1 text-xs font-medium leading-relaxed text-slate-600">{customer.address ?? "No address on file (in-store sale)."}</p>
        {order.customerNote ? (
          <p className="mt-3 rounded-md bg-slate-50 px-3 py-2 text-xs text-slate-600">
            <span className="font-semibold">Note: </span>
            {order.customerNote}
          </p>
        ) : null}
      </section>
    </div>
  );
}
