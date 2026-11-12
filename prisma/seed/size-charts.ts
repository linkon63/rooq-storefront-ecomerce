import type { Department } from "../../lib/generated/prisma/enums";
import type { SeedDb } from "./db";
import type { Masters } from "./masters";

type ChartSeed = {
  slug: string;
  name: string;
  department: Department;
  howToMeasure: string;
  /** size slug → { measurement label → cm } */
  rows: [string, Record<string, number>][];
};

const CHARTS: ChartSeed[] = [
  {
    slug: "mens-tops",
    name: "Men's Tops & Outerwear",
    department: "MEN",
    howToMeasure: "Chest: around the fullest part. Length: from the high shoulder point to the hem. Sleeve: shoulder seam to cuff.",
    rows: [
      ["alpha-xs", { Chest: 88, Length: 68, Sleeve: 60 }],
      ["alpha-s", { Chest: 94, Length: 70, Sleeve: 62 }],
      ["alpha-m", { Chest: 100, Length: 72, Sleeve: 63 }],
      ["alpha-l", { Chest: 106, Length: 74, Sleeve: 64 }],
      ["alpha-xl", { Chest: 112, Length: 76, Sleeve: 65 }],
      ["alpha-xxl", { Chest: 118, Length: 78, Sleeve: 66 }],
    ],
  },
  {
    slug: "womens-tops-dresses",
    name: "Women's Tops & Dresses",
    department: "WOMEN",
    howToMeasure: "Bust: around the fullest part. Waist: at the narrowest point. Hip: around the fullest part, 20 cm below the waist.",
    rows: [
      ["alpha-xs", { Bust: 80, Waist: 62, Hip: 88 }],
      ["alpha-s", { Bust: 84, Waist: 66, Hip: 92 }],
      ["alpha-m", { Bust: 90, Waist: 72, Hip: 98 }],
      ["alpha-l", { Bust: 96, Waist: 78, Hip: 104 }],
      ["alpha-xl", { Bust: 102, Waist: 84, Hip: 110 }],
    ],
  },
  {
    slug: "bottoms-waist",
    name: "Jeans & Trousers",
    department: "UNISEX",
    howToMeasure: "Waist: around your natural waistline. Inseam: crotch seam to the bottom of the leg.",
    rows: [
      ["waist-28", { Waist: 71, Hip: 90, Inseam: 81 }],
      ["waist-30", { Waist: 76, Hip: 95, Inseam: 81 }],
      ["waist-32", { Waist: 81, Hip: 100, Inseam: 82 }],
      ["waist-34", { Waist: 86, Hip: 105, Inseam: 82 }],
      ["waist-36", { Waist: 91, Hip: 110, Inseam: 83 }],
      ["waist-38", { Waist: 97, Hip: 115, Inseam: 83 }],
    ],
  },
  {
    slug: "footwear-eu",
    name: "Footwear (EU)",
    department: "UNISEX",
    howToMeasure: "Stand on paper, mark heel and longest toe, measure the distance. Between sizes? Size up.",
    rows: [
      ["eu-37", { "Foot length": 23.5 }],
      ["eu-38", { "Foot length": 24.1 }],
      ["eu-39", { "Foot length": 24.8 }],
      ["eu-40", { "Foot length": 25.4 }],
      ["eu-41", { "Foot length": 26.0 }],
      ["eu-42", { "Foot length": 26.7 }],
      ["eu-43", { "Foot length": 27.3 }],
      ["eu-44", { "Foot length": 28.0 }],
      ["eu-45", { "Foot length": 28.6 }],
    ],
  },
];

export type SizeChartIds = Map<string, string>;

export async function seedSizeCharts(db: SeedDb, masters: Masters): Promise<SizeChartIds> {
  const ids: SizeChartIds = new Map();
  for (const chart of CHARTS) {
    const row = await db.sizeChart.upsert({
      where: { slug: chart.slug },
      update: { name: chart.name, department: chart.department, howToMeasure: chart.howToMeasure },
      create: { slug: chart.slug, name: chart.name, department: chart.department, howToMeasure: chart.howToMeasure },
      select: { id: true },
    });
    ids.set(chart.slug, row.id);

    for (const [position, [sizeSlug, values]] of chart.rows.entries()) {
      const size = masters.sizes.get(sizeSlug);
      if (!size) continue;
      const chartRow = await db.sizeChartRow.upsert({
        where: { sizeChartId_sizeId: { sizeChartId: row.id, sizeId: size.id } },
        update: { position },
        create: { sizeChartId: row.id, sizeId: size.id, position },
        select: { id: true },
      });
      for (const [index, [label, valueCm]] of Object.entries(values).entries()) {
        await db.sizeChartMeasurement.upsert({
          where: { rowId_label: { rowId: chartRow.id, label } },
          update: { valueCm, position: index },
          create: { rowId: chartRow.id, label, valueCm, position: index },
        });
      }
    }
  }
  return ids;
}
