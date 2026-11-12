import { apiRequest } from "@/lib/admin/http";
import type { Attribute, Category, ReorderCategoryItem, Tag, Unit } from "@/types/admin/catalog";
import type { AdjustStockPayload, AdminBackInStock, AdminBackInStockSummary, AdminBrand, AdminCategory, AdminCollection, AdminCollectionDetail, AdminColor, AdminInventoryRow, AdminLook, AdminMovement, AdminProduct, AdminProductList, AdminProductMedia, AdminSize, AdminSizeChart, AdminVariant, CollectionPayload, ColorPayload, LookPayload, LowStockReport, MatrixCreated, MatrixPayload, MatrixPreview, Paginated, ProductPayload, SizeChartPayload, SizePayload, VariantBulkItem } from "@/types/catalog-admin";

/**
 * Persist a new category tree layout. Send the full flat list of categories
 * with their new parentId and zero-based sortOrder; the API applies every
 * change in one transaction and returns the freshly ordered tree.
 */
export async function reorderCategories(
  items: ReorderCategoryItem[],
): Promise<Category[]> {
  return apiRequest<Category[]>("/category/reorder", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ items }),
  });
}

// ─── Catalog: products, variants, masters, inventory, back-in-stock ─────────

const catalogJson = (method: "POST" | "PATCH", body: unknown, timeoutMs?: number) => ({
  method,
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(body),
  timeoutMs,
});
const LONG_REQUEST_MS = 60_000;
const del = (path: string) => apiRequest<{ message: string; archived?: boolean }>(path, { method: "DELETE" });

