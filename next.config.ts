import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    root: __dirname,
  },
  // Native / Node-only server deps stay out of the server bundle.
  serverExternalPackages: ["sharp", "pdfkit", "@prisma/client", "@prisma/adapter-pg", "pg", "bcryptjs"],
  images: {
    // Same-origin images next/image may optimise. Database images are served
    // by the API route below; the rest are static files in /public.
    localPatterns: [
      { pathname: "/api/v1/media/**" },
      { pathname: "/images/**" },
    ],
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com", pathname: "/**" },
      // Google account profile pictures (OAuth avatars)
      { protocol: "https", hostname: "lh3.googleusercontent.com", pathname: "/**" },
    ],
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
