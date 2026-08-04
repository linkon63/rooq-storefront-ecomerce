import type { Metadata } from "next";
import localFont from "next/font/local";
import { Inter, Playfair_Display, Poppins } from "next/font/google";
import "./globals.css";

// ─── Storefront typography (cap-1) ───────────────────────────────────────────
const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  variable: "--font-inter",
  display: "swap",
});

// Headings in the Organishi mockups are a serif display face.
const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-display",
  display: "swap",
});

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-poppins",
  display: "swap",
});

// ─── Admin typography ────────────────────────────────────────────────────────
// The admin panel styles ~95 elements with font-gotham / font-bembo, so both
// families stay loaded even though the storefront no longer uses them.
const bembo = localFont({
  src: [
    {
      path: "./fonts/Bembo-Std-Font/BemboStd.otf",
      weight: "400",
      style: "normal",
    },
    {
      path: "./fonts/Bembo-Std-Font/BemboStd-Bold.otf",
      weight: "700",
      style: "normal",
    },
    {
      path: "./fonts/Bembo-Std-Font/BemboStd-SemiboldItalic.otf",
      weight: "600",
      style: "italic",
    },
  ],
  variable: "--font-bembo",
});

const gotham = localFont({
  src: [
    {
      path: "./fonts/Gotham/Gotham-Thin.otf",
      weight: "100",
      style: "normal",
    },
    {
      path: "./fonts/Gotham/Gotham-Medium.otf",
      weight: "500",
      style: "normal",
    },
  ],
  variable: "--font-gotham",
});

export const metadata: Metadata = {
  title: "Organishi — Pure Organic Food, Straight From the Farm",
  description:
    "Cold pressed mustard oil, virgin coconut oil, hand-churned ghee, raw honey and organic snacks — sourced directly from farmers and delivered across Bangladesh.",
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
      className={`h-full antialiased scroll-smooth ${inter.variable} ${poppins.variable} ${playfair.variable} ${bembo.variable} ${gotham.variable}`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
