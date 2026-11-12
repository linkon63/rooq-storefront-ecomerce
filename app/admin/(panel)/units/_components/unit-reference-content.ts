/** Worked examples, mirroring the conversion tree the form builds. */
export const UNIT_TYPE_EXAMPLES = [
  {
    title: "Count Units",
    blurb: "Units for counting items",
    base: "Piece (pcs)",
    conversions: ["1 Pair = 2 Pieces", "1 Dozen = 12 Pieces"],
  },
  {
    title: "Weight Units",
    blurb: "Units for measuring weight",
    base: "Gram (g)",
    conversions: ["1 Kilogram(kg) = 1000 g"],
  },
  {
    title: "Length Units",
    blurb: "Units for measuring length",
    base: "Centimeter (cm)",
    conversions: ["1 Meter(m) = 100 cm"],
  },
];

export const UNIT_GUIDELINES = [
  {
    title: "Start with a base unit",
    body: "Leave Parent Unit empty for the smallest unit you count in — Gram, Millilitre, Piece. A base unit always has a factor of 1.",
  },
  {
    title: "Factor reads upward",
    body: "Factor is how many parent units one of this unit equals. Kilogram with parent Gram takes a factor of 1000, because 1 kg = 1000 g.",
  },
  {
    title: "Keep abbreviations short",
    body: "The abbreviation is what staff see in dropdowns and what seeds generated SKUs, so kg beats kilogram. It must be unique across all units.",
  },
  {
    title: "Chains are allowed, loops are not",
    body: "A unit may convert into a unit that itself has a parent. It may not point back at itself or at anything below it — that would make conversion endless.",
  },
];
