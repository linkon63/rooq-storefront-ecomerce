export type GallerySource = "WEBSITE" | "FACEBOOK";
export type GalleryStatus = "PENDING" | "APPROVED" | "REJECTED";

export type GalleryImage = { id: string; url: string; alt: string | null; width: number | null; height: number | null };

/** What the storefront sees: no phone, no status. */
export type PublicGalleryEntry = {
  id: string;
  name: string;
  city: string | null;
  rating: number;
  feedback: string;
  source: GallerySource;
  images: GalleryImage[];
  createdAt: string;
};

/** Admin view: adds the private fields. */
export type AdminGalleryEntry = PublicGalleryEntry & {
  status: GalleryStatus;
  contactPhone: string | null;
  consentAt: string;
};
