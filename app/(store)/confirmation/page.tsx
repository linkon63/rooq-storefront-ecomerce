import type { Metadata } from "next";
import { Suspense } from "react";
import { OrderConfirmation } from "@/components/storefront/checkout/order-confirmation";

export const metadata: Metadata = { title: "Order placed", robots: { index: false } };

export default function ConfirmationPage() {
  return (
    <div className="page-gutter py-12 md:py-20">
      <Suspense fallback={null}>
        <OrderConfirmation />
      </Suspense>
    </div>
  );
}
