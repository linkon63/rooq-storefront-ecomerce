export interface Campaign {
  id: number;
  slug: string;
  name: string;
  media?: Array<{ original_url: string }>;
  items?: Array<{
    id: number;
    media: Array<{ original_url: string }>;
    discount_id: number;
  }>;
}

export interface SliderItem {
  type: 'campaign' | 'product';
  image: string;
  title?: string;
  description?: string;
  productId?: number | string;
  productImages?: string[];
}

export interface SliderItem {
  type: 'campaign' | 'product';
  image: string;
  title?: string;
  description?: string;
  productId?: number | string;
  productImages?: string[];
}

export interface FlattenedSlide {
  type: 'campaign' | 'product-image';
  image: string;
  title?: string;
  description?: string;
  productId?: number | string;
  productImages?: string[];
  itemIdx: number;
  slideIdx: number;
}