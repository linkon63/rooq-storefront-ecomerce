/** Admin view of the home hero (GET /hero-slides, /hero-slides/mode). */
export type HeroMode = "SLIDER" | "CAMPAIGN";

export type AdminHeroSlide = {
  id: string;
  position: number;
  isActive: boolean;
  image: { id: string; url: string; alt: string | null };
  product: { id: string; name: string; slug: string; status: string } | null;
};
