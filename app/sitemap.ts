import type { MetadataRoute } from "next";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://organishi.com").replace(/\/$/, "");

  // Static customer-facing store routes
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${baseUrl}/shop`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${baseUrl}/privacy-policy`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.3,
    },
    {
      url: `${baseUrl}/terms-and-conditions`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.3,
    },
  ];

  // Dynamic product routes fetched from backend API
  let productRoutes: MetadataRoute.Sitemap = [];

  try {
    const apiBaseUrl =
      process.env.API_BASE_URL ??
      process.env.NEXT_PUBLIC_API_BASE_URL ??
      "http://localhost:5020/api/v1";

    const res = await fetch(`${apiBaseUrl}/products?limit=200`, {
      next: { revalidate: 3600 },
    });

    if (res.ok) {
      const paginated = await res.json();
      const products = Array.isArray(paginated.data)
        ? paginated.data
        : Array.isArray(paginated)
        ? paginated
        : [];

      productRoutes = products.map((product: { id: string; updatedAt?: string }) => ({
        url: `${baseUrl}/product/${product.id}`,
        lastModified: product.updatedAt ? new Date(product.updatedAt) : new Date(),
        changeFrequency: "weekly" as const,
        priority: 0.8,
      }));
    }
  } catch (error) {
    console.error("Failed to fetch products for sitemap:", error);
  }

  return [...staticRoutes, ...productRoutes];
}
