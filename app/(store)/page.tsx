import { CollectionStrip } from "@/components/storefront/home/collection-strip";
import { DepartmentTiles, type DepartmentTile } from "@/components/storefront/home/department-tiles";
import { HomeHero } from "@/components/storefront/home/home-hero";
import { LookbookFeature } from "@/components/storefront/home/lookbook-feature";
import { ProductRail } from "@/components/storefront/product-card/product-rail";
import { RecentlyViewedRail } from "@/components/storefront/product-card/recently-viewed-rail";
import { getStoreSettings, listCollections, productRail } from "@/lib/storefront/catalog-data";

const DEPARTMENTS = [
  { label: "Women", value: "WOMEN" },
  { label: "Men", value: "MEN" },
  { label: "Kids", value: "KIDS" },
] as const;

/**
 * Home: cloth hero, departments, new in, the featured lookbook, collections,
 * sale and best sellers. Every read starts at once (no waterfall); each rail
 * hides itself when its list comes back empty.
 */
export default async function HomePage() {
  const [settings, newIn, latest, sale, popular, lookbooks, collections, ...departmentLeads] = await Promise.all([
    getStoreSettings(),
    productRail({ new: true, sort: "newest" }),
    productRail({ sort: "newest" }),
    productRail({ onSale: true, sort: "popular" }),
    productRail({ sort: "popular" }),
    listCollections({ type: "LOOKBOOK", featured: true }),
    listCollections({ type: "COLLECTION", featured: true }),
    ...DEPARTMENTS.map((department) => productRail({ department: department.value, sort: "newest", limit: 1 })),
  ]);

  const tiles: DepartmentTile[] = DEPARTMENTS.map((department, index) => ({
    label: department.label,
    href: `/shop?department=${department.value}`,
    image: departmentLeads[index]?.data[0]?.image ?? null,
  }));
  const lookbook = lookbooks[0] ?? null;

  return (
    <div className="flex flex-col gap-16 md:gap-24">
      <HomeHero returnDays={settings.delivery.returnWindowDays} />
      <DepartmentTiles tiles={tiles} />
      <ProductRail title="New in" products={newIn.data.length ? newIn.data : latest.data} link={{ label: "See all new in", href: "/new" }} />
      {lookbook ? <LookbookFeature lookbook={lookbook} /> : null}
      <CollectionStrip collections={collections} />
      <ProductRail title="On sale" products={sale.data} link={{ label: "Shop the sale", href: "/sale" }} />
      <ProductRail title="Best sellers" products={popular.data} link={{ label: "Shop all", href: "/shop?sort=popular" }} />
      <RecentlyViewedRail />
    </div>
  );
}
