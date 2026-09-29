export type ProductSpecifications = {
  keyFeatures?: string[];
  keyBenefits?: string[];
  usage?: string[];
};

export type SpecificationKey = keyof ProductSpecifications;

/** Display order and labels, shared by the admin form and the product page. */
export const SPECIFICATION_SECTIONS: { key: SpecificationKey; label: string }[] = [
  { key: "keyFeatures", label: "Key Features" },
  { key: "keyBenefits", label: "Key Benefits" },
  { key: "usage", label: "Usage" },
];

/** Admin textarea is one bullet per line; pasted "•", "-" or "*" markers are dropped. */
export const linesToBullets = (text: string) =>
  text
    .split(/\r?\n/)
    .map((line) => line.replace(/^\s*[•\-*]\s*/, "").trim())
    .filter(Boolean);

export const bulletsToLines = (bullets?: string[] | null) => (bullets ?? []).join("\n");

export type SpecificationDrafts = Record<SpecificationKey, string>;

export const emptySpecificationDrafts: SpecificationDrafts = {
  keyFeatures: "",
  keyBenefits: "",
  usage: "",
};

export const specificationsToDrafts = (
  specs?: ProductSpecifications | null,
): SpecificationDrafts => ({
  keyFeatures: bulletsToLines(specs?.keyFeatures),
  keyBenefits: bulletsToLines(specs?.keyBenefits),
  usage: bulletsToLines(specs?.usage),
});

export const draftsToSpecifications = (drafts: SpecificationDrafts): ProductSpecifications => ({
  keyFeatures: linesToBullets(drafts.keyFeatures),
  keyBenefits: linesToBullets(drafts.keyBenefits),
  usage: linesToBullets(drafts.usage),
});
