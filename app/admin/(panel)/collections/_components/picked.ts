import type { ProductCardView } from "@/types/catalog-admin";
import type { PickedProduct } from "../../_catalog/product-picker";

/** Ordered ids → picker rows; ids whose product is not live keep a placeholder name. */
export function toPicked(ids: string[], cards: ProductCardView[], hiddenLabel: string): PickedProduct[] {
  const byId = new Map(cards.map((card) => [card.id, card]));
  return ids.map((id) => {
    const card = byId.get(id);
    return { id, name: card?.name ?? hiddenLabel, imageUrl: card?.image?.url ?? null };
  });
}
