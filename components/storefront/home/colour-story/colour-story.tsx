import Link from "next/link";
import { getMessages } from "@/lib/i18n/server";
import { getTopColours, productRail } from "@/lib/storefront/catalog-data";
import { ProductCard } from "../../product-card/product-card";
import { ColourSwitcher } from "./colour-switcher";

const COLOUR_LIMIT = 5;
const PRODUCTS_PER_COLOUR = 4;

/**
 * Shop by colour: the most stocked dyes as swatches. Picking one pours its
 * tint over the section and slides up four pieces in that colour. Hidden
 * until at least two colours have stock.
 */
export async function ColourStory() {
  const [{ t }, colours] = await Promise.all([getMessages(), getTopColours(COLOUR_LIMIT)]);
  if (colours.length < 2) return null;
  const rails = await Promise.all(
    colours.map((colour) => productRail({ color: colour.slug, sort: "popular", limit: PRODUCTS_PER_COLOUR })),
  );
  const stocked = colours
    .map((colour, index) => ({ colour, products: rails[index]?.data ?? [] }))
    .filter((entry) => entry.products.length > 0);
  if (stocked.length < 2) return null;
  const copy = t.home.craft;

  return (
    <ColourSwitcher
      title={copy.coloursTitle}
      lead={copy.coloursLead}
      pickLabel={copy.coloursPick}
      swatches={stocked.map(({ colour }) => ({ slug: colour.slug, name: colour.name, hex: colour.hex }))}
      panels={stocked.map(({ colour, products }) => (
        <div key={colour.slug} className="flex flex-col gap-6">
          <ul className="grid grid-cols-2 gap-x-3 gap-y-6 md:gap-x-5 lg:grid-cols-4">
            {products.map((product) => (
              <li key={product.id} data-colour-card>
                <ProductCard product={product} />
              </li>
            ))}
          </ul>
          <Link href={`/shop?color=${colour.slug}`} className="type-label w-fit underline underline-offset-4 hover:opacity-60">
            {copy.seeAllIn.replace("{colour}", colour.name)}
          </Link>
        </div>
      ))}
    />
  );
}
