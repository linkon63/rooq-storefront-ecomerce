import type { ProductCard } from "./catalog";

/** Storefront view of settings, policies and the signed-in shopper. */

export type ContactEntry = { title: string | null; value: string };

export type SocialLinks = Partial<
  Record<"facebook" | "instagram" | "youtube" | "tiktok" | "twitter" | "linkedin" | "pinterest", string | null>
>;

/** The subset of GET /settings the storefront reads, already normalised. */
export type StoreSettings = {
  shopName: string;
  slogan: string | null;
  footerDescription: string | null;
  currency: string;
  logoUrl: string | null;
  phones: ContactEntry[];
  emails: ContactEntry[];
  address: string | null;
  openingTime: string | null;
  closingTime: string | null;
  social: SocialLinks;
  delivery: {
    inside: number;
    nearCity: number;
    outside: number;
    freeShippingThreshold: number | null;
    returnWindowDays: number;
  };
};

/** An image shown in the home hero. */
export type HeroImage = { id: string; url: string; alt: string | null; width: number | null; height: number | null };

/** The live hero campaign: its copy, call to action and images (first live campaign in the hero section). */
export type HeroCampaign = {
  title: string;
  description: string | null;
  linkUrl: string | null;
  linkLabel: string | null;
  images: HeroImage[];
};

/** One slide of the hero slider; `product` is the linked product's card (its details show in the hero corner). */
export type HeroSlide = { id: string; image: HeroImage; product: ProductCard | null };

/** What the home hero renders: the admin's chosen mode with its slides and the live hero campaign. */
export type HomeHeroData = { mode: "SLIDER" | "CAMPAIGN"; slides: HeroSlide[]; campaign: HeroCampaign | null };

export type StorePolicy = { key: string; title: string; content: string };

export type Shopper = {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  avatarUrl: string | null;
};

export type ShopperNotification = {
  id: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
};
