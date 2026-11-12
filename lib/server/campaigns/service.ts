import "server-only";
import type { Prisma, Section } from "@/lib/generated/prisma/client";
import { ERROR_MESSAGES } from "@/lib/constants/error-messages";
import { SUCCESS_MESSAGES } from "@/lib/constants/success-messages";
import { CAMPAIGN_MAX_IMAGES } from "@/lib/constants/content";
import { isCampaignLive, normaliseDiscountId, toCampaignResponse, type CampaignResponse } from "@/utils/mappers/campaign";
import {
  isInvalidWindow,
  toProductDiscountDetail,
  toProductDiscountResponse,
  type ProductDiscountDetailResponse,
  type ProductDiscountResponse,
} from "@/utils/mappers/product-discount";
import { badRequest, notFound } from "../http-error";
import { prisma } from "../prisma";
import { saveImage } from "../media/save-image";
import { fileToBuffer } from "../media/upload";
import { releaseMedia } from "../media/release";
import { resolveMediaIds } from "../content/resolve-media";
import { listSections } from "../sections/service";
import { campaignDetailSelect, campaignListSelect } from "./select";
import type { CampaignStatusInput, CreateCampaignInput, UpdateCampaignInput } from "./schemas";

export type CampaignListItem = CampaignResponse<ProductDiscountResponse>;
export type CampaignDetail = CampaignResponse<ProductDiscountDetailResponse>;

type DetailRow = Prisma.CampaignGetPayload<{ select: typeof campaignDetailSelect }>;
type ListRow = Prisma.CampaignGetPayload<{ select: typeof campaignListSelect }>;

const toDetail = (row: DetailRow): CampaignDetail =>
  toCampaignResponse(row, row.discount ? toProductDiscountDetail(row.discount) : null);
const toListItem = (row: ListRow): CampaignListItem =>
  toCampaignResponse(row, row.discount ? toProductDiscountResponse(row.discount) : null);

async function validateSection(sectionId: string): Promise<void> {
  const section = await prisma.section.findUnique({ where: { id: sectionId }, select: { id: true } });
  if (!section) throw notFound(ERROR_MESSAGES.campaign.sectionNotFound(sectionId));
}

async function validateDiscount(discountId: string): Promise<void> {
  const discount = await prisma.productDiscount.findUnique({ where: { id: discountId }, select: { id: true } });
  if (!discount) throw notFound(ERROR_MESSAGES.campaign.discountNotFound(discountId));
}

/** hasDiscount follows discountId: a value links it, an empty value clears it. */
async function resolveDiscount(input: { discountId?: string | null; hasDiscount?: boolean }) {
  const discountId = normaliseDiscountId(input.discountId);
  if (input.hasDiscount === true && !discountId) throw badRequest(ERROR_MESSAGES.campaign.discountRequired);
  const hasDiscount = Boolean(discountId) && input.hasDiscount !== false;
  if (hasDiscount && discountId) await validateDiscount(discountId);
  return { hasDiscount, discountId: hasDiscount ? discountId : null };
}

/** Kept references first (their order), then the new uploads; at most CAMPAIGN_MAX_IMAGES. */
async function collectImages(keep: readonly string[], files: readonly File[], uploadedById: string, alt: string) {
  if (keep.length + files.length > CAMPAIGN_MAX_IMAGES) {
    throw badRequest(ERROR_MESSAGES.campaign.tooManyImages(CAMPAIGN_MAX_IMAGES));
  }
  const kept = await resolveMediaIds(keep);
  const uploaded = await Promise.all(
    files.map(async (file) => (await saveImage(await fileToBuffer(file), { alt, uploadedById })).id),
  );
  return [...new Set([...kept, ...uploaded])];
}

const mediaLinks = (ids: readonly string[]) => ids.map((mediaId, position) => ({ mediaId, position }));

export async function createCampaign(input: CreateCampaignInput, files: readonly File[], uploadedById: string) {
  await validateSection(input.sectionId);
  const discount = await resolveDiscount(input);
  const startAt = input.startAt ?? new Date();
  const endAt = input.endAt ?? null;
  if (isInvalidWindow(startAt, endAt)) throw badRequest(ERROR_MESSAGES.campaign.invalidWindow);

  const mediaIds = await collectImages(input.keepImages ?? [], files, uploadedById, input.title);
  const row = await prisma.campaign.create({
    data: {
      title: input.title,
      description: input.description ?? null,
      linkUrl: input.linkUrl ?? null,
      linkLabel: input.linkLabel ?? null,
      ...discount,
      startAt,
      endAt,
      status: input.status ?? "active",
      sectionId: input.sectionId,
      media: { create: mediaLinks(mediaIds) },
    },
    select: campaignDetailSelect,
  });
  return toDetail(row);
}

