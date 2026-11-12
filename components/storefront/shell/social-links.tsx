import type { IconType } from "react-icons";
import { FaFacebookF, FaInstagram, FaLinkedinIn, FaPinterestP, FaTiktok, FaXTwitter, FaYoutube } from "react-icons/fa6";
import type { SocialLinks as Links } from "@/types/storefront/content";

const PLATFORMS: { key: keyof Links; label: string; Icon: IconType }[] = [
  { key: "instagram", label: "Instagram", Icon: FaInstagram },
  { key: "tiktok", label: "TikTok", Icon: FaTiktok },
  { key: "facebook", label: "Facebook", Icon: FaFacebookF },
  { key: "youtube", label: "YouTube", Icon: FaYoutube },
  { key: "pinterest", label: "Pinterest", Icon: FaPinterestP },
  { key: "twitter", label: "X", Icon: FaXTwitter },
  { key: "linkedin", label: "LinkedIn", Icon: FaLinkedinIn },
];

export function SocialLinks({ social }: { social: Links }) {
  const links = PLATFORMS.filter((platform) => social[platform.key]);
  if (links.length === 0) return null;
  return (
    <ul className="mt-5 flex gap-1">
      {links.map(({ key, label, Icon }) => (
        <li key={key}>
          <a
            href={social[key] ?? undefined}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Rooq on ${label}`}
            className="grid size-10 place-items-center rounded hover:bg-chalk/10"
          >
            <Icon aria-hidden className="size-4" />
          </a>
        </li>
      ))}
    </ul>
  );
}
