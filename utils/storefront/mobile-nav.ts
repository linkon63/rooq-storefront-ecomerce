/** Phone app shell rules: which bars a storefront path shows. Pure. */

export type MobileTabKey = "home" | "shop" | "bag" | "wishlist" | "me";

export const MOBILE_TABS: readonly { key: MobileTabKey; label: string; href: string }[] = [
  { key: "home", label: "Home", href: "/" },
  { key: "shop", label: "Shop", href: "/shop" },
  { key: "bag", label: "Bag", href: "/cart" },
  { key: "wishlist", label: "Wishlist", href: "/wishlist" },
  { key: "me", label: "Me", href: "/profile" },
];

/** Full-screen flows that bring their own bottom action bar. */
export function isTabBarHidden(pathname: string): boolean {
  return pathname.startsWith("/product/") || pathname === "/checkout" || pathname === "/confirmation";
}

/** A tab's first screen: no back button. */
export function isTabRoot(pathname: string, hasAccountTab: boolean): boolean {
  if (pathname === "/profile") return !hasAccountTab;
  return MOBILE_TABS.some((tab) => tab.href === pathname);
}
