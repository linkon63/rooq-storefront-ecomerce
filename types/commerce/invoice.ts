/** Everything the PDF invoice prints: the frozen order plus the shop's letterhead. */
export type InvoiceDocument = {
  orderNumber: string;
  invoiceNumber: string | null;
  placedAt: Date;
  deliveryZone: string | null;
  note: string | null;
  customer: {
    fullName: string;
    phone: string;
    email: string | null;
    addressLine1: string;
    addressLine2: string | null;
    city: string;
    state: string | null;
    postalCode: string | null;
  };
  items: { name: string; caption: string; quantity: number; unitPrice: number; listPrice: number }[];
  totals: { subtotal: number; productDiscount: number; couponDiscount: number; shipping: number; total: number };
  shop: InvoiceShop;
};

export type InvoiceShop = {
  name: string;
  address: string;
  phone: string | null;
  email: string | null;
  whatsapp: string;
  website: { label: string; href: string };
  facebookUrl: string;
  /** PNG/JPEG bytes for the letterhead, or null to print the shop name instead. */
  logo: Buffer | null;
};
