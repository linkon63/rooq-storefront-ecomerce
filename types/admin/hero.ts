/** Admin view of the home hero (GET /hero-slides, /hero-slides/mode). */
export type HeroMode = "SLIDER" | "CAMPAIGN";

export type AdminHeroSlide = {
  id: string;
  position: number;
  isActive: boolean;
  image: { id: string; url: string; alt: string | null };
  product: { id: string; name: string; slug: string; status: string } | null;
};

export type AdminHeroPhoto = { id: string; url: string; alt: string | null };

/** One phone-hero pick (GET /hero-slides/mobile): `photo` null shows the product's main image. */
export type AdminHeroMobileProduct = {
  id: string;
  position: number;
  product: { id: string; name: string; slug: string; status: string };
  photo: AdminHeroPhoto | null;
  photos: AdminHeroPhoto[];
};

/** What PUT /hero-slides/mobile takes, per pick. */
export type HeroMobileItemInput = { productId: string; mediaId: string | null };