/** Admin catalog client — every call hits the same-origin /api/v1 routes. */
export const catalogApi = {
  products: {
    list: (params: URLSearchParams) => apiRequest<AdminProductList>(`/products?${params.toString()}`),
    get: (id: string) => apiRequest<AdminProduct>(`/products/${id}?includeArchived=true`),
    create: (body: ProductPayload) => apiRequest<AdminProduct>("/products", catalogJson("POST", body, LONG_REQUEST_MS)),
    update: (id: string, body: Partial<ProductPayload>) => apiRequest<AdminProduct>(`/products/${id}`, catalogJson("PATCH", body, LONG_REQUEST_MS)),
    archive: (id: string) => del(`/products/${id}`),
    restore: (id: string) => apiRequest<AdminProduct>(`/products/${id}/restore`, { method: "POST" }),
  },
  media: {
    upload: (productId: string, file: File, fields: { colorId?: string | null; isPrimary?: boolean; alt?: string }) => {
      const body = new FormData();
      body.append("file", file);
      if (fields.colorId) body.append("colorId", fields.colorId);
      if (fields.isPrimary) body.append("isPrimary", "true");
      if (fields.alt) body.append("alt", fields.alt);
      return apiRequest<AdminProductMedia>(`/products/${productId}/media`, { method: "POST", body, timeoutMs: LONG_REQUEST_MS });
    },
    update: (id: string, body: { colorId?: string | null; position?: number; isPrimary?: boolean; alt?: string | null }) =>
      apiRequest<AdminProductMedia>(`/product-media/${id}`, catalogJson("PATCH", body)),
    remove: (id: string) => del(`/product-media/${id}`),
    reorder: (productId: string, items: { id: string; position: number }[]) =>
      apiRequest<AdminProductMedia[]>(`/products/${productId}/media/reorder`, catalogJson("PATCH", { items })),
  },
  variants: {
    list: (productId: string) => apiRequest<AdminVariant[]>(`/products/${productId}/variants`),
    preview: (productId: string, body: MatrixPayload) =>
      apiRequest<MatrixPreview>(`/products/${productId}/variants/generate`, catalogJson("POST", { ...body, dryRun: true })),
    generate: (productId: string, body: MatrixPayload) =>
      apiRequest<MatrixCreated>(`/products/${productId}/variants/generate`, catalogJson("POST", { ...body, dryRun: false }, LONG_REQUEST_MS)),
    bulk: (items: VariantBulkItem[], reason?: string) =>
      apiRequest<{ updated: number }>("/variants/bulk", catalogJson("PATCH", { items, reason }, LONG_REQUEST_MS)),
    remove: (id: string) => del(`/variants/${id}`),
  },
  colors: {
    list: () => apiRequest<AdminColor[]>("/colors"),
    save: (id: string | null, body: Partial<ColorPayload>) =>
      apiRequest<AdminColor>(id ? `/colors/${id}` : "/colors", catalogJson(id ? "PATCH" : "POST", body)),
    remove: (id: string) => del(`/colors/${id}`),
  },
  sizes: {
    list: () => apiRequest<AdminSize[]>("/sizes"),
    save: (id: string | null, body: Partial<SizePayload>) =>
      apiRequest<AdminSize>(id ? `/sizes/${id}` : "/sizes", catalogJson(id ? "PATCH" : "POST", body)),
    reorder: (items: { id: string; sortOrder: number }[]) => apiRequest<AdminSize[]>("/sizes/reorder", catalogJson("PATCH", { items })),
    remove: (id: string) => del(`/sizes/${id}`),
  },
  sizeCharts: {
    list: () => apiRequest<AdminSizeChart[]>("/size-charts"),
    get: (id: string) => apiRequest<AdminSizeChart>(`/size-charts/${id}`),
    save: (id: string | null, body: Partial<SizeChartPayload>) =>
      apiRequest<AdminSizeChart>(id ? `/size-charts/${id}` : "/size-charts", catalogJson(id ? "PATCH" : "POST", body, LONG_REQUEST_MS)),
    remove: (id: string) => del(`/size-charts/${id}`),
  },
  collections: {
    list: () => apiRequest<AdminCollection[]>("/collections?scope=admin"),
    get: (id: string) => apiRequest<AdminCollectionDetail>(`/collections/${id}`),
    save: (id: string | null, body: Partial<CollectionPayload>) =>
      apiRequest<AdminCollectionDetail>(id ? `/collections/${id}` : "/collections", catalogJson(id ? "PATCH" : "POST", body, LONG_REQUEST_MS)),
    remove: (id: string) => del(`/collections/${id}`),
    addLook: (collectionId: string, body: LookPayload) => apiRequest<AdminLook>(`/collections/${collectionId}/looks`, catalogJson("POST", body)),
    updateLook: (id: string, body: LookPayload) => apiRequest<AdminLook>(`/collection-looks/${id}`, catalogJson("PATCH", body)),
    removeLook: (id: string) => del(`/collection-looks/${id}`),
  },
  inventory: {
    list: (params: URLSearchParams) => apiRequest<Paginated<AdminInventoryRow>>(`/inventory?${params.toString()}`),
    variant: (variantId: string) => apiRequest<AdminInventoryRow & { movements: AdminMovement[] }>(`/inventory/variant/${variantId}`),
    adjust: (body: AdjustStockPayload) => apiRequest<{ variant: AdminInventoryRow; movement: AdminMovement | null }>("/inventory/adjust", catalogJson("POST", body)),
    movements: (params: URLSearchParams) => apiRequest<Paginated<AdminMovement>>(`/inventory/logs?${params.toString()}`),
    lowStock: (limit = 20) => apiRequest<LowStockReport>(`/inventory/low-stock?limit=${limit}`),
  },
  backInStock: {
    list: (params: URLSearchParams) => apiRequest<Paginated<AdminBackInStock>>(`/back-in-stock?${params.toString()}`),
    summary: () => apiRequest<AdminBackInStockSummary[]>("/back-in-stock/summary"),
    notify: (variantId: string) => apiRequest<{ notified: number }>("/back-in-stock/notify", catalogJson("POST", { variantId }, LONG_REQUEST_MS)),
    remove: (id: string) => del(`/back-in-stock/${id}`),
  },
  /** Masters the product editor picks from. */
  lookups: {
    categories: () => apiRequest<AdminCategory[]>("/category"),
    brands: () => apiRequest<AdminBrand[]>("/brands"),
    tags: () => apiRequest<Tag[]>("/tags"),
    units: () => apiRequest<Unit[]>("/units"),
    suppliers: () => apiRequest<{ id: string; name: string; isActive: boolean }[]>("/suppliers"),
    attributes: () => apiRequest<Attribute[]>("/attributes"),
  },
  /** Upload an image on its own (cover, look image) → { url, id }. */
  uploadImage: (file: File) => {
    const body = new FormData();
    body.append("file", file);
    return apiRequest<{ url: string; id: string }>("/upload", { method: "POST", body, timeoutMs: LONG_REQUEST_MS });
  },
};
