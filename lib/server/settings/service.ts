import "server-only";
import { cache } from "react";
import { ERROR_MESSAGES } from "@/lib/constants/error-messages";
import { STORE_NAME } from "@/lib/constants/store";
import type { Prisma } from "@/lib/generated/prisma/client";
import { cleanContactEntries, SOCIAL_PLATFORMS, toSettingsResponse, type SettingsResponse } from "@/utils/mappers/settings";
import { prisma } from "../prisma";
import { notFound } from "../http-error";
import { settingsInclude } from "./select";
import { resolveMediaField } from "./media-fields";
import type { UpdateSettingsInput } from "./schemas";

type Tx = Prisma.TransactionClient;

function findSettingRow(db: Pick<Tx, "setting"> = prisma) {
  return db.setting.findFirst({ include: settingsInclude, orderBy: { createdAt: "asc" } });
}

/** GET /settings — 404 until the store has been configured (old behaviour). */
export async function getSettings(options: { includeSecrets?: boolean } = {}): Promise<SettingsResponse> {
  const row = await findSettingRow();
  if (!row) throw notFound(ERROR_MESSAGES.settings.notConfigured);
  return toSettingsResponse(row, options);
}

/** Server components: the public settings, or null — deduplicated per request. */
export const getStoreSettings = cache(async (): Promise<SettingsResponse | null> => {
  const row = await findSettingRow();
  return row ? toSettingsResponse(row) : null;
});

const SCALAR_KEYS = [
  "slogan", "footerDescription", "branchName", "branchAddress", "branchLat", "branchLng",
  "parentCompany", "parentCompanyLink", "showCertifications", "isTopBarVisible", "hideOutOfStock",
  "freeShippingThreshold", "returnWindowDays", "lowStockThreshold", "fraudCheckApiKey", "isFraudChecking",
  "fraudCheckingThreshold", "fraudCheckingSuccessRate", "youtubeUrl", "youtubeTitle", "youtubeDescription",
] as const;

/** Columns that cannot be null: a null in the body means "leave as is". */
const REQUIRED_KEYS = ["shopName", "currency", "language", "deliveryChargeInside", "deliveryChargeNearCity", "deliveryChargeOutside"] as const;

function scalarData(input: UpdateSettingsInput): Prisma.SettingUncheckedUpdateInput {
  const data: Record<string, unknown> = { copyrightYear: String(new Date().getFullYear()) };
  for (const key of SCALAR_KEYS) if (input[key] !== undefined) data[key] = input[key];
  for (const key of REQUIRED_KEYS) if (input[key] !== undefined && input[key] !== null) data[key] = input[key];
  if (input.openingTime !== undefined) data.openingTime = input.openingTime || null;
  if (input.closingTime !== undefined) data.closingTime = input.closingTime || null;
  if (input.youtubeMetaData !== undefined) data.youtubeMetaData = input.youtubeMetaData ?? undefined;
  return data as Prisma.SettingUncheckedUpdateInput;
}

async function replaceContacts(tx: Tx, settingId: string, kind: "PHONE" | "EMAIL", entries: UpdateSettingsInput["contactNumber"]) {
  if (entries === undefined) return;
  await tx.storeContact.deleteMany({ where: { settingId, kind } });
  const rows = cleanContactEntries(entries ?? []);
  if (rows.length) {
    await tx.storeContact.createMany({
      data: rows.map((row, position) => ({ settingId, kind, title: row.title, value: row.value, position })),
    });
  }
}

async function replaceSocialLinks(tx: Tx, settingId: string, social: UpdateSettingsInput["socialContact"]) {
  if (social === undefined) return;
  await tx.storeSocialLink.deleteMany({ where: { settingId } });
  const rows = SOCIAL_PLATFORMS.flatMap((platform) => {
    const url = social?.[platform]?.trim();
    return url ? [{ settingId, platform, url }] : [];
  });
  if (rows.length) await tx.storeSocialLink.createMany({ data: rows });
}

/** PATCH /settings — create or update the single settings row. */
export async function upsertSettings(input: UpdateSettingsInput): Promise<SettingsResponse> {
  const current = await findSettingRow();
  const [logoMediaId, iconMediaId, faviconMediaId, youtubeThumbMediaId] = await Promise.all([
    resolveMediaField(input.logo, input.logoMediaId, current?.logoMedia ?? null),
    resolveMediaField(input.icon, input.iconMediaId, current?.iconMedia ?? null),
    resolveMediaField(input.favicon, input.faviconMediaId, current?.faviconMedia ?? null),
    resolveMediaField(input.youtubeThumbnailImage, input.youtubeThumbMediaId, current?.youtubeThumbMedia ?? null),
  ]);
  const data = { ...scalarData(input), logoMediaId, iconMediaId, faviconMediaId, youtubeThumbMediaId };

  const row = await prisma.$transaction(async (tx) => {
    const setting = current
      ? await tx.setting.update({ where: { id: current.id }, data, select: { id: true } })
      : await tx.setting.create({
          data: { ...(data as Prisma.SettingUncheckedCreateInput), shopName: input.shopName || STORE_NAME },
          select: { id: true },
        });
    await replaceContacts(tx, setting.id, "PHONE", input.contactNumber);
    await replaceContacts(tx, setting.id, "EMAIL", input.email);
    await replaceSocialLinks(tx, setting.id, input.socialContact);
    return tx.setting.findUniqueOrThrow({ where: { id: setting.id }, include: settingsInclude });
  });
  return toSettingsResponse(row, { includeSecrets: true });
}
