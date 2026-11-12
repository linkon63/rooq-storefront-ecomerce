// ─── Campaigns ─────────────────────────────────────────────────────────────

export type CampaignImage = {
  id: string;
  images: string[];
};

export type CampaignSection = {
  id: string;
  title: string;
  position: number;
  page: string;
};

export type Campaign = {
  id: string;
  title: string;
  description?: string | null;
  /** Optional call-to-action link and its label. */
  linkUrl?: string | null;
  linkLabel?: string | null;
  status: "active" | "inactive";
  startAt: string;
  endAt?: string | null;
  hasDiscount?: boolean;
  discountId?: string | null;
  discount?: { id: string; name: string; type: "percentage" | "fixed"; value: number; startDate: string | null; endDate: string | null; status: "active" | "inactive" } | null;
  sectionId: string;
  section?: CampaignSection;
  /** Old shape: one entry holding every image URL. */
  images?: CampaignImage[];
  /** "/api/v1/media/<id>" URLs, in display order. */
  imageUrls?: string[];
  media?: ContentImage[];
  createdAt?: string;
  updatedAt?: string;
};

/** The API's image object: `{ id, url, alt, width, height }`. */
export type ContentImage = {
  id: string;
  url: string;
  alt: string | null;
  width: number | null;
  height: number | null;
};

// ─── Sections (home page blocks campaigns are filed under) ─────────────────

export type SectionInput = { title: string; page: string; position: number };

// ─── News / Blog ───────────────────────────────────────────────────────────

export type News = {
  id: string;
  title: string;
  slug: string;
  excerpt?: string | null;
  content: string;
  coverImageUrl?: string | null;
  coverMediaId?: string | null;
  coverImage?: ContentImage | null;
  author?: string | null;
  isPublished: boolean;
  publishedAt?: string | null;
  createdAt: string;
  updatedAt: string;
};

// ─── Reviews ─────────────────────────────────────────────────────────────────

export type ReviewStatus = "PENDING" | "APPROVED" | "REJECTED";
export type FitFeedback = "RUNS_SMALL" | "TRUE_TO_SIZE" | "RUNS_LARGE";

export type Review = {
  id: string;
  rating: number;
  title: string | null;
  comment: string | null;
  fitFeedback: FitFeedback | null;
  status: ReviewStatus;
  /** Kept alongside `status` for older screens. */
  isApproved: boolean;
  isVerifiedPurchase: boolean;
  createdAt: string;
  productId: string;
  userId: string;
  /** "Wears M" — the colour and size the reviewer bought. */
  variant: { color: string; size: string } | null;
  photos: ContentImage[];
  product?: { id: string; name: string; slug: string };
  user?: { id: string; name: string; email?: string | null; avatar: string | null };
};

export type PaginatedReviews = {
  data: Review[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};

export type UpdateReviewDto = {
  rating?: number;
  title?: string | null;
  comment?: string | null;
  fitFeedback?: FitFeedback | null;
  status?: ReviewStatus;
  isApproved?: boolean;
};

export type CreateReviewDto = {
  productId: string;
  rating: number;
  title?: string;
  comment?: string;
  fitFeedback?: FitFeedback;
  status?: ReviewStatus;
  isApproved?: boolean;
};

// ─── Product discounts ───────────────────────────────────────────────────────

export type DiscountProductSummary = {
  id: string;
  name: string;
  slug: string;
  status: string;
  price: number;
  compareAtPrice: number | null;
  image: ContentImage | null;
  variants: { id: string; sku: string; price: number; compareAtPrice: number | null; stock: number }[];
};

export type ProductDiscountInput = {
  name: string;
  type: "percentage" | "fixed";
  value: number;
  productIds: string[];
  startDate?: string | null;
  endDate?: string | null;
  status?: "active" | "inactive";
};

/** A product as the pickers need it (from GET /products?scope=admin). */
export type ProductOption = {
  id: string;
  name: string;
  slug: string;
  image?: { url: string } | null;
  media?: { media?: { url?: string } }[];
};
