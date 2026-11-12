import { Suspense } from "react";
import OrderPageView from "./_components/order-page-view";

export default function OrdersPage() {
  return (
    <Suspense>
      <OrderPageView title="Orders" description="Search, filter, and manage customer orders." showPaymentStatus={false} />
    </Suspense>
  );
}
