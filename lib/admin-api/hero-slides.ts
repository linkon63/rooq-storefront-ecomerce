import { apiRequest } from "@/lib/admin/http";
import type { AdminHeroSlide, HeroMode } from "@/types/admin/hero";

const json = (method: string, body: unknown) => ({ method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });

/** Home hero slides and mode (app/api/v1/hero-slides). */
export const heroApi = {
  list: () => apiRequest<AdminHeroSlide[]>("/hero-slides"),
  /** One slide per file; a product link is applied when a single file is sent. */
  upload: (files: readonly File[], productId: string | null) => {
    const body = new FormData();
    files.forEach((file) => body.append("image", file));
    if (productId && files.length === 1) body.append("productId", productId);
    return apiRequest<AdminHeroSlide[]>("/hero-slides", { method: "POST", body });
  },
  update: (id: string, patch: { productId?: string | null; isActive?: boolean }) =>
    apiRequest<AdminHeroSlide>(`/hero-slides/${id}`, json("PATCH", patch)),
  remove: (id: string) => apiRequest<{ message: string }>(`/hero-slides/${id}`, { method: "DELETE" }),
  reorder: (ids: readonly string[]) => apiRequest<AdminHeroSlide[]>("/hero-slides/reorder", json("PUT", { ids })),
  getMode: () => apiRequest<{ mode: HeroMode }>("/hero-slides/mode"),
  setMode: (mode: HeroMode) => apiRequest<{ mode: HeroMode }>("/hero-slides/mode", json("PUT", { mode })),
};
