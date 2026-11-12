import type { PolicyType } from "../../lib/generated/prisma/enums";
import { STORE_NAME } from "../../lib/constants/store";
import type { SeedDb } from "./db";
import { storeSvg } from "./db";
import { brandMarkSvg } from "./placeholder-art";

const POLICIES: { type: PolicyType; title: string; content: string }[] = [
  { type: "delivery", title: "Delivery", content: "Inside Dhaka: 1–2 working days. Outside Dhaka: 2–4 working days. Orders over ৳5,000 ship free." },
  { type: "return", title: "Returns & Exchanges", content: "Return or exchange unworn items with tags within 14 days of delivery. Request it from Profile → Orders." },
  { type: "refund", title: "Refunds", content: "Approved refunds are issued to the original payment method within 5–7 working days of receiving the item." },
  { type: "cancellation", title: "Cancellations", content: "You can cancel an order until it ships. Contact us or cancel from Profile → Orders." },
  { type: "privacy", title: "Privacy Policy", content: "We only use your details to process orders and, if you opt in, to send updates. We never sell your data." },
  { type: "terms", title: "Terms & Conditions", content: "By shopping with Rooq you agree to these terms. Prices include VAT and may change without notice." },
];

export async function seedStore(db: SeedDb) {
  const logoMediaId = await storeSvg(db, brandMarkSvg("#141414"), `${STORE_NAME} logo`);
  const existing = await db.setting.findFirst({ select: { id: true } });
  const data = {
    shopName: STORE_NAME,
    slogan: "Considered clothing for everyday.",
    footerDescription: "Rooq makes modern wardrobe staples for men, women and kids — designed to last, priced to wear every day.",
    currency: "BDT",
    language: "en",
    openingTime: "10:00",
    closingTime: "21:00",
    copyrightYear: String(new Date().getFullYear()),
    deliveryChargeInside: 80,
    deliveryChargeNearCity: 120,
    deliveryChargeOutside: 150,
    freeShippingThreshold: 5000,
    returnWindowDays: 14,
    lowStockThreshold: 5,
    logoMediaId,
    iconMediaId: logoMediaId,
    faviconMediaId: logoMediaId,
  };
  const setting = existing
    ? await db.setting.update({ where: { id: existing.id }, data, select: { id: true } })
    : await db.setting.create({ data, select: { id: true } });

  await db.storeContact.deleteMany({ where: { settingId: setting.id } });
  await db.storeContact.createMany({
    data: [
      { settingId: setting.id, kind: "PHONE", title: "Customer care", value: "+880 1700-000000", position: 0 },
      { settingId: setting.id, kind: "EMAIL", title: "Support", value: "hello@rooq.local", position: 0 },
    ],
  });
  for (const [platform, url] of [
    ["instagram", "https://instagram.com/rooq"],
    ["facebook", "https://facebook.com/rooq"],
    ["tiktok", "https://tiktok.com/@rooq"],
  ] as const) {
    await db.storeSocialLink.upsert({
      where: { settingId_platform: { settingId: setting.id, platform } },
      update: { url },
      create: { settingId: setting.id, platform, url },
    });
  }

  for (const policy of POLICIES) {
    await db.policy.upsert({ where: { type: policy.type }, update: {}, create: policy });
  }

  for (const [position, title] of ["Hero Campaign", "New Arrivals Banner", "Lookbook Banner"].entries()) {
    await db.section.upsert({
      where: { page_title: { page: "home", title } },
      update: { position: position + 1 },
      create: { page: "home", title, position: position + 1 },
    });
  }

  await db.coupon.upsert({
    where: { code: "WELCOME10" },
    update: {},
    create: { code: "WELCOME10", type: "percentage", value: 10, maxUsage: 1000, minOrderAmount: 1500 },
  });

  const piece = await db.unit.upsert({
    where: { code: "pcs" },
    update: {},
    create: { name: "Piece", code: "pcs" },
    select: { id: true },
  });
  const pair = await db.unit.upsert({
    where: { code: "pair" },
    update: {},
    create: { name: "Pair", code: "pair" },
    select: { id: true },
  });

  const supplierName = "Rooq Atelier Ltd.";
  const supplier =
    (await db.supplier.findFirst({ where: { name: supplierName }, select: { id: true } })) ??
    (await db.supplier.create({ data: { name: supplierName, email: "atelier@rooq.local" }, select: { id: true } }));

  return { settingId: setting.id, pieceUnitId: piece.id, pairUnitId: pair.id, supplierId: supplier.id };
}

export async function seedBrandsAndTags(db: SeedDb) {
  const brands = new Map<string, string>();
  for (const [slug, name, hex] of [
    ["rooq", "Rooq", "#141414"],
    ["rooq-studio", "Rooq Studio", "#6B2233"],
    ["northline", "Northline", "#1F2A44"],
  ] as const) {
    const logoMediaId = await storeSvg(db, brandMarkSvg(hex), `${name} logo`);
    const row = await db.brand.upsert({
      where: { slug },
      update: { name, logoMediaId },
      create: { slug, name, logoMediaId },
      select: { id: true },
    });
    brands.set(slug, row.id);
  }

  const tags = new Map<string, string>();
  for (const [slug, name] of [
    ["new-arrival", "New Arrival"],
    ["best-seller", "Best Seller"],
    ["sustainable", "Sustainable"],
  ] as const) {
    const row = await db.tag.upsert({ where: { slug }, update: { name }, create: { slug, name }, select: { id: true } });
    tags.set(slug, row.id);
  }

  const attributeValues = new Map<string, string>();
  for (const [attrIndex, [slug, name, values]] of (
    [
      ["neckline", "Neckline", ["Crew", "V-neck", "Collared", "Square"]],
      ["sleeve", "Sleeve length", ["Short", "Long", "Sleeveless"]],
    ] as const
  ).entries()) {
    const attribute = await db.attribute.upsert({
      where: { slug },
      update: { name, sortOrder: attrIndex },
      create: { slug, name, sortOrder: attrIndex },
      select: { id: true },
    });
    for (const [index, value] of values.entries()) {
      const row = await db.attributeValue.upsert({
        where: { attributeId_value: { attributeId: attribute.id, value } },
        update: { sortOrder: index },
        create: { attributeId: attribute.id, value, sortOrder: index },
        select: { id: true },
      });
      attributeValues.set(`${slug}:${value}`, row.id);
    }
  }

  return { brands, tags, attributeValues };
}
