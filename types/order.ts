import { FormEvent } from "react";
import { AddressFormState, AddressItem, StatusState } from "./address";
import { District, Division } from "./location";
import { CheckoutItem } from "./checkout";

export type OrderLine = {
  id: string;
  variantId?: string;
  productId?: string;
  name: string;
  qty: number;
  price?: number;
  imageUrl?: string;
  is_reviewed?: boolean;
};

export type OrderCard = {
  id: string;
  status: string;
  total: number;
  subtotal?: number;
  delivery?: number;
  placedAt?: string;
  items: OrderLine[];
};

export type StatusStyle = {
  text: string;
  bg: string;
  border: string;
};

export type OrderSummaryItem = {
  id: number;
  name: string;
  price: number;
  quantity: number;
  imageUrl: string;
};

export type OrderSummary = {
  id: string;
  order_number: string;
  createdAt: string;
  customerId: string | number | null;
  address: {
    name: string;
    phone: string;
    addressLine: string;
    area: string;
    district: string;
    division: string;
    postcode: string;
    country: string;
  };
  items: OrderSummaryItem[];
  subtotal: number;
  delivery: number;
  total: number;
};

export interface ApiOrderResponse {
  data?: ApiOrder[] | { data?: ApiOrder[]; orders?: ApiOrder[] };
  orders?: ApiOrder[];
}

export interface PaginatedOrderResponse {
  status?: string;
  message?: string;
  data?: {
    current_page?: number;
    data?: ApiOrder[];
    first_page_url?: string;
    from?: number | null;
    last_page?: number;
    last_page_url?: string;
    links?: Array<{
      url: string | null;
      label: string;
      page?: number | null;
      active: boolean;
    }>;
    next_page_url?: string | null;
    path?: string;
    per_page?: number;
    prev_page_url?: string | null;
    to?: number | null;
    total?: number;
    orders?: ApiOrder[];
  };
  orders?: ApiOrder[];
}

export interface ApiOrderItem {
  id?: string | number;
  name?: string;
  product_name?: string;
  description?: string;
  quantity?: number;
  order_quantity?: number;
  total_price?: string | number;
  price?: string | number;
  unit_price?: string | number;
  order_unit_price?: string | number;
  amount?: string | number;
  image?: string;
  product_image?: string;
  media?: Array<{ original_url?: string }>;
  purchasable?: {
    product?: {
      media?: Array<{ original_url?: string }>;
      images?: string[];
      attribute_data?: { thumbnail?: string };
    };
    media?: Array<{ original_url?: string }>;
  };
  meta_data?: {
    sku?: string;
    image?: string;
    images?: string[];
  };
}

export interface ApiOrder {
  id?: string | number;
  order_number?: string;
  order_status?: string;
  status?: string;
  total?: string | number;
  amount_due?: string | number;
  grand_total?: string | number;
  subtotal?: string | number;
  sub_total?: string | number;
  items_total?: string | number;
  shipping_charge?: string | number;
  delivery_charge?: string | number;
  shipping_fee?: string | number;
  shipping_amount?: string | number;
  sale_at?: string;
  created_at?: string;
  purchasable_items?: ApiOrderItem[];
  purchasable?: ApiOrderItem[];
  items?: ApiOrderItem[];
  order_items?: ApiOrderItem[];
  order_lines?: ApiOrderItem[];
  meta_data?: {
    additional_amount_breakdown?: { amount?: string | number };
    shipping_amount?: string | number;
  };
}

export interface AddressModalProps {
  closeAddressModal: () => void;
  addressStatus: StatusState | null;

  handleAddressSubmit: (
    event: FormEvent<HTMLFormElement>
  ) => Promise<void>;

  handleAddressChange: <K extends keyof AddressFormState>(
    key: K,
    value: AddressFormState[K]
  ) => void;

  addressForm: AddressFormState;
  addressErrors: Partial<Record<keyof AddressFormState, string>>;
  divisions: Division[];
  filteredDistricts: District[];
  submittingAddress: boolean;
}

export interface AddressStatusProps {
    addressList: AddressItem[];
    selectedAddressId: string | null;
    setSelectedAddressId: (id: string) => void;
    addressStatus: StatusState | null;
    loadingAddresses: boolean;
    openAddressModal: () => void;
    selectedAddress: AddressItem | null;
}

export interface ConfirmOrderProps {
    onConfirmOrder: () => Promise<void>;
    checkoutItems: CheckoutItem[];
    placingOrder: boolean;
    orderError?: string | null;
}