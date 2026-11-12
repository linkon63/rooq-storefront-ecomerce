import type { SizeGroup } from "../../lib/generated/prisma/enums";
import type { SeedDb } from "./db";

type SizeSeed = { label: string; slug: string; group: SizeGroup };

const ALPHA = ["XS", "S", "M", "L", "XL", "XXL"].map<SizeSeed>((label) => ({
  label,
  slug: `alpha-${label.toLowerCase()}`,
  group: "ALPHA",
}));
const WAIST = [28, 30, 32, 34, 36, 38, 40].map<SizeSeed>((n) => ({ label: String(n), slug: `waist-${n}`, group: "NUMERIC" }));
const SHOE = [36, 37, 38, 39, 40, 41, 42, 43, 44, 45].map<SizeSeed>((n) => ({
  label: `EU ${n}`,
  slug: `eu-${n}`,
  group: "SHOE",
}));
const ONE: SizeSeed[] = [{ label: "One Size", slug: "one-size", group: "ONE_SIZE" }];

export const COLORS = [
  { name: "Black", slug: "black", hex: "#141414", family: "Black", code: "BLK" },
  { name: "White", slug: "white", hex: "#F6F5F1", family: "White", code: "WHT" },
  { name: "Ecru", slug: "ecru", hex: "#E9E1CF", family: "White", code: "ECR" },
  { name: "Navy", slug: "navy", hex: "#1F2A44", family: "Blue", code: "NVY" },
  { name: "Sky Blue", slug: "sky-blue", hex: "#9DBEDF", family: "Blue", code: "SKY" },
  { name: "Indigo", slug: "indigo", hex: "#2E3F66", family: "Blue", code: "IND" },
  { name: "Charcoal", slug: "charcoal", hex: "#3A3D42", family: "Grey", code: "CHR" },
  { name: "Olive", slug: "olive", hex: "#5B5F3A", family: "Green", code: "OLV" },
  { name: "Sage", slug: "sage", hex: "#9CAF94", family: "Green", code: "SAG" },
  { name: "Sand", slug: "sand", hex: "#CDBB93", family: "Beige", code: "SND" },
  { name: "Camel", slug: "camel", hex: "#B08454", family: "Brown", code: "CML" },
  { name: "Rust", slug: "rust", hex: "#A4502C", family: "Orange", code: "RST" },
  { name: "Burgundy", slug: "burgundy", hex: "#6B2233", family: "Red", code: "BRG" },
  { name: "Blush", slug: "blush", hex: "#E6C3BD", family: "Pink", code: "BLS" },
] as const;

export type ColorSlug = (typeof COLORS)[number]["slug"];

export type Masters = {
  colors: Map<string, { id: string; name: string; hex: string; code: string }>;
  sizes: Map<string, { id: string; label: string }>;
};

export async function seedMasters(db: SeedDb): Promise<Masters> {
  const sizes = new Map<string, { id: string; label: string }>();
  const groups = [ALPHA, WAIST, SHOE, ONE];
  for (const group of groups) {
    for (const [index, size] of group.entries()) {
      const row = await db.size.upsert({
        where: { slug: size.slug },
        update: { label: size.label, sizeGroup: size.group, sortOrder: index },
        create: { label: size.label, slug: size.slug, sizeGroup: size.group, sortOrder: index },
        select: { id: true, label: true },
      });
      sizes.set(size.slug, row);
    }
  }

  const colors = new Map<string, { id: string; name: string; hex: string; code: string }>();
  for (const [index, color] of COLORS.entries()) {
    const row = await db.color.upsert({
      where: { slug: color.slug },
      update: { name: color.name, hex: color.hex, family: color.family, sortOrder: index },
      create: { name: color.name, slug: color.slug, hex: color.hex, family: color.family, sortOrder: index },
      select: { id: true, name: true, hex: true },
    });
    colors.set(color.slug, { ...row, code: color.code });
  }

  return { colors, sizes };
}

export const SIZE_RUNS = {
  alpha: ALPHA.map((s) => s.slug),
  alphaCore: ["alpha-xs", "alpha-s", "alpha-m", "alpha-l"],
  alphaMen: ["alpha-s", "alpha-m", "alpha-l", "alpha-xl", "alpha-xxl"],
  waistMen: ["waist-28", "waist-30", "waist-32", "waist-34", "waist-36", "waist-38"],
  waistWomen: ["waist-28", "waist-30", "waist-32", "waist-34"],
  shoeMen: ["eu-40", "eu-41", "eu-42", "eu-43", "eu-44", "eu-45"],
  shoeUnisex: ["eu-37", "eu-38", "eu-39", "eu-40", "eu-41", "eu-42", "eu-43", "eu-44"],
  oneSize: ["one-size"],
} as const;
