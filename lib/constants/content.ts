/** Limits and keys for the content & marketing domain (reviews, news, campaigns, discounts). */

/** Photos a shopper may attach to one review. */
export const REVIEW_MAX_PHOTOS = 5;
/** Images one campaign may carry (the old FilesInterceptor limit). */
export const CAMPAIGN_MAX_IMAGES = 10;
/** Upper bound of a percentage discount. */
export const MAX_DISCOUNT_PERCENT = 100;

export const REVIEW_SORTS = ["newest", "rating_desc", "rating_asc"] as const;
export type ReviewSort = (typeof REVIEW_SORTS)[number];

/** Section titles the storefront and admin know by name (stored data — do not rename). */
export const SECTION_TITLES = {
  hero: "Hero Campaign",
  banner: "Banner Campaign",
  newArrivals: "New Arrivals Banner",
  lookbook: "Lookbook Banner",
  collections: "Collections Banner",
} as const;

/** Page key of the home page sections. */
export const HOME_PAGE_KEY = "home";

/** Shopper-facing wording of the fit feedback values. */
export const FIT_FEEDBACK_LABELS = {
  RUNS_SMALL: "Runs small",
  TRUE_TO_SIZE: "True to size",
  RUNS_LARGE: "Runs large",
} as const;

export const REVIEW_STATUS_LABELS = {
  PENDING: "Pending",
  APPROVED: "Approved",
  REJECTED: "Rejected",
} as const;
