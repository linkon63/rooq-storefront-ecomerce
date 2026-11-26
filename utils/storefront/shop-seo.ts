import type { Metadata } from "next";

/** Title and description of /shop, worded around the chosen category. */
export function shopMetadata(listTitle: string, categoryName?: string): Pick<Metadata, "title" | "description"> {
  const name = categoryName ?? (listTitle === "Shop all" ? null : listTitle);
  const suffix = name && !/saree|sharee/i.test(name) ? " Saree" : "";
  const title = name ? `${name}${suffix} Price in BD` : "All Sarees (Sharee) Online in Bangladesh";
  const subject = name ? `${name}${suffix}` : "saree";
  return {
    title,
    description: `Buy ${subject} (sharee) online in Bangladesh at Rooq. Compare prices, filter by colour and order BD sharee with cash on delivery.`,
  };
}
