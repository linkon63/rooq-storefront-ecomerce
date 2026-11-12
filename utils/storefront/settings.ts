import { STORE_CURRENCY, STORE_NAME } from "@/lib/constants/store";
import type { ContactEntry, SocialLinks, StorePolicy, StoreSettings } from "@/types/storefront/content";
import { formatMoney, toAmount } from "./money";

type RawEntry = { title?: string | null; value?: string | null; kind?: string | null } | string | null;
type RawContactField = { entries?: RawEntry[] } | RawEntry[] | string | null | undefined;
type UnknownRecord = Record<string, unknown>;

const DEFAULT_RETURN_DAYS = 14;

function asRecord(value: unknown): UnknownRecord {
  return typeof value === "object" && value !== null ? (value as UnknownRecord) : {};
}

function asString(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

/** Admin → Settings → Contact saves `{ entries: [{ title, value }] }`; older rows are arrays or strings. */
export function contactEntries(field: RawContactField): ContactEntry[] {
  if (!field) return [];
  const raw: RawEntry[] =
    typeof field === "string" ? [field] : Array.isArray(field) ? field : Array.isArray(field.entries) ? field.entries : [];
  return raw.flatMap((entry) => {
    const value = (typeof entry === "string" ? entry : entry?.value ?? "").trim();
    if (!value) return [];
    const title = typeof entry === "string" ? null : entry?.title?.trim() || null;
    return [{ title, value }];
  });
}

/** The new schema keeps contacts as rows `{ kind: PHONE | EMAIL, title, value }`. */
function contactsOfKind(rows: unknown, kind: "PHONE" | "EMAIL"): ContactEntry[] {
  if (!Array.isArray(rows)) return [];
  return contactEntries(rows.filter((row) => asRecord(row).kind === kind) as RawEntry[]);
}

function socialLinks(raw: UnknownRecord): SocialLinks {
  const links: SocialLinks = { ...(asRecord(raw.socialContact) as SocialLinks) };
  if (Array.isArray(raw.socialLinks)) {
    for (const row of raw.socialLinks) {
      const { platform, url } = asRecord(row);
      if (typeof platform === "string" && typeof url === "string") links[platform as keyof SocialLinks] = url;
    }
  }
  return links;
}

/** GET /settings → the normalised shape the storefront renders. Tolerates both old and new payloads. */
export function normaliseSettings(input: unknown): StoreSettings {
  const raw = asRecord(input);
  const phones = contactEntries(raw.contactNumber as RawContactField);
  const emails = contactEntries(raw.email as RawContactField);
  return {
    shopName: asString(raw.shopName) ?? STORE_NAME,
    slogan: asString(raw.slogan),
    footerDescription: asString(raw.footerDescription),
    currency: asString(raw.currency) ?? STORE_CURRENCY,
    logoUrl: asString(raw.logoUrl) ?? asString(raw.logo),
    phones: phones.length ? phones : contactsOfKind(raw.contacts, "PHONE"),
    emails: emails.length ? emails : contactsOfKind(raw.contacts, "EMAIL"),
    address: asString(raw.branchAddress),
    openingTime: asString(raw.openingTime),
    closingTime: asString(raw.closingTime),
    social: socialLinks(raw),
    delivery: {
      inside: toAmount(raw.deliveryChargeInside),
      nearCity: toAmount(raw.deliveryChargeNearCity),
      outside: toAmount(raw.deliveryChargeOutside),
      freeShippingThreshold: raw.freeShippingThreshold == null ? null : toAmount(raw.freeShippingThreshold),
      returnWindowDays: typeof raw.returnWindowDays === "number" ? raw.returnWindowDays : DEFAULT_RETURN_DAYS,
    },
  };
}

export const EMPTY_SETTINGS: StoreSettings = normaliseSettings(null);

const POLICY_KEYS = ["delivery", "return", "refund", "cancellation", "privacy", "terms"] as const;

/** GET /policies answers one record keyed by type, or a list of `{ type, title, content }` rows. */
export function normalisePolicies(input: unknown): StorePolicy[] {
  if (Array.isArray(input)) {
    return input.flatMap((row) => {
      const { type, key, title, content } = asRecord(row);
      const id = asString(type) ?? asString(key);
      const body = asString(content);
      return id && body ? [{ key: id, title: asString(title) ?? id, content: body }] : [];
    });
  }
  const record = asRecord(input);
  return POLICY_KEYS.flatMap((key) => {
    const block = asRecord(record[key]);
    const content = asString(block.content);
    return content ? [{ key, title: asString(block.title) ?? key, content }] : [];
  });
}

/** The one-line strip above the header: free-delivery threshold and the return window. */
export function announcementFor(threshold: number | null, returnDays: number, currency: string): string {
  const returns = `Free returns within ${returnDays} days`;
  return threshold ? `Free delivery over ${formatMoney(threshold, currency)}. ${returns}.` : `${returns}.`;
}
