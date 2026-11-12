"use client";

import { useEffect, useState } from "react";
import { ERROR_MESSAGES } from "@/lib/constants/error-messages";
import { getProduct } from "@/lib/shop-api";
import { useAppDispatch } from "@/lib/store/hooks";
import { closeQuickView } from "@/lib/store/slices/ui-slice";
import type { ProductDetail } from "@/types/storefront/catalog";
import { errorText } from "@/utils/api-error";
import { ProductSelectionProvider } from "../product/selection-context";
import { Modal } from "../shared/modal";
import { QuickViewBody } from "./quick-view-body";

/** Quick view from a grid card: colour, size and add to bag without leaving the listing. */
export function QuickViewDialog({ productId }: { productId: string }) {
  const dispatch = useAppDispatch();
  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [error, setError] = useState<string | null>(null);
  const close = () => dispatch(closeQuickView());

  useEffect(() => {
    const controller = new AbortController();
    getProduct(productId, controller.signal)
      .then(setProduct)
      .catch((caught) => {
        if (!controller.signal.aborted) setError(errorText(caught, ERROR_MESSAGES.storefront.quickViewFailed));
      });
    return () => controller.abort();
  }, [productId]);

  return (
    <Modal
      open
      onOpenChange={(open) => (open ? null : close())}
      title={product ? product.name : "Quick view"}
      hideTitle={Boolean(product)}
      className="md:!max-w-4xl"
    >
      {error ? (
        <p role="alert" className="px-6 py-10 text-dye-deep">
          {error}
        </p>
      ) : product ? (
        <ProductSelectionProvider product={product}>
          <QuickViewBody onDone={close} />
        </ProductSelectionProvider>
      ) : (
        <div className="grid gap-6 p-6 md:grid-cols-2" aria-busy="true" aria-label="Loading product">
          <div className="aspect-[3/4] animate-pulse bg-selvedge" />
          <div className="flex flex-col gap-3">
            <div className="h-7 w-3/4 animate-pulse rounded bg-selvedge" />
            <div className="h-5 w-1/3 animate-pulse rounded bg-selvedge" />
          </div>
        </div>
      )}
    </Modal>
  );
}
