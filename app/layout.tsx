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

export const metadata: Metadata = {
  title: "Organishi — Pure Organic Food, Straight From the Farm",
  description:
    "Cold pressed mustard oil, virgin coconut oil, hand-churned ghee, raw honey and organic snacks — sourced directly from farmers and delivered across Bangladesh.",
  icons: {
    icon: "/assets/Logo-English.png",
    shortcut: "/assets/Logo-English.png",
    apple: "/assets/Logo-English.png",
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
