import { readFileSync } from "node:fs";
import path from "node:path";
import { ERROR_MESSAGES } from "../../lib/constants/error-messages";

const README = path.resolve(process.cwd(), "data/product-photos/README.md");

export type ReadmeProduct = {
  folder: string;
  name: string;
  price: number;
  compareAtPrice?: number;
  fabric?: string;
  short: string;
  description: string;
  features: string[];
};

/** Plain text lines that are neither bullets nor bold "**Label:**" lines. */
function paragraphs(block: string): string[] {
  return block.split("\n").map((line) => line.trim()).filter((line) => line && !/^(\*\*|- )/.test(line));
}

function bullets(block: string): string[] {
  return block.split("\n").filter((line) => line.startsWith("- ")).map((line) => line.slice(2).trim());
}

/** First sentence of the story, plus the next one when the first is only a few words. */
function shortText(paragraph: string): string {
  const [first, second] = paragraph.split(/(?<=\.)\s/);
  return first.length < 40 && second ? `${first} ${second}` : first;
}

function parseSection(section: string): ReadmeProduct {
  const folder = /\*\*Folder:\*\* `([^`]+?)\/?`/.exec(section)![1];
  const [bangla = "", english = ""] = (section.split("### বাংলা")[1] ?? "").split("### English");
  const name = /\*\*Name:\*\*\s*(.+)/.exec(english)?.[1].trim();
  const priceLine = /\*\*Price:\*\*\s*(.+)/.exec(english)?.[1] ?? "";
  // "~~1290~~ 990 BDT (offer)" → price 990, compare-at 1290
  const old = /~~\s*([\d,]+)\s*~~/.exec(priceLine)?.[1];
  const price = /([\d,]+)\s*BDT/.exec(priceLine)?.[1];
  const story = paragraphs(english);
  if (!name || !price || story.length === 0) throw new Error(ERROR_MESSAGES.seed.readmeSection(folder));

  const features = bullets(english);
  const toNumber = (value: string) => Number(value.replaceAll(",", ""));
  return {
    folder,
    name,
    price: toNumber(price),
    compareAtPrice: old ? toNumber(old) : undefined,
    fabric: features.find((line) => line.startsWith("Fabric:"))?.slice("Fabric:".length).trim(),
    short: shortText(story[0]),
    description: [...story, ...paragraphs(bangla)].join("\n\n"),
    features,
  };
}

/** The catalogue as written in data/product-photos/README.md, in file order. */
export function readCatalogue(): ReadmeProduct[] {
  const products = readFileSync(README, "utf8")
    .replaceAll("\r\n", "\n")
    .split(/\n---\n/)
    .filter((section) => section.includes("**Folder:**"))
    .map(parseSection);
  if (products.length === 0) throw new Error(ERROR_MESSAGES.seed.readmeEmpty);
  return products;
}
