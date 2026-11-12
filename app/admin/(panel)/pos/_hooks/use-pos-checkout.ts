"use client";

import { useState } from "react";
import { toast } from "sonner";
import { createPosSale } from "@/lib/admin-api/commerce";
import type { OrderResponse as Order } from "@/types/commerce/order";
import { ERROR_MESSAGES } from "@/lib/constants/error-messages";
import { SUCCESS_MESSAGES } from "@/lib/constants/success-messages";
import { useAppDispatch, useAppSelector } from "@/lib/store/hooks";
import { posActions, selectPos } from "@/lib/store/slices/pos-slice";

/** Sends the ticket in the POS slice to POST /orders/pos and clears it on success. */
export function usePosCheckout() {
  const dispatch = useAppDispatch();
  const sale = useAppSelector(selectPos);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [completed, setCompleted] = useState<Order | null>(null);

  async function checkout() {
    if (!sale.lines.length) {
      toast.error(ERROR_MESSAGES.pos.cartEmpty);
      return;
    }
    setIsSubmitting(true);
    try {
      const { name, phone, email } = sale.customer;
      const order = await createPosSale({
        items: sale.lines.map((line) => ({ variantId: line.variantId, quantity: line.quantity })),
        paymentMethod: sale.paymentMethod,
        transactionId: sale.transactionId.trim() || undefined,
        couponCode: sale.couponCode.trim() || undefined,
        discount: sale.discount || undefined,
        customer: name || phone || email ? { name: name || undefined, phone: phone || undefined, email: email || undefined } : undefined,
        note: sale.note.trim() || undefined,
      });
      setCompleted(order);
      dispatch(posActions.resetSale());
      toast.success(SUCCESS_MESSAGES.commerce.saleCompleted(order.orderNumber));
    } catch (err) {
      toast.error(err instanceof Error && err.message ? err.message : ERROR_MESSAGES.pos.checkoutFailed);
    } finally {
      setIsSubmitting(false);
    }
  }

  return { checkout, isSubmitting, completed, dismissReceipt: () => setCompleted(null) };
}
