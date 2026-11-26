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
  /** Home "sale ends in" banner: its live campaign needs an end date. */
  countdown: "Sale Countdown",
} as const;

/**
 * The sections the website actually renders, with what the admin is told about
 * each. Only these can be added in Campaigns; any other title shows nowhere.
 */
export const SECTION_GUIDE = [
  {
    title: SECTION_TITLES.countdown,
    where: "Home page, just below New In, with a ticking countdown.",
    howTo: "Add a photo and an end date. Every running sale gets its own slide, the one ending soonest first.",
  },
  {
    title: SECTION_TITLES.hero,
    where: "Top of the home page.",
    howTo:
      "Add a photo. With Settings → Hero Slider set to Campaign, the newest live one shows as a large banner; in Slider mode only its description and button are used.",
  },
] as const;

/** Shown for a section that is not in SECTION_GUIDE. */
export const SECTION_HIDDEN_NOTE = "Not shown on the website. Campaigns filed here will not appear anywhere.";

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
