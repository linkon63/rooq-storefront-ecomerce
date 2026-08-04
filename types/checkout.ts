import type { Product, ProductVariant } from "@/types/product";

export interface CheckoutItem {
  product: Product;
  variant: ProductVariant;
  quantity: number;
}

export interface ApiResponse<T = unknown> {
  data?: T;
  status?: string;
  message?: string;
  error?: string;
}

export interface OrderResponse {
  data?: {
    id?: string | number;
    order_id?: string | number;
    orderId?: string | number;
    order_number?: string;
  };
  order?: {
    id?: string | number;
    order_number?: string;
  };
  order_id?: string | number;
  orderId?: string | number;
  id?: string | number;
  status?: string;
  message?: string;
  error?: string;
}

export interface AddressApiResponse {
  data?: {
    addresses?: ApiAddress[];
    mailing_address?: ApiAddress;
  };
  addresses?: ApiAddress[];
  mailing_address?: ApiAddress;
}

export interface ApiAddress {
  id?: string | number;
  address_id?: string | number;
  first_name?: string;
  last_name?: string;
  phone?: string;
  state?: string;
  city?: string;
  area?: string;
  address?: string;
  addressLine?: string;
  postcode?: string;
  country?: string;
  is_default?: boolean;
}
