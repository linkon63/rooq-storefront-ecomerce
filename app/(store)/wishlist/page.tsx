import type { Metadata } from "next";
import { WishlistGrid } from "@/components/storefront/wishlist/wishlist-grid";

export const metadata: Metadata = { title: "Wishlist", robots: { index: false } };

export default function WishlistPage() {
  return (
    <div className="page-gutter pt-8 md:pt-12">
      <h1 className="mb-8 font-display font-expanded text-[clamp(2rem,7vw,3.5rem)] font-extrabold leading-none">Wishlist</h1>
      <WishlistGrid />
    </div>
  );
}
