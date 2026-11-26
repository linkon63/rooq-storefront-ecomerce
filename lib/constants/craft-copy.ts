/**
 * Copy for the home page's craft moments (saree unfold, made-by-hand line).
 * Plain strings only: `t.home` is passed to client components.
 */
export const craftEn = {
  unfoldTitle: "Six yards, unfolded",
  unfoldLead:
    "A tant saree leaves the loom folded, its border and aanchal tucked inside. Here is one opened out, the way you will first see yours.",
  unfoldCta: "Find your saree",
  unfoldAria: "A handloom saree with a gold border and striped aanchal, unfolding",
  madeByHand: "Made by hand",
  stats: {
    pieces: "{n} handwoven pieces in the shop",
    delivered: "{n} orders delivered to doors across Bangladesh",
    rating: "rated {r} out of 5 by {n} shoppers",
    end: ".",
  },
  saleEnded: "This sale has ended.",
};

export type CraftMessages = typeof craftEn;
