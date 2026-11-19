import { apiRequest, jsonInit } from "@/lib/admin/http";
import type { AdminGalleryEntry, GallerySource, GalleryStatus } from "@/types/gallery";

const UPLOAD_TIMEOUT_MS = 60_000;

export type GalleryFilters = { status?: GalleryStatus; source?: GallerySource };

/** Customer gallery (app/api/v1/gallery). */
export const galleryApi = {
  list: ({ status, source }: GalleryFilters = {}) => {
    const query = new URLSearchParams();
    if (status) query.set("status", status);
    if (source) query.set("source", source);
    const suffix = query.size ? `?${query}` : "";
    return apiRequest<AdminGalleryEntry[]>(`/gallery/admin${suffix}`);
  },
  create: (body: FormData) =>
    apiRequest<AdminGalleryEntry>("/gallery/admin", { method: "POST", body, timeoutMs: UPLOAD_TIMEOUT_MS }),
  update: (id: string, body: FormData) =>
    apiRequest<AdminGalleryEntry>(`/gallery/${id}`, { method: "PUT", body, timeoutMs: UPLOAD_TIMEOUT_MS }),
  setStatus: (id: string, status: GalleryStatus) => apiRequest<AdminGalleryEntry>(`/gallery/${id}`, jsonInit("PATCH", { status })),
  remove: (id: string) => apiRequest<{ message: string }>(`/gallery/${id}`, { method: "DELETE" }),
};
