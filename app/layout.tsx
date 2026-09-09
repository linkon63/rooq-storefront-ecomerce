import type { Metadata } from "next";
import { Hind_Siliguri, Poppins } from "next/font/google";
import "./globals.css";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  variable: "--font-poppins",
  display: "swap",
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
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://organishi.com";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Organishi — Pure Organic Food, Straight From the Farm",
    template: "%s | Organishi",
  },
  description:
    "Nature has always known what’s best for us. Organishi brings that goodness closer to you with thoughtfully selected, natural and wholesome foods you can trust. We believe healthy living doesn’t have to be complicated—it starts with simple, better choices, every day.",
  keywords: [
    "Organishi",
    "organic food Bangladesh",
    "cold pressed mustard oil",
    "virgin coconut oil",
    "hand churned ghee",
    "raw honey",
    "organic snacks",
    "pure organic food",
  ],
  authors: [{ name: "Organishi" }],
  creator: "Organishi",
  publisher: "Organishi",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  icons: {
    icon: "/assets/Logo-English.png",
    shortcut: "/assets/Logo-English.png",
    apple: "/assets/Logo-English.png",
  },
  openGraph: {
    title: "Organishi — Pure Organic Food, Straight From the Farm",
    description:
      "Nature has always known what’s best for us. Organishi brings that goodness closer to you with thoughtfully selected, natural and wholesome foods you can trust. We believe healthy living doesn’t have to be complicated—it starts with simple, better choices, every day.",
    url: siteUrl,
    siteName: "Organishi",
    images: [
      {
        url: "/assets/Logo-English.png",
        width: 1200,
        height: 630,
        alt: "Organishi Organic Food",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Organishi — Pure Organic Food, Straight From the Farm",
    description:
      "Nature has always known what’s best for us. Organishi brings that goodness closer to you with thoughtfully selected, natural and wholesome foods you can trust. We believe healthy living doesn’t have to be complicated—it starts with simple, better choices, every day.",
    images: ["/assets/Logo-English.png"],
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
      className={`h-full antialiased scroll-smooth ${poppins.variable} ${hindSiliguri.variable}`}
    >
      <body className="min-h-full flex flex-col font-sans">{children}</body>
    </html>
  );
}
