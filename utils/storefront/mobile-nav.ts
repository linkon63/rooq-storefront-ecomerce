/** Phone app shell rules: which bars a storefront path shows. Pure. */

export type MobileTabKey = "home" | "categories" | "bag" | "wishlist" | "me";

export const MOBILE_TABS: readonly { key: MobileTabKey; label: string; href: string }[] = [
  { key: "home", label: "Home", href: "/" },
  { key: "categories", label: "Categories", href: "/categories" },
  { key: "bag", label: "Bag", href: "/cart" },
  { key: "wishlist", label: "Wishlist", href: "/wishlist" },
  { key: "me", label: "Me", href: "/profile" },
];

/** Full-screen flows that bring their own bottom action bar. */
export function isTabBarHidden(pathname: string): boolean {
  return pathname.startsWith("/product/") || pathname === "/checkout" || pathname === "/confirmation";
}

/** A tab's first screen: logo and search instead of back and title. */
export function isTabRoot(pathname: string, hasAccountTab: boolean): boolean {
  if (pathname === "/profile") return !hasAccountTab;
  return MOBILE_TABS.some((tab) => tab.href === pathname);
}

const TITLES: Record<string, string> = {
  "/shop": "Shop",
  "/new": "New in",
  "/sale": "Sale",
  "/collections": "Collections",
  "/checkout": "Checkout",
  "/confirmation": "Order placed",
  "/compare": "Compare",
  "/profile": "Your account",
  "/about": "About us",
  "/contact": "Contact us",
  "/faq": "Questions",
  "/customer-gallery": "Customer gallery",
  "/login": "Sign in",
  "/cookie-policy": "Cookie policy",
  "/privacy-policy": "Privacy policy",
  "/terms-and-conditions": "Terms",
};

/** Title of an inner screen; empty where the page itself names things (product, collection). */
export function appBarTitle(pathname: string): string {
  return TITLES[pathname] ?? "";
}
