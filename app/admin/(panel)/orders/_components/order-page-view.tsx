"use client";

import { useCurrency } from "@/hooks/use-currency";
import type { OrderStatus } from "@/types/commerce/order";
import { AdminIcon, PageHeader } from "../../../_components/admin-shell";
import { InfiniteScroll } from "../../../_components/infinite-scroll";
import { useOrders } from "../_hooks/use-orders";
import { OrderDetailPanel } from "./order-detail-panel";
import { OrderListFilters } from "./order-list-filters";
import { OrderListItem } from "./order-list-item";
import { ORDER_TABS, OrderStatusTabs } from "./order-status-tabs";

type Props = {
  title: string;
  description: string;
  fixedStatus?: OrderStatus;
  /** New Orders hides payment state — it is settled after delivery, not here. */
  showPaymentStatus?: boolean;
};

function EmptyDetail() {
  return (
    <div className="flex h-[500px] flex-col items-center justify-center rounded-lg border border-dashed border-slate-200 bg-slate-50/50 p-12 text-center">
      <AdminIcon className="mb-3 h-10 w-10 text-slate-400" name="orders" />
      <h3 className="text-sm font-semibold text-slate-700">No order selected</h3>
      <p className="mt-1 max-w-[240px] text-xs text-slate-400">Pick an order on the left to see its lines, shipments and history.</p>
    </div>
  );
}

export default function OrderPageView({ title, description, fixedStatus, showPaymentStatus = true }: Props) {
  const { symbol } = useCurrency();
  const orders = useOrders({ fixedStatus, defaultStatus: fixedStatus ? undefined : ORDER_TABS[0].key });
  const panel = (order: NonNullable<typeof orders.selected>) => (
    <OrderDetailPanel
      isUpdating={orders.isUpdating}
      onChanged={orders.replaceOrder}
      onPayment={orders.updatePaymentStatus}
      onStatus={orders.updateOrderStatus}
      order={order}
      showPaymentStatus={showPaymentStatus}
      symbol={symbol}
    />
  );

  return (
    <>
      <PageHeader
        title={title}
        description={description}
        action={
          <span className="inline-flex h-11 items-center gap-2 rounded-lg border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-600 shadow-xs">
            <AdminIcon className="h-4 w-4 text-slate-400" name="orders" />
            {orders.total} total
          </span>
        }
      />
      {fixedStatus ? null : <OrderStatusTabs onChange={orders.selectStatus} value={orders.status} />}
      {orders.error ? (
        <p aria-live="polite" className="mb-6 rounded-lg border border-rose-200 bg-rose-50 px-5 py-3.5 text-sm font-semibold text-rose-700">
          {orders.error}
        </p>
      ) : null}

      <div className="grid gap-4 xl:grid-cols-[380px_1fr]">
        <aside className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-xs">
          <OrderListFilters
            onPaymentStatus={orders.selectPaymentStatus}
            onSearch={orders.changeSearch}
            paymentStatus={orders.paymentStatus}
            search={orders.search}
            showPaymentStatus={showPaymentStatus}
          />
          <div className="flex flex-col gap-2.5 bg-slate-50/30 p-3 xl:max-h-[calc(100vh-280px)] xl:overflow-y-auto">
            {orders.isLoading && orders.page === 1 ? (
              Array.from({ length: 6 }, (_, i) => <div className="h-20 animate-pulse rounded-md bg-slate-100" key={i} />)
            ) : orders.orders.length === 0 ? (
              <p className="p-6 text-center text-xs font-semibold text-slate-400">No orders found.</p>
            ) : (
              orders.orders.map((order) => {
                const isSelected = order.id === orders.selectedId;
                return (
                  <div key={order.id}>
                    <OrderListItem
                      isSelected={isSelected}
                      onSelect={() => orders.setSelectedId(isSelected ? null : order.id)}
                      order={order}
                      showPaymentStatus={showPaymentStatus}
                      symbol={symbol}
                    />
                    {isSelected && orders.selected ? <div className="mx-3 border-t border-slate-100 pb-2 pt-3 xl:hidden">{panel(orders.selected)}</div> : null}
                  </div>
                );
              })
            )}
            <InfiniteScroll
              allLoadedLabel="All orders loaded"
              hasMore={orders.hasMore}
              isLoading={orders.isLoading}
              loadingLabel="Loading more orders…"
              onLoadMore={orders.loadMore}
            />
          </div>
        </aside>
        <section className="hidden xl:block">{orders.selected ? panel(orders.selected) : <EmptyDetail />}</section>
      </div>
    </>
  );
}
