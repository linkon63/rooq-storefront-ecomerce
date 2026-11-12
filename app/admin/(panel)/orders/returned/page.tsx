import { Suspense } from "react";
import OrderPageView from "../_components/order-page-view";

export default function ReturnedOrdersPage() {
  return (
    <Suspense>
      <OrderPageView title="Returned Orders" description="Orders that came back in full. Partial returns live under Returns." fixedStatus="returned" />
    </Suspense>
  );
}
