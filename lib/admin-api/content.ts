import { apiRequest } from "@/lib/admin/http";
import type { Campaign, CampaignSection, CreateReviewDto, News, PaginatedReviews, ProductDiscountInput, ProductOption, Review, SectionInput, UpdateReviewDto } from "@/types/admin/content";

export async function getCampaigns(): Promise<Campaign[]> {
  return apiRequest<Campaign[]>("/campaigns");
}

export async function getCampaignSections(): Promise<CampaignSection[]> {
  return apiRequest<CampaignSection[]>("/campaigns/sections");
}

/** Multipart: fields + `images` files; `keepImages` (JSON array of URLs) on update. */
export async function saveCampaign(id: string | undefined, body: FormData): Promise<Campaign> {
  return apiRequest<Campaign>(id ? `/campaigns/${id}` : "/campaigns", { method: id ? "PATCH" : "POST", body });
}

export async function setCampaignStatus(id: string, status: Campaign["status"]): Promise<Campaign> {
  return apiRequest<Campaign>(`/campaigns/${id}/status`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status }),
  });
}

export async function deleteCampaign(id: string): Promise<void> {
  await apiRequest<{ message: string }>(`/campaigns/${id}`, { method: "DELETE" });
}

export async function createSection(input: SectionInput): Promise<CampaignSection> {
  return apiRequest<CampaignSection>("/sections", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
}

export async function updateSection(id: string, input: Partial<SectionInput>): Promise<CampaignSection> {
  return apiRequest<CampaignSection>(`/sections/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
}

export async function deleteSection(id: string): Promise<void> {
  await apiRequest<CampaignSection>(`/sections/${id}`, { method: "DELETE" });
}

// Admin: all articles (drafts included).
export async function getAllNews(): Promise<News[]> {
  return apiRequest<News[]>("/news/manage");
}

// Public: published articles only.
export async function getPublishedNews(): Promise<News[]> {
  return apiRequest<News[]>("/news", { auth: false });
}

// Public: a single published article by slug.
export async function getNewsBySlug(slug: string): Promise<News> {
  return apiRequest<News>(`/news/slug/${slug}`, { auth: false });
}

export async function createNews(body: FormData): Promise<News> {
  return apiRequest<News>("/news", { method: "POST", body });
}

export async function updateNews(id: string, body: FormData): Promise<News> {
  return apiRequest<News>(`/news/${id}`, { method: "PATCH", body });
}

export async function deleteNews(id: string): Promise<void> {
  return apiRequest<void>(`/news/${id}`, { method: "DELETE" });
}

export async function getAllReviews(params?: Record<string, string>): Promise<PaginatedReviews> {
  const qs = params ? `?${new URLSearchParams(params)}` : "";
  return apiRequest<PaginatedReviews>(`/reviews${qs}`);
}

export async function updateReview(id: string, dto: UpdateReviewDto): Promise<Review> {
  return apiRequest<Review>(`/reviews/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(dto),
  });
}

export async function createReview(dto: CreateReviewDto): Promise<Review> {
  return apiRequest<Review>("/reviews", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(dto),
  });
}

export async function deleteReview(id: string): Promise<void> {
  await apiRequest<{ message: string }>(`/reviews/${id}`, { method: "DELETE" });
}

/** Every product for the admin pickers (discounts, reviews). */
export async function getProductOptions(): Promise<ProductOption[]> {
  const res = await apiRequest<{ data: ProductOption[] } | ProductOption[]>(
    "/products?scope=admin&facets=false&limit=200",
  );
  return Array.isArray(res) ? res : (res?.data ?? []);
}

export async function saveProductDiscount(id: string | undefined, input: Partial<ProductDiscountInput>) {
  return apiRequest<{ id: string }>(id ? `/product-discounts/${id}` : "/product-discounts", {
    method: id ? "PATCH" : "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
}

export async function deleteProductDiscount(id: string): Promise<void> {
  await apiRequest<{ message: string }>(`/product-discounts/${id}`, { method: "DELETE" });
}
