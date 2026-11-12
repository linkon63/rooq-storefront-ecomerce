import { Suspense } from "react";
import OrderPageView from "../_components/order-page-view";

export default function CanceledOrdersPage() {
  return (
    <Suspense>
      <OrderPageView title="Canceled Orders" description="Orders that were cancelled and restocked." fixedStatus="cancelled" />
    </Suspense>
  );
}
