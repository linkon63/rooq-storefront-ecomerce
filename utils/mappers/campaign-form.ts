/** Admin campaign form state (client) and its multipart encoding. */
export type CampaignFormState = {
  id?: string;
  title: string;
  sectionId: string;
  description: string;
  linkUrl: string;
  linkLabel: string;
  status: "active" | "inactive";
  startAt: string;
  endAt: string;
  discountId: string;
  images: File[];
  existingImages: string[];
};

/** `<input type="datetime-local">` value for a date (local time, minutes). */
export function toLocalInput(value: Date | string): string {
  const date = new Date(value);
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60_000);
  return local.toISOString().slice(0, 16);
}

export function emptyCampaignForm(now: Date): CampaignFormState {
  return {
    title: "",
    sectionId: "",
    description: "",
    linkUrl: "",
    linkLabel: "",
    status: "active",
    startAt: toLocalInput(now),
    endAt: "",
    discountId: "",
    images: [],
    existingImages: [],
  };
}

export type CampaignLike = {
  id: string;
  title: string;
  sectionId: string;
  description?: string | null;
  linkUrl?: string | null;
  linkLabel?: string | null;
  status: "active" | "inactive";
  startAt: string;
  endAt?: string | null;
  discountId?: string | null;
};

export function campaignToForm(campaign: CampaignLike, imageUrls: string[], now: Date): CampaignFormState {
  return {
    id: campaign.id,
    title: campaign.title,
    sectionId: campaign.sectionId,
    description: campaign.description ?? "",
    linkUrl: campaign.linkUrl ?? "",
    linkLabel: campaign.linkLabel ?? "",
    status: campaign.status,
    startAt: toLocalInput(campaign.startAt || now),
    endAt: campaign.endAt ? toLocalInput(campaign.endAt) : "",
    discountId: campaign.discountId ?? "",
    images: [],
    existingImages: imageUrls,
  };
}

/** Multipart body for POST /campaigns and PATCH /campaigns/:id. */
export function campaignFormData(form: CampaignFormState): FormData {
  const body = new FormData();
  body.append("title", form.title.trim());
  body.append("sectionId", form.sectionId);
  body.append("status", form.status);
  body.append("description", form.description.trim());
  body.append("linkUrl", form.linkUrl.trim());
  body.append("linkLabel", form.linkLabel.trim());
  if (form.startAt) body.append("startAt", new Date(form.startAt).toISOString());
  // Empty values are sent on purpose: they clear the end date / the offer.
  body.append("endAt", form.endAt ? new Date(form.endAt).toISOString() : "");
  body.append("discountId", form.discountId);
  body.append("keepImages", JSON.stringify(form.existingImages));
  for (const file of form.images) body.append("images", file);
  return body;
}
