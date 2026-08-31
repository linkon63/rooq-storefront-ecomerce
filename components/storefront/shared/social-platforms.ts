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
 *
 * `color` is each platform's own logo colour. It has to travel as a hex string
 * rather than a Tailwind class because Tailwind only ships classes it can see
 * spelled out in the source — one built from a variable is purged. Instagram's
 * real mark is a gradient, which a currentColor SVG cannot carry, so it uses
 * the solid pink Meta publishes for single-colour placements.
 */
export const SOCIAL_PLATFORMS: {
  key: keyof ShopSocialContact;
  label: string;
  Icon: IconType;
  color: string;
}[] = [
  { key: "facebook", label: "Facebook", Icon: FaFacebookF, color: "#1877F2" },
  { key: "instagram", label: "Instagram", Icon: FaInstagram, color: "#E4405F" },
  { key: "youtube", label: "Youtube", Icon: FaYoutube, color: "#FF0000" },
  { key: "tiktok", label: "TikTok", Icon: FaTiktok, color: "#010101" },
  { key: "twitter", label: "X-Twitter", Icon: FaXTwitter, color: "#000000" },
  { key: "linkedin", label: "LinkedIn", Icon: FaLinkedinIn, color: "#0A66C2" },
];

/**
 * Drop every platform the admin left blank, so the storefront only ever links
 * to profiles that actually exist.
 */
export function activeSocialLinks(social?: ShopSocialContact | null) {
  return SOCIAL_PLATFORMS.flatMap(({ key, label, Icon, color }) => {
    const href = social?.[key]?.trim();
    return href ? [{ key, label, Icon, color, href }] : [];
  });
}
