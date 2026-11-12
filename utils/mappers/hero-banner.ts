/** Pure helpers for the admin Hero Banner screen (three campaigns in the banner section). */

export type HeroBannerSlotState = {
  /** Campaign backing this slot, absent until the first save. */
  id?: string;
  imageUrl: string;
  file: File | null;
  preview: string | null;
  discountId: string;
  active: boolean;
};

export const emptyHeroSlot = (): HeroBannerSlotState => ({
  imageUrl: "",
  file: null,
  preview: null,
  discountId: "",
  active: true,
});

/** The banner section: the exact title first, then any title containing "banner". */
export function findBannerSection<S extends { title: string }>(sections: readonly S[], title: string): S | undefined {
  return (
    sections.find((s) => s.title.toLowerCase() === title.toLowerCase()) ??
    sections.find((s) => s.title.toLowerCase().includes("banner"))
  );
}

/** Multipart body for one slot's campaign. */
export function heroSlotFormData(slot: HeroBannerSlotState, title: string, sectionId: string): FormData {
  const body = new FormData();
  body.append("title", title);
  body.append("sectionId", sectionId);
  body.append("status", slot.active ? "active" : "inactive");
  // Always sent, empty included, so clearing the offer clears the link.
  body.append("discountId", slot.discountId);
  if (slot.file) body.append("images", slot.file);
  if (slot.id) body.append("keepImages", JSON.stringify(slot.file || !slot.imageUrl ? [] : [slot.imageUrl]));
  return body;
}
