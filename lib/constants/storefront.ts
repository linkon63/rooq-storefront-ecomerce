import type { FitFeedback } from "@/types/storefront/catalog";
import type { OrderStatus, ReturnReason, ReturnStatus } from "@/types/storefront/commerce";

/** Same-origin API prefix the browser calls. */
export const API_PREFIX = "/api/v1";
/** Client request timeout. */
export const API_TIMEOUT_MS = 12_000;
/** Public catalog reads on the server are cached this long (seconds). */
export const CATALOG_REVALIDATE_SECONDS = 60;

/** localStorage keys; bump the version when the stored shape changes. */
export const STORAGE_KEYS = {
  cart: "rooq.cart.v1",
  wishlist: "rooq.wishlist.v1",
  compare: "rooq.compare.v1",
  recentlyViewed: "rooq.recent.v1",
} as const;

export const COMPARE_MAX_ITEMS = 4;
export const RECENTLY_VIEWED_MAX = 12;
export const CART_MAX_QUANTITY = 10;
export const SHOP_PAGE_SIZE = 24;
export const RAIL_PAGE_SIZE = 12;
export const REVIEWS_PAGE_SIZE = 6;
export const SEARCH_RESULTS_LIMIT = 6;
export const SEARCH_DEBOUNCE_MS = 250;
export const REVIEW_PHOTO_MAX = 5;

export const FIT_FEEDBACK_LABELS: Record<FitFeedback, string> = {
  RUNS_SMALL: "Runs small",
  TRUE_TO_SIZE: "True to size",
  RUNS_LARGE: "Runs large",
};

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  pending: "Placed",
  processing: "Being packed",
  shipped: "On the way",
  delivered: "Delivered",
  cancelled: "Cancelled",
  returned: "Returned",
};

export const RETURN_STATUS_LABELS: Record<ReturnStatus, string> = {
  REQUESTED: "Requested",
  APPROVED: "Approved",
  REJECTED: "Declined",
  REFUNDED: "Refunded",
  EXCHANGED: "Exchanged",
  CANCELLED: "Cancelled",
};

export const RETURN_REASON_LABELS: Record<ReturnReason, string> = {
  TOO_SMALL: "Too small",
  TOO_LARGE: "Too large",
  NOT_AS_DESCRIBED: "Not as described",
  DAMAGED: "Arrived damaged",
  WRONG_ITEM: "Wrong item sent",
  QUALITY: "Quality not as expected",
  CHANGED_MIND: "Changed my mind",
  OTHER: "Something else",
};

export const SORT_OPTIONS = [
  { value: "newest", label: "Newest" },
  { value: "popular", label: "Most popular" },
  { value: "price_asc", label: "Price, low to high" },
  { value: "price_desc", label: "Price, high to low" },
  { value: "rating", label: "Top rated" },
] as const;

/** Product tags with a storefront meaning; the slugs are seeded in prisma/seed/store.ts. */
export const PRODUCT_TAGS = { bestSeller: "best-seller", newArrival: "new-arrival", comingSoon: "coming-soon" } as const;

/** Shop page titles for `/shop?tag=…`. */
export const TAG_TITLES = {
  "best-seller": "Best sellers",
  "new-arrival": "New arrivals",
  "coming-soon": "Coming soon",
} as const;

/** How many products each home-page shelf shows. */
export const HOME_SHELF_SIZE = 5;
/** Home "Best sellers": four large cards; the rest wait behind "See all". */
export const HOME_BEST_SELLERS_SIZE = 4;

/** The order journey shown on the home page, in order (cash on delivery: payment comes last). */
export const ORDER_JOURNEY_STEPS = [
  { key: "placed", title: "Order placed", body: "You check out on the site in a few taps.", action: "Place the order" },
  { key: "accepted", title: "Order accepted", body: "We confirm your order by phone or message.", action: "Confirm on the call" },
  { key: "packed", title: "Packed", body: "Your saree is folded, checked and packed.", action: "Hand it to the courier" },
  { key: "delivery", title: "Out for delivery", body: "A courier brings it to your door.", action: "Ring the doorbell" },
  { key: "received", title: "Received", body: "Open the parcel and check it with the rider.", action: "Pay the rider" },
  { key: "paid", title: "Paid", body: "Pay on delivery, in cash or by mobile banking.", action: "Watch it again" },
] as const;

/** Home-page anchor that coming-soon categories and the "Soon" tags link to. */
export const COMING_SOON_ANCHOR = "coming-soon";
export const COMING_SOON_HREF = `/#${COMING_SOON_ANCHOR}`;

/** Fixed ends of the main navigation; the categories in between come from the database. */
export const NAV_SHOP = { label: "Shop", href: "/shop" } as const;
export const NAV_LEAD = { label: "New in", href: "/new" } as const;
export const NAV_TAIL = { label: "Sale", href: "/sale" } as const;
/** Category links in the desktop header bar (the mobile menu and footer list them all). */
export const HEADER_CATEGORY_LIMIT = 3;

export const ACCOUNT_TABS = [
  { key: "orders", label: "Orders" },
  { key: "returns", label: "Returns" },
  { key: "wishlist", label: "Wishlist" },
  { key: "addresses", label: "Addresses" },
  { key: "details", label: "Details" },
] as const;
export type AccountTab = (typeof ACCOUNT_TABS)[number]["key"];

export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://rooq.store";

/** Data-cache tag of every storefront catalogue read (lib/storefront/server-api.ts). */
export const CATALOG_CACHE_TAG = "storefront-catalog";

/** API path prefixes whose writes change what the storefront shows; a successful write revalidates the tag above. */
export const CATALOG_WRITE_PREFIXES = [
  "/api/v1/products",
  "/api/v1/product-media",
  "/api/v1/variants",
  "/api/v1/category",
  "/api/v1/categories",
  "/api/v1/brands",
  "/api/v1/collections",
  "/api/v1/collection-looks",
  "/api/v1/colors",
  "/api/v1/sizes",
  "/api/v1/size-charts",
  "/api/v1/inventory",
  "/api/v1/product-discounts",
  "/api/v1/reviews",
  "/api/v1/settings",
  "/api/v1/campaigns",
  "/api/v1/hero-slides",
  "/api/v1/policies",
  "/api/v1/tags",
  "/api/v1/orders",
  "/api/v1/returns",
] as const;

/** Checkout coupon box. Off for now: the field is hidden and no code is sent with the order. */
export const CHECKOUT_COUPONS_ENABLED = false;
/** Longest order note a shopper can leave at checkout. */
export const ORDER_NOTE_MAX = 500;
