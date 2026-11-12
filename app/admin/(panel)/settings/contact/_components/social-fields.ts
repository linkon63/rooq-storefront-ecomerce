import type { ComponentType } from "react";
import { FaFacebookF, FaInstagram, FaLinkedinIn, FaPinterestP, FaTiktok, FaXTwitter, FaYoutube } from "react-icons/fa6";
import type { SettingsSocialContact } from "@/types/admin/settings";

export type SocialKey = keyof SettingsSocialContact;

export const SOCIAL_FIELDS: readonly {
  key: SocialKey;
  label: string;
  placeholder: string;
  bg: string;
  Icon: ComponentType<{ className?: string }>;
}[] = [
  { key: "instagram", label: "Instagram", placeholder: "https://www.instagram.com/yourhandle", bg: "bg-gradient-to-br from-[#833ab4] via-[#fd1d1d] to-[#fcb045]", Icon: FaInstagram },
  { key: "tiktok", label: "TikTok", placeholder: "https://www.tiktok.com/@yourhandle", bg: "bg-[#010101]", Icon: FaTiktok },
  { key: "pinterest", label: "Pinterest", placeholder: "https://www.pinterest.com/yourboard", bg: "bg-[#e60023]", Icon: FaPinterestP },
  { key: "facebook", label: "Facebook", placeholder: "https://www.facebook.com/yourpage", bg: "bg-[#1877f2]", Icon: FaFacebookF },
  { key: "youtube", label: "YouTube", placeholder: "https://www.youtube.com/@yourchannel", bg: "bg-[#ff0000]", Icon: FaYoutube },
  { key: "twitter", label: "X (Twitter)", placeholder: "https://x.com/yourhandle", bg: "bg-[#0f1419]", Icon: FaXTwitter },
  { key: "linkedin", label: "LinkedIn", placeholder: "https://www.linkedin.com/company/yourcompany", bg: "bg-[#0a66c2]", Icon: FaLinkedinIn },
];
