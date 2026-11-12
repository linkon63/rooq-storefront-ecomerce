/**
 * The three artwork blocks of the home hero, as set in Admin → Settings →
 * Hero Banner. Each is a campaign under the banner section, told apart by its
 * title — so the titles here are stored data: renaming one orphans the banner
 * already saved under it. The side banners keep the titles they had when the
 * page had only those two slots.
 */
export type HeroBannerSlot = {
  key: "main" | "top" | "bottom";
  title: string;
  label: string;
  /** Where the block sits on the home page, in words an admin will recognise. */
  placement: string;
  /** Pixel size the block is designed around. */
  size: string;
};

export const HERO_BANNER_SLOTS: HeroBannerSlot[] = [
  {
    key: "main",
    title: "Hero Banner Main",
    label: "Main banner",
    placement: "Large block on the left. Shown first in the slider, before any other campaigns.",
    size: "1144 × 640",
  },
  {
    key: "top",
    title: "Hero Banner 1",
    label: "Top right banner",
    placement: "Upper of the two smaller blocks on the right.",
    size: "552 × 300",
  },
  {
    key: "bottom",
    title: "Hero Banner 2",
    label: "Bottom right banner",
    placement: "Lower of the two smaller blocks on the right.",
    size: "552 × 300",
  },
];

export const HERO_BANNER_TITLES = HERO_BANNER_SLOTS.map((slot) => slot.title);
