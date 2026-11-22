import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Client router cache: revisiting a page (logo → home, back to the shop) renders
  // instantly; the server data cache (CATALOG_REVALIDATE_SECONDS) keeps it fresh.
  experimental: {
    staleTimes: { dynamic: 30, static: 180 },
  },
  turbopack: {
    root: __dirname,
  },
  // Native / Node-only server deps stay out of the server bundle.
  serverExternalPackages: ["sharp", "pdfkit", "@prisma/client", "@prisma/adapter-pg", "pg", "bcryptjs"],
  images: {
    // No /_next/image: database images are resized by GET /api/v1/media/:id?w=
    // and cached by the CDN (see utils/image-loader.ts); the rest load as is.
    loader: "custom",
    loaderFile: "./utils/image-loader.ts",
  },
  async headers() {
    return [
      {
        source: "/sw.js",
        headers: [
          { key: "Cache-Control", value: "no-cache, no-store, must-revalidate" },
          { key: "Service-Worker-Allowed", value: "/" },
        ],
      },
    ];
  },
  async redirects() {
    return [
      {
        source: "/account",
        destination: "/profile",
        permanent: true,
      },
      {
        source: "/orders",
        destination: "/profile?tab=orders",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
