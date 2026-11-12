import type { Metadata } from "next";
import { Archivo, Hind_Siliguri, Poppins } from "next/font/google";
import "./globals.css";
import { StoreProvider } from "@/lib/store/store-provider";

/**
 * Storefront face: Archivo, variable on weight and width. The width axis is
 * the type hierarchy (expanded display, normal body) — see
 * docs/design/storefront-design.md.
 */
const archivo = Archivo({
  subsets: ["latin"],
  axes: ["wdth"],
  variable: "--font-archivo",
  display: "swap",
});

/** Admin panel face (not preloaded: the storefront never renders it). */
const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  variable: "--font-poppins",
  display: "swap",
  preload: false,
});

/**
 * Bengali companion to Poppins. Customer reviews and product copy mix Bangla
 * into English sentences, and Poppins carries no Bengali glyphs — without this
 * the browser drops them onto whatever generic sans the device happens to ship,
 * which differs on every platform. Latin still renders in Poppins: the fallback
 * is per-glyph, so only the Bangla reaches this face.
 */
const hindSiliguri = Hind_Siliguri({
  subsets: ["bengali"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-bengali",
  display: "swap",
  preload: false,
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://rooq.store";
const siteTitle = "Rooq — Modern Fashion for Men, Women & Kids";
const siteDescription =
  "Rooq is a modern fashion label: considered clothing, footwear and accessories for men, women and kids. New arrivals every week, easy size guides and free returns.";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: siteTitle,
    template: "%s | Rooq",
  },
  description: siteDescription,
  keywords: ["Rooq", "fashion", "clothing", "men's fashion", "women's fashion", "kids fashion", "footwear", "accessories"],
  authors: [{ name: "Rooq" }],
  creator: "Rooq",
  publisher: "Rooq",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    title: siteTitle,
    description: siteDescription,
    url: siteUrl,
    siteName: "Rooq",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: siteTitle,
    description: siteDescription,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`h-full antialiased scroll-smooth ${archivo.variable} ${poppins.variable} ${hindSiliguri.variable}`}
    >
      <body className="min-h-full flex flex-col font-sans">
        <StoreProvider>{children}</StoreProvider>
      </body>
    </html>
  );
}
