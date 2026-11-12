const NON_ALNUM = /[^a-z0-9]+/g;
const EDGE_DASHES = /^-+|-+$/g;
const DIACRITICS = /[̀-ͯ]/g;

/** "Linen Camp-Collar Shirt" → "linen-camp-collar-shirt" */
export function slugify(value: string): string {
  return value
    .normalize("NFKD")
    .replace(DIACRITICS, "")
    .toLowerCase()
    .trim()
    .replace(NON_ALNUM, "-")
    .replace(EDGE_DASHES, "");
}

export const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
