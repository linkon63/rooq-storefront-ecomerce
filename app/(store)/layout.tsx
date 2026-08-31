import { GoogleOAuthProvider } from "@react-oauth/google";
import { Toaster } from "sonner";

import Header from "@/components/storefront/shared/Header";
import Footer from "@/components/storefront/shared/Footer";
import { AuthProvider } from "../_providers/auth-provider";
import { CartProvider } from "../_providers/cart-provider";
import { WishlistProvider } from "../_providers/wishlist-provider";
import { CompareProvider } from "../_providers/compare-provider";
import AuthModal from "@/components/auth-modal";
import {
  GoogleTagManagerNoScript,
  GoogleTagManagerScript,
} from "@/components/analytics/google-tag-manager";
import { fetchShopCategories, fetchShopPolicies, fetchShopSettings } from "@/lib/shop-api";
import type { Policy } from "@/types/policies";

/**
 * The header's category nav, the shop settings and the footer links all come
 * from the fetches below. Left at the default the layout is baked at build time
 * and a category added in the admin never shows up, so it regenerates on the
 * same 60s cadence as the pages beneath it.
 */
export const revalidate = 60;

export default async function StoreLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // The shop chrome is identical on every storefront page, so it is fetched
  // once here on the server. Each call already falls back to a safe empty value.
  const [settings, categories, shopPolicies] = await Promise.all([
    fetchShopSettings(),
    fetchShopCategories(),
    fetchShopPolicies(),
  ]);

  const policies: Policy[] = shopPolicies.map((policy, index) => ({
    id: index + 1,
    content: policy.title,
    content_html: policy.content,
    created_at: "",
    updated_at: "",
  }));

  return (
    // Tag Manager sits in the storefront layout rather than the root one so the
    // admin panel's own traffic never lands in the marketing reports.
    <>
      <GoogleTagManagerNoScript />
      <GoogleTagManagerScript />
      <GoogleOAuthProvider clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ?? ""}>
        <AuthProvider>
          <WishlistProvider>
            <CompareProvider>
              <CartProvider>
                <div className="storefront-root flex min-h-full flex-col">
                  <Header settings={settings} categories={categories} />
                  <div className="flex-1">{children}</div>
                  <Footer
                    policies={policies}
                    settings={settings}
                    productLinks={categories
                      .filter((category) => !category.parentId)
                      .slice(0, 6)
                      .map((category) => ({
                        label: category.name,
                        href: `/shop?category=${encodeURIComponent(category.name)}`,
                      }))}
                  />
                </div>
                <AuthModal />
                <Toaster position="bottom-right" richColors closeButton />
              </CartProvider>
            </CompareProvider>
          </WishlistProvider>
        </AuthProvider>
      </GoogleOAuthProvider>
    </>
  );
}
