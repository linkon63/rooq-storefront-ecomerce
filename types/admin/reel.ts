/** Admin view of a home page reel (GET /reels). */
export type AdminReel = {
  id: string;
  position: number;
  isActive: boolean;
  videoUrl: string;
  sizeBytes: number;
  product: { id: string; name: string; slug: string; status: string };
};
