import { Suspense } from "react";
import OrderPageView from "../_components/order-page-view";

export default function CompletedOrdersPage() {
  return (
    <Suspense>
      <OrderPageView title="Completed Orders" description="Delivered orders and their payment settlement." fixedStatus="delivered" />
    </Suspense>
  );
}
