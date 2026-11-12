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
