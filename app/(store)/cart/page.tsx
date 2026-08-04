import type { Metadata } from "next";

import CartView from "@/components/storefront/checkout/CartView";
import RelatedProducts from "@/components/storefront/shop/RelatedProducts";
import { fetchShopProducts } from "@/lib/shop-api";

export const metadata: Metadata = {
  title: "Shopping Cart | Organishi",
};

export default async function CartPage() {
  const { data: products } = await fetchShopProducts({ limit: 8 });

  return (
    <>
      <CartView />
      <RelatedProducts title="You May Also Like" products={products.slice(0, 8)} />
    </>
  );
}
