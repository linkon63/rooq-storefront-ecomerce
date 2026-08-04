import { CartItem } from "@/types/cart";
import type { Product } from "@/types/product";
import { parsePrice } from "@/utils/convert";
import type { ProductVariant } from "@/types/product";

export const getDiscountFromAmount = (product: Product): number => {
  const variant = product.variants?.[0];
  if (!variant) return 0;
  const discountAmount = parsePrice(variant.discount_amount) ?? 0;
  const retailPrice = parsePrice(variant.current_pricing?.retail_price) ?? 0;

  if (!retailPrice || discountAmount <= 0) return 0;

  return Math.round((discountAmount / retailPrice) * 100);
};

export const getProductPrice = (product: Product, variant: ProductVariant): number => {
  return parsePrice(variant?.current_pricing?.retail_price) ?? 0;
};

export const getCartProductTotalPrice = (
  cartItems:CartItem[],
  selectedIdSet:Set<string>
) => {
  const products = cartItems.filter((item) => selectedIdSet.has(`${item.product.id}-${item.variant.id}`));
  
  let totalPrice = 0;
  products.map((product)=>{
    totalPrice += (parsePrice(product.variant?.current_pricing?.retail_price) ?? 0) * product.quantity;
  } )

  return totalPrice;
  
};
