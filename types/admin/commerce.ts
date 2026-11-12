export type PosSaleInput = {
  items: { variantId: string; quantity: number; unitPrice?: number }[];
  paymentMethod: string;
  transactionId?: string;
  couponCode?: string;
  discount?: number;
  customer?: { name?: string; phone?: string; email?: string };
  note?: string;
};
