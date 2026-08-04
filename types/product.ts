export interface ProductMedia {
  original_url?: string;
  collection_name?: string;
  order_column?: number;
}

export interface LocalizedText {
  [key: string]: string | undefined;
  en?: string;
}

export interface ProductPricing {
  unit_price?: string;
  retail_price?: string;
}

export interface OptionValue {
  id?: number;
  name?: LocalizedText | string;
  value?: LocalizedText | string;
  option_id?: number;
  option_name?: LocalizedText | string;
  option_position?: number;
  position?: number;
}

export interface ProductVariant {
  id: number | string;
  unit_quantity?: number;
  total_stock_count?: number;
  sku?: string;
  purchasable?: string;
  is_active?: boolean;
  discount_price?: string | number | null;
  discount_amount?: string | number | null;
  current_pricing?: ProductPricing;
  option_values?: OptionValue[];
  media?: ProductMedia[];
}
export interface ProductBrand {
  id: number | string;
  name?: string;
  is_active?: boolean;
  media?: ProductMedia[];
}

export interface ProductCategory {
  id: number | string;
  name?: LocalizedText | string;
  is_active?: boolean;
  children?: ProductCategory[];
  media?: ProductMedia[];
}

export interface Product {
  id: number | string;
  /** Our storefront resolves product pages by slug. */
  slug?: string;

  name?: LocalizedText | string;
  description?: LocalizedText | string;

  is_active?: boolean;
  status?: string;
  created_at?: string;
  updated_at?: string;

  media?: ProductMedia[];

  brand?: string | ProductBrand;

  category?: string | ProductCategory;

  tags?: unknown[];
  variants?: ProductVariant[];

  price?: string | number;
  originalPrice?: string | number;
  discount?: number;

  image?: string;
  badge?: string;
}
