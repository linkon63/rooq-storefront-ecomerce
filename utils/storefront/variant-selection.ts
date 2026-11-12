import type { PositionedImage, ProductDetail, SizeRef, VariantPublic } from "@/types/storefront/catalog";

/** What the size picker shows for one size in the chosen colour. */
export type SizeOption = SizeRef & {
  variant: VariantPublic | null;
  available: boolean;
  lowStockCount: number | null;
};

export function findVariant(
  variants: readonly VariantPublic[],
  colorId: string | null,
  sizeId: string | null,
): VariantPublic | null {
  if (!colorId || !sizeId) return null;
  return variants.find((variant) => variant.colorId === colorId && variant.sizeId === sizeId) ?? null;
}

/** Colour to open the page on: the default variant's, then the first colour with stock, then the first. */
export function initialColorId(product: Pick<ProductDetail, "variants" | "colors" | "defaultVariantId">): string | null {
  const byDefault = product.variants.find((variant) => variant.id === product.defaultVariantId);
  if (byDefault) return byDefault.colorId;
  const inStock = product.variants.find((variant) => variant.inStock);
  return inStock?.colorId ?? product.colors[0]?.id ?? null;
}

/** One-size products and single-size colours pre-select their only size. */
export function initialSizeId(sizes: readonly SizeRef[]): string | null {
  return sizes.length === 1 ? sizes[0].id : null;
}

export function sizeOptions(
  product: Pick<ProductDetail, "sizes" | "variants">,
  colorId: string | null,
): SizeOption[] {
  return product.sizes.map((size) => {
    const variant = findVariant(product.variants, colorId, size.id);
    return {
      ...size,
      variant,
      available: Boolean(variant?.inStock),
      lowStockCount: variant?.lowStockCount ?? null,
    };
  });
}

/** True when the colour has at least one in-stock variant (sold-out swatches are struck through). */
export function colorHasStock(variants: readonly VariantPublic[], colorId: string): boolean {
  return variants.some((variant) => variant.colorId === colorId && variant.inStock);
}

/** Gallery for a colour: its own images first, then the images shared by every colour. */
export function galleryFor(product: Pick<ProductDetail, "colors" | "sharedImages">, colorId: string | null): PositionedImage[] {
  const own = product.colors.find((color) => color.id === colorId)?.images ?? [];
  const byPosition = (a: PositionedImage, b: PositionedImage) => a.position - b.position;
  const images = [...own].sort(byPosition).concat([...product.sharedImages].sort(byPosition));
  if (images.length > 0) return images;
  return product.colors.flatMap((color) => color.images).sort(byPosition);
}

/** Price to show: the chosen variant's, otherwise the product's "from" price. */
export function displayPrice(
  product: Pick<ProductDetail, "price" | "compareAtPrice">,
  variant: VariantPublic | null,
): { price: number; compareAtPrice: number | null } {
  if (variant) return { price: variant.price, compareAtPrice: variant.compareAtPrice };
  return { price: product.price, compareAtPrice: product.compareAtPrice };
}

/** Why "Add to bag" cannot run yet, or null when it can. */
export function selectionProblem(
  product: Pick<ProductDetail, "colors">,
  colorId: string | null,
  sizeId: string | null,
  variant: VariantPublic | null,
): "color" | "size" | "soldOut" | null {
  if (!colorId && product.colors.length > 1) return "color";
  if (!sizeId) return "size";
  if (!variant || !variant.inStock) return "soldOut";
  return null;
}
