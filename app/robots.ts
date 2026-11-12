import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/constants/storefront";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = SITE_URL.replace(/\/$/, "");
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin", "/admin/*", "/api/*", "/profile", "/profile/*", "/cart", "/checkout", "/confirmation", "/compare"],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
