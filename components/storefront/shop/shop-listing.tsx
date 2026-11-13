import { ERROR_MESSAGES } from "@/lib/constants/error-messages";
import { SHOP_PAGE_SIZE } from "@/lib/constants/storefront";
import { listProductsServer } from "@/lib/storefront/catalog-data";
import type { ProductList } from "@/types/storefront/catalog";
import { withQuery } from "@/utils/query-string";
import { activeFilterCount, parseShopFilters, toProductQuery, toShopQuery, type RawSearchParams, type ShopFilters } from "@/utils/storefront/shop-query";
import { ProductGrid } from "../product-card/product-grid";
import { EmptyState } from "../shared/empty-state";
import { FilterControls } from "./filter-controls";
import { Pagination } from "./pagination";
import { PendingResults } from "./pending-results";
import { ShopNavigationProvider } from "./shop-navigation";
import { ShopToolbar } from "./shop-toolbar";

type ShopListingProps = {
  title: string;
  intro?: string;
  basePath: string;
  searchParams: RawSearchParams;
  /** Filters fixed by the page (Sale → onSale, New → new). */
  preset?: Partial<ShopFilters>;
};

/**
 * Listing used by /shop, /new and /sale. The server reads the URL, asks
 * GET /products for cards plus facets, and renders the grid; the client
 * filter UI only rewrites the URL.
 */
export async function ShopListing({ title, intro, basePath, searchParams, preset = {} }: ShopListingProps) {
  const filters = parseShopFilters(searchParams, preset);
  let list: ProductList | null = null;
  try {
    list = await listProductsServer(toProductQuery(filters, SHOP_PAGE_SIZE));
  } catch {
    list = null;
  }
  const total = list?.meta.total ?? 0;
  const heading = filters.search ? `${title}: “${filters.search}”` : title;
  const hrefFor = (page: number) => withQuery(basePath, toShopQuery({ ...filters, page }, preset));

  return (
    <ShopNavigationProvider filters={filters} facets={list?.facets ?? null} preset={preset} total={total}>
      <div className="page-gutter">
        <header className="page-head flex flex-col gap-2">
          <h1 className="type-h1">{heading}</h1>
          {intro ? <p className="type-lead max-w-[60ch] text-stone">{intro}</p> : null}
        </header>
        <div className="grid gap-8 lg:grid-cols-[15.5rem_minmax(0,1fr)] xl:gap-12">
          <aside aria-label="Filters" className="hidden lg:block">
            <div className="sticky top-[calc(var(--header-h)+1rem)] max-h-[calc(100dvh-var(--header-h)-2rem)] overflow-y-auto pr-2">
              <FilterControls />
            </div>
          </aside>
          <div className="flex flex-col gap-6">
            <ShopToolbar />
            <PendingResults>
              {list === null ? (
                <EmptyState tone="error" title="Products did not load" body={ERROR_MESSAGES.storefront.productsLoadFailed} />
              ) : list.data.length === 0 ? (
                <EmptyState
                  title="Nothing matches yet"
                  body={activeFilterCount(filters, preset) > 0 ? "Try removing a filter or two." : "New pieces land every week. Check back soon."}
                  action={{ label: "See everything", href: "/shop" }}
                />
              ) : (
                <>
                  <ProductGrid products={list.data} offset={(list.meta.page - 1) * SHOP_PAGE_SIZE} />
                  <Pagination meta={list.meta} hrefFor={hrefFor} />
                </>
              )}
            </PendingResults>
          </div>
        </div>
      </div>
    </ShopNavigationProvider>
  );
}
