import type { PaymentStatus as OrderPaymentStatus, OrderStatus } from "@/types/commerce/order";
import { humanize, orderStatusTone, paymentStatusTone } from "@/utils/orders/display";

const BASE = "inline-flex items-center rounded border px-2 py-0.5 text-[10px] font-semibold capitalize tracking-wide";

export function OrderStatusPill({ status }: { status: OrderStatus }) {
  return <span className={`${BASE} ${orderStatusTone(status)}`}>{status}</span>;
}

export function PaymentStatusPill({ status }: { status: OrderPaymentStatus }) {
  return <span className={`${BASE} ${paymentStatusTone(status)}`}>{humanize(status)}</span>;
}

export function CodPill() {
  return <span className={`${BASE} border-amber-300 bg-amber-50 uppercase text-amber-700`}>COD</span>;
}