/** Public: live campaigns only. Staff (the admin screens) see every campaign. */
export async function listCampaigns({ includeAll = false } = {}): Promise<CampaignListItem[]> {
  const rows = await prisma.campaign.findMany({ orderBy: { createdAt: "desc" }, select: campaignListSelect });
  const now = new Date();
  return rows.filter((row) => includeAll || isCampaignLive(row, now)).map(toListItem);
}

async function findCampaign(id: string): Promise<DetailRow> {
  const row = await prisma.campaign.findUnique({ where: { id }, select: campaignDetailSelect });
  if (!row) throw notFound(ERROR_MESSAGES.campaign.notFound(id));
  return row;
}

export async function getCampaign(id: string, { includeAll = false } = {}): Promise<CampaignDetail> {
  const row = await findCampaign(id);
  if (!includeAll && !isCampaignLive(row, new Date())) throw notFound(ERROR_MESSAGES.campaign.notFound(id));
  return toDetail(row);
}

function scalarChanges(input: UpdateCampaignInput): Prisma.CampaignUncheckedUpdateInput {
  const data: Prisma.CampaignUncheckedUpdateInput = {};
  if (input.title !== undefined) data.title = input.title;
  if (input.description !== undefined) data.description = input.description;
  if (input.linkUrl !== undefined) data.linkUrl = input.linkUrl;
  if (input.linkLabel !== undefined) data.linkLabel = input.linkLabel;
  if (input.startAt !== undefined) data.startAt = input.startAt;
  if (input.endAt !== undefined) data.endAt = input.endAt;
  if (input.status !== undefined) data.status = input.status;
  if (input.sectionId !== undefined) data.sectionId = input.sectionId;
  return data;
}

export async function updateCampaign(
  id: string,
  input: UpdateCampaignInput,
  files: readonly File[],
  uploadedById: string,
): Promise<CampaignDetail> {
  const existing = await findCampaign(id);
  if (input.sectionId) await validateSection(input.sectionId);

  const data = scalarChanges(input);
  if (input.discountId !== undefined || input.hasDiscount !== undefined) {
    Object.assign(data, await resolveDiscount(input));
  }
  const startAt = input.startAt ?? existing.startAt;
  const endAt = input.endAt !== undefined ? input.endAt : existing.endAt;
  if (isInvalidWindow(startAt, endAt)) throw badRequest(ERROR_MESSAGES.campaign.invalidWindow);

  const previousIds = existing.media.map((link) => link.media.id);
  const replaceImages = input.keepImages !== undefined || files.length > 0;
  const nextIds = replaceImages
    ? await collectImages(input.keepImages ?? [], files, uploadedById, input.title ?? existing.title)
    : previousIds;

  const row = await prisma.$transaction(async (tx) => {
    if (replaceImages) {
      await tx.campaignMedia.deleteMany({ where: { campaignId: id } });
      await tx.campaignMedia.createMany({ data: mediaLinks(nextIds).map((link) => ({ ...link, campaignId: id })) });
    }
    return tx.campaign.update({ where: { id }, data, select: campaignDetailSelect });
  });
  await releaseMedia(previousIds.filter((mediaId) => !nextIds.includes(mediaId)));
  return toDetail(row);
}

export async function changeCampaignStatus(id: string, input: CampaignStatusInput): Promise<CampaignListItem> {
  await findCampaign(id);
  const row = await prisma.campaign.update({ where: { id }, data: { status: input.status }, select: campaignListSelect });
  return toListItem(row);
}

export async function deleteCampaign(id: string): Promise<{ message: string }> {
  const existing = await findCampaign(id);
  await prisma.campaign.delete({ where: { id } });
  await releaseMedia(existing.media.map((link) => link.media.id));
  return { message: SUCCESS_MESSAGES.common.deleted("Campaign") };
}

/** GET /campaigns/sections — every section, for the campaign form. */
export function getCampaignSections(): Promise<Section[]> {
  return listSections();
}
