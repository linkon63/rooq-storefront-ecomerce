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

export const craftBn: CraftMessages = {
  unfoldTitle: "ছয় গজ, খুলে দেখুন",
  unfoldLead:
    "তাঁত থেকে শাড়ি নামে ভাঁজ করা অবস্থায়, পাড় আর আঁচল থাকে ভেতরে। এখানে একটি খুলে দেখানো হলো, ঠিক যেভাবে আপনি প্রথম আপনারটি দেখবেন।",
  unfoldCta: "আপনার শাড়ি খুঁজুন",
  unfoldAria: "সোনালি পাড় আর ডোরাকাটা আঁচলের একটি তাঁতের শাড়ি খুলে যাচ্ছে",
  madeByHand: "হাতে বোনা",
  stats: {
    pieces: "শপে {n}টি হাতে বোনা শাড়ি ও পোশাক",
    delivered: "সারা বাংলাদেশে {n}টি অর্ডার দরজায় পৌঁছেছে",
    rating: "{n} জন ক্রেতার রেটিং ৫-এ {r}",
    end: "।",
  },
  saleEnded: "এই সেল শেষ হয়েছে।",
};
