import type { IconType } from "react-icons";
import {
  FaFacebookF,
  FaInstagram,
  FaLinkedinIn,
  FaTiktok,
  FaXTwitter,
  FaYoutube,
} from "react-icons/fa6";

import type { ShopSocialContact } from "@/lib/shop-api";

/**
 * The six platforms Admin → Settings → Contact & Social Media can populate,
 * in the order the storefront renders them. Keys match the `socialContact`
 * JSON column on the Setting model.
 */
export const SOCIAL_PLATFORMS: {
  key: keyof ShopSocialContact;
  label: string;
  Icon: IconType;
}[] = [
  { key: "facebook", label: "Facebook", Icon: FaFacebookF },
  { key: "instagram", label: "Instagram", Icon: FaInstagram },
  { key: "youtube", label: "Youtube", Icon: FaYoutube },
  { key: "tiktok", label: "TikTok", Icon: FaTiktok },
  { key: "twitter", label: "X-Twitter", Icon: FaXTwitter },
  { key: "linkedin", label: "LinkedIn", Icon: FaLinkedinIn },
];

/**
 * Drop every platform the admin left blank, so the storefront only ever links
 * to profiles that actually exist.
 */
export function activeSocialLinks(social?: ShopSocialContact | null) {
  return SOCIAL_PLATFORMS.flatMap(({ key, label, Icon }) => {
    const href = social?.[key]?.trim();
    return href ? [{ key, label, Icon, href }] : [];
  });
}
