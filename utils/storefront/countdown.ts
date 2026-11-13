import { HOME_PAGE_KEY, SECTION_TITLES } from "@/lib/constants/content";
import type { HeroImage, SaleCountdownCampaign } from "@/types/storefront/content";
import { formatMoney } from "./money";

/** Pure helpers for the home "Sale Countdown" banner and the admin preview. */

export type TimeLeft = { days: number; hours: number; minutes: number; seconds: number; totalMs: number };

const SECOND = 1000;
const MINUTE = 60 * SECOND;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

/** Time remaining until `endAt` (all zero once it has passed). */
export function timeLeft(endAt: Date | string | number, now: number): TimeLeft {
  const totalMs = Math.max(0, new Date(endAt).getTime() - now);
  return {
    days: Math.floor(totalMs / DAY),
    hours: Math.floor((totalMs % DAY) / HOUR),
    minutes: Math.floor((totalMs % HOUR) / MINUTE),
    seconds: Math.floor((totalMs % MINUTE) / SECOND),
    totalMs,
  };
}

/** `7` → `"07"`. */
export const pad2 = (value: number): string => String(value).padStart(2, "0");

/** Compact "2d 04h 15m" (admin preview); "Ended" at zero. */
export function formatTimeLeft(left: TimeLeft): string {
  if (left.totalMs <= 0) return "Ended";
  const clock = `${pad2(left.hours)}h ${pad2(left.minutes)}m`;
  return left.days > 0 ? `${left.days}d ${clock}` : `${clock} ${pad2(left.seconds)}s`;
}

/** Is this the home countdown section? */
export function isCountdownSection(section: { title: string; page: string } | null | undefined): boolean {
  return section?.page === HOME_PAGE_KEY && section.title === SECTION_TITLES.countdown;
}

/** "20% off" / "৳500 off". */
export function discountLabel(discount: SaleCountdownCampaign["discount"], currency: string): string | null {
  if (!discount || discount.value <= 0) return null;
  return discount.type === "percentage" ? `${discount.value}% off` : `${formatMoney(discount.value, currency)} off`;
}

type CountdownCampaignLike = {
  id: string;
  title: string;
  description: string | null;
  linkUrl: string | null;
  linkLabel: string | null;
  endAt: Date | string | null;
  section: { title: string; page: string };
  media: HeroImage[];
  discount: { name: string; type: "percentage" | "fixed"; value: number } | null;
};

/** First live countdown campaign (the list is already live-only) whose end is still ahead. */
export function toSaleCountdown(campaigns: readonly CountdownCampaignLike[], now: number): SaleCountdownCampaign | null {
  const match = campaigns.find(
    (campaign) => isCountdownSection(campaign.section) && campaign.endAt && new Date(campaign.endAt).getTime() > now,
  );
  if (!match?.endAt) return null;
  return {
    id: match.id,
    title: match.title,
    description: match.description,
    linkUrl: match.linkUrl,
    linkLabel: match.linkLabel,
    endAt: new Date(match.endAt).toISOString(),
    image: match.media[0] ?? null,
    discount: match.discount ? { name: match.discount.name, type: match.discount.type, value: match.discount.value } : null,
  };
}
