import { apiRequest, jsonInit } from "@/lib/admin/http";
import type { AdminReel } from "@/types/admin/reel";

const UPLOAD_TIMEOUT_MS = 60_000;

/** Home page reels (app/api/v1/reels). */
export const reelsApi = {
  list: () => apiRequest<AdminReel[]>("/reels"),
  upload: (video: File, productId: string) => {
    const body = new FormData();
    body.append("video", video);
    body.append("productId", productId);
    return apiRequest<AdminReel>("/reels", { method: "POST", body, timeoutMs: UPLOAD_TIMEOUT_MS });
  },
  update: (id: string, patch: { productId?: string; isActive?: boolean }) => apiRequest<AdminReel>(`/reels/${id}`, jsonInit("PATCH", patch)),
  remove: (id: string) => apiRequest<{ message: string }>(`/reels/${id}`, { method: "DELETE" }),
  reorder: (ids: readonly string[]) => apiRequest<AdminReel[]>("/reels/reorder", jsonInit("PUT", { ids })),
};
