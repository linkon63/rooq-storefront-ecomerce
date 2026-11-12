import type { ProductCard } from "@/utils/mappers/product-card";

/** One saved product (GET/POST /wishlist). The product is the shop's ProductCard. */
export type WishlistItemResponse = {
  id: string;
  userId: string;
  productId: string;
  createdAt: string;
  product: ProductCard;
};
