/**
 * Blog content lives here until the backend exposes a posts endpoint. The blog
 * pages read from this module only, so swapping in an API later is a one-file
 * change.
 */

export type BlogBlock =
  | { type: "heading"; text: string }
  | { type: "paragraph"; text: string }
  | { type: "list"; items: string[] }
  | { type: "quote"; text: string };

export type BlogPost = {
  slug: string;
  title: string;
  excerpt: string;
  cover: string;
  category: string;
  author: string;
  /** ISO date — formatted at render time. */
  publishedAt: string;
  readMinutes: number;
  body: BlogBlock[];
};

export const BLOG_POSTS: BlogPost[] = [
  {
    slug: "how-to-spot-pure-mustard-oil",
    title: "How to spot pure mustard oil (and what the cheap bottles hide)",
    excerpt:
      "Colour, smell, the cold test — four checks you can run in your own kitchen before you trust a bottle of shorishar tel.",
    cover: "/images/home/banner-mustard.png",
    category: "Buying Guide",
    author: "Organishi Kitchen",
    publishedAt: "2026-07-18",
    readMinutes: 5,
    body: [
      {
        type: "paragraph",
        text: "Mustard oil is the backbone of Bengali cooking, which is exactly why it is the most adulterated oil on the shelf. Cheap bottles are routinely cut with palm or rice bran oil, coloured to look right and pushed through a refinery that strips out everything worth having.",
      },
      { type: "heading", text: "1. Look at the colour, not the label" },
      {
        type: "paragraph",
        text: "Genuine cold pressed mustard oil is deep amber with a faint cloudiness. A pale, perfectly clear yellow usually means the oil has been refined, blended, or both. Colour alone is not proof — dyes exist — but it is the fastest first filter.",
      },
      { type: "heading", text: "2. Trust your nose" },
      {
        type: "paragraph",
        text: "Rub a drop between your palms. Pure mustard oil bites: sharp, pungent, slightly stinging in the nose within seconds. Blended oil smells flat and greasy because the pungency comes from compounds that refining destroys.",
      },
      { type: "heading", text: "3. Run the cold test" },
      {
        type: "paragraph",
        text: "Leave a small amount in the fridge for a few hours. Pure mustard oil stays largely liquid. If a white, waxy layer separates and settles, palm oil has almost certainly been mixed in.",
      },
      { type: "heading", text: "4. Read the pressing method" },
      {
        type: "list",
        items: [
          "Cold pressed or kachi ghani: seeds crushed slowly, no heat, nothing stripped out.",
          "Expeller pressed: faster, warmer, some aroma lost, still usable.",
          "Refined: bleached and deodorised — clean-looking, nutritionally hollow.",
        ],
      },
      {
        type: "quote",
        text: "If a litre of mustard oil costs less than the seeds it takes to make it, something else is in the bottle.",
      },
      {
        type: "paragraph",
        text: "Our mustard oil is pressed in small batches within days of the harvest reaching us, then bottled without any blending or refining. That is why it looks, smells and behaves like the oil your grandmother used.",
      },
    ],
  },
  {
    slug: "why-hand-churned-ghee-tastes-different",
    title: "Why hand-churned ghee tastes different from what you buy in a tin",
    excerpt:
      "Bilona ghee takes eight hours and a lot of patience. Here is what those hours actually do to the flavour.",
    cover: "/images/home/promo-ghee.png",
    category: "Kitchen Notes",
    author: "Organishi Kitchen",
    publishedAt: "2026-07-04",
    readMinutes: 6,
    body: [
      {
        type: "paragraph",
        text: "Industrial ghee is made by melting cream straight into butterfat. It is quick, it is cheap, and it tastes like it. Traditional bilona ghee takes a longer route, and every extra step leaves something in the jar.",
      },
      { type: "heading", text: "Curd first, cream never" },
      {
        type: "paragraph",
        text: "The milk is set into curd overnight before anything is churned. Fermentation breaks down lactose and builds the nutty, slightly tangy notes that cream-based ghee simply cannot develop.",
      },
      { type: "heading", text: "Churned cold, cooked slow" },
      {
        type: "paragraph",
        text: "The curd is churned cold to lift out the butter, then simmered on a low flame until the milk solids caramelise to a light gold. Rush that flame and you get a burnt edge; hold it steady and you get the aroma that fills a room.",
      },
      {
        type: "list",
        items: [
          "Roughly 25 litres of milk go into a single litre of bilona ghee.",
          "The grainy texture at room temperature is a sign of slow cooling, not spoilage.",
          "Kept dry and covered, it stays good for a year without refrigeration.",
        ],
      },
      {
        type: "paragraph",
        text: "It is a slower, more expensive way to make ghee. It is also the only way to get that taste, which is why we have never changed the method.",
      },
    ],
  },
  {
    slug: "cold-pressed-coconut-oil-in-your-kitchen",
    title: "Five ways to use virgin coconut oil that are not hair oil",
    excerpt:
      "Cold pressed coconut oil earns its place on the cooking shelf — from tempering to baking to a better morning coffee.",
    cover: "/images/home/banner-coconut.png",
    category: "Kitchen Notes",
    author: "Organishi Kitchen",
    publishedAt: "2026-06-21",
    readMinutes: 4,
    body: [
      {
        type: "paragraph",
        text: "Most households in Bangladesh keep coconut oil in the bathroom, not the kitchen. Virgin, cold pressed coconut oil belongs in both — it is stable at heat, keeps for months and carries a clean sweetness that suits far more than curry.",
      },
      { type: "heading", text: "Where it works best" },
      {
        type: "list",
        items: [
          "Tempering: bloom mustard seeds and curry leaves in it for South Indian style dishes.",
          "Baking: swap it one-for-one with butter for a soft crumb and a light coconut note.",
          "Roasting vegetables: high smoke point, no bitter aftertaste.",
          "Morning coffee: a spoonful blended in gives body without dairy.",
          "Finishing: drizzle over steamed rice or chutney just before serving.",
        ],
      },
      { type: "heading", text: "Virgin versus refined" },
      {
        type: "paragraph",
        text: "Refined coconut oil is bleached and deodorised, which strips the aroma and most of the antioxidants. Virgin oil is pressed from fresh coconut meat without heat, so it keeps the scent and the nutrition. If the bottle smells of nothing, it has been refined.",
      },
      {
        type: "paragraph",
        text: "Store it away from direct sun. Below about 24°C it solidifies — that is normal, and a good sign that nothing has been mixed in.",
      },
    ],
  },
  {
    slug: "what-organic-really-means",
    title: "What “organic” really means when it is printed on a label",
    excerpt:
      "The word is unregulated in a lot of markets. Here is what to ask a seller before you pay the premium.",
    cover: "/images/home/newsletter-bg.png",
    category: "Explainer",
    author: "Organishi Kitchen",
    publishedAt: "2026-06-09",
    readMinutes: 5,
    body: [
      {
        type: "paragraph",
        text: "Organic should mean grown without synthetic pesticides, chemical fertiliser or growth regulators, on soil that has been clean for years. In practice, in markets where the term is not policed, it often means a sticker.",
      },
      { type: "heading", text: "Questions worth asking" },
      {
        type: "list",
        items: [
          "Which farm did this come from, and can you name the grower?",
          "How long has that land been free of chemical inputs?",
          "Is there a lab report for this batch, not just for the brand?",
          "How was it processed after harvest — cold pressed, sun dried, refined?",
        ],
      },
      {
        type: "quote",
        text: "A seller who can name the farm is worth more than a certificate nobody checks.",
      },
      { type: "heading", text: "Traceability beats branding" },
      {
        type: "paragraph",
        text: "We would rather show you the family who pressed your oil than print a claim on the bottle. Every batch we sell is tied to a named producer, and we are happy to tell you which one when you ask.",
      },
    ],
  },
  {
    slug: "storing-oils-ghee-and-honey",
    title: "Storing oils, ghee and honey so they last the year",
    excerpt:
      "Heat, light and moisture are what actually spoil natural food. A few small habits keep a jar good for months.",
    cover: "/images/home/hero-ghee.png",
    category: "Kitchen Notes",
    author: "Organishi Kitchen",
    publishedAt: "2026-05-27",
    readMinutes: 4,
    body: [
      {
        type: "paragraph",
        text: "Natural food without preservatives is not fragile — it just has a few conditions. Get these right and a jar of ghee or a bottle of cold pressed oil will outlast most packaged alternatives.",
      },
      { type: "heading", text: "Keep it dark and cool" },
      {
        type: "paragraph",
        text: "Sunlight oxidises oil faster than anything else in your kitchen. Store bottles in a closed cabinet, not on the windowsill next to the stove.",
      },
      { type: "heading", text: "Keep water out" },
      {
        type: "paragraph",
        text: "A wet spoon is the fastest way to spoil ghee or honey. Moisture invites mould into an otherwise stable jar. Always use a dry spoon, and close the lid properly.",
      },
      { type: "heading", text: "What is normal, and what is not" },
      {
        type: "list",
        items: [
          "Honey crystallising into a grainy solid: normal. Warm the jar gently in water.",
          "Coconut oil turning solid white below 24°C: normal.",
          "Ghee smelling sour or foaming: not normal — moisture has got in.",
          "Mustard oil separating into two clear layers: not normal — likely blended.",
        ],
      },
    ],
  },
  {
    slug: "snacks-without-the-additives",
    title: "Snacks without the additive list: what dried fruit should look like",
    excerpt:
      "Bright colour and a sticky shine usually mean sugar syrup and sulphur. Naturally dried fruit looks duller — and tastes better.",
    cover: "/images/home/promo-mustard.png",
    category: "Buying Guide",
    author: "Organishi Kitchen",
    publishedAt: "2026-05-12",
    readMinutes: 3,
    body: [
      {
        type: "paragraph",
        text: "Dried pineapple that glows orange and dried mango that stays perfectly soft have almost always been through sugar syrup, sulphur dioxide, or both. Fruit dried with nothing but air and heat looks less photogenic and tastes considerably more like fruit.",
      },
      { type: "heading", text: "What to look for" },
      {
        type: "list",
        items: [
          "Muted, uneven colour rather than uniform brightness.",
          "A firm, slightly leathery chew instead of a soft, sticky one.",
          "An ingredient list with one item on it.",
          "Natural sugar bloom on the surface after a few weeks — a good sign, not spoilage.",
        ],
      },
      {
        type: "paragraph",
        text: "Our chips and dried fruit are cut and dried in small batches with no syrup, no colour and no preservative. They darken slightly over time, exactly as unprocessed fruit should.",
      },
    ],
  },
];

export function getPost(slug: string): BlogPost | undefined {
  return BLOG_POSTS.find((post) => post.slug === slug);
}

/** Newest first — the listing and the "more reading" rail both rely on this. */
export function sortedPosts(): BlogPost[] {
  return [...BLOG_POSTS].sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
}

export function formatPostDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}
