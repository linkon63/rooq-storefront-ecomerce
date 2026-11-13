import { COMING_SOON_HREF, HEADER_CATEGORY_LIMIT, NAV_LEAD, NAV_SHOP, NAV_TAIL } from "@/lib/constants/storefront";
import type { NavItem, ShopCategoryNode } from "@/types/storefront/catalog";

/** Where a category links: its shop listing, or the home "coming soon" section while it is announced only. */
export function categoryHref(category: Pick<ShopCategoryNode, "slug" | "isComingSoon">): string {
  return category.isComingSoon ? COMING_SOON_HREF : `/shop?category=${encodeURIComponent(category.slug)}`;
}

const isLive = (category: ShopCategoryNode) => category.isActive !== false;

/**
 * Main navigation from the category tree: Shop (all products, unfiltered), New in, each active root category
 * (launched roots followed by their sub-categories, e.g. Women, Sarees), Sale.
 * Coming-soon roots keep their place and carry `soon`.
 */
export function buildPrimaryNav(categories: readonly ShopCategoryNode[]): NavItem[] {
  const roots = categories.filter((category) => !category.parentId && isLive(category));
  const middle = roots.flatMap((root): NavItem[] => {
    const self: NavItem = { label: root.name, href: categoryHref(root), soon: Boolean(root.isComingSoon) };
    if (root.isComingSoon) return [self];
    const children = (root.children ?? []).filter(isLive).map((child) => ({ label: child.name, href: categoryHref(child) }));
    return [self, ...children];
  });
  return [NAV_SHOP, NAV_LEAD, ...middle, NAV_TAIL];
}

const FIXED_HREFS = new Set<string>([NAV_SHOP.href, NAV_LEAD.href, NAV_TAIL.href]);

/** The desktop header bar: Shop, New in, Sale, plus only the first few category links. */
export function headerNav(nav: readonly NavItem[], limit = HEADER_CATEGORY_LIMIT): NavItem[] {
  let categories = 0;
  return nav.filter((item) => FIXED_HREFS.has(item.href) || categories++ < limit);
}
