# Rooq — creative ideas backlog

A menu of animation and delight ideas for every storefront page. Nothing here is
built yet unless it is listed under **Already in the app**. Tick `[x]` the ones
you want to build, then build them one by one.

Each idea has a tag:

- **Effort**: `S` = an afternoon, `M` = 1–3 days, `L` = a week or more.
- **Tech**: `CSS`, `GSAP` (`useGSAP`, ScrollTrigger, Flip), `3D` (three.js via
  `@react-three/fiber`/`drei`), `VT` (React `<ViewTransition>`, see
  `node_modules/next/dist/docs/01-app/02-guides/view-transitions.md`), `SVG`.

## Ground rules (apply to every idea)

1. **The theme is handloom Bangladesh.** Use thread, the loom, the shuttle, the
   aanchal (pallu), jamdani and tant motifs, nakshi kantha stitches, alpona, dye
   colours. Do not use generic sparkles, confetti from a template or neon "tech" glow.
2. **One big moment per page.** Everything else stays quiet. Motion that plays
   everywhere stops feeling special.
3. **Never slow the page.** Hero images must not wait on animation (keep LCP
   intact). Load 3D/GSAP code client-side only with a dynamic import, after first
   paint. Only animate `transform` and `opacity`.
4. **`prefers-reduced-motion`** gets a still version of every idea, not a broken one.
5. **Mobile first.** Most shoppers use a phone. Every effect has to work with touch,
   without hover. Hover effects are extras for desktop.
6. **Never block buying.** No animation may delay "Add to bag", checkout or payment
   by more than about 300 ms.

## Already in the app (don't rebuild)

- Home: scroll-sewn **needle and thread** across the page (`home/stitch`).
- Home: six-scene **order journey** story (`home/order-journey`).
- Home: chapter **reveal headings**, **sale countdown** clock, hero slider/campaign.
- Footer: **handloom + charkha scene** weaving a tant saree (`shell/footer-art`).
- Product grids: below-the-fold **fade-in in batches** (`product-card/grid-reveal`).
- Product: full-screen **gallery zoom** with pan.
- Listings (section 3): **filter shuffle**, **colour preview**, second photo on
  hover, **price cut** line, sliding **New** label, **empty loom**.
- Home (built from section 2): **3D saree unfold**, **woven headline**, category
  tiles **unrolling like bolts**, **shop by colour** with dye flood, lookbook
  **parallax** with a stitched fabric close-up, **review notes** with cross
  stitches, **split-flap** sale clock, **made-by-hand** live numbers.

---

## 1. Site-wide (shell)

- [ ] **Thread page transitions** — `VT` `M`. When you move between pages, a thin
  thread line sweeps across the top, like a weft thread. Shared elements morph:
  a product card image grows into the product page gallery image.
- [ ] **"Fly to bag"** — `GSAP Flip` `S`. On Add to bag, a small copy of the product
  image curves into the bag icon. The icon swallows it and the count badge bounces
  once. This is the most common wow moment in shopping.
- [ ] **Bag icon stitch fill** — `SVG` `S`. The bag icon's outline is drawn with a
  dashed "stitch" stroke that fills in more as the bag gets fuller.
- [ ] **Wishlist heart → kantha stitch** — `SVG` `S`. When you tap the heart, it is
  sewn in with a running stitch instead of a plain colour fill.
- [ ] **Header shrinks into a woven label** — `GSAP` `S`. On scroll, the header
  compresses into a slim woven-label strip with a stitched border.
- [ ] **Shuttle loading bar** — `CSS` `S`. The route-loading indicator is a tiny
  shuttle running left to right and back.
- [ ] **Branded toasts** — `CSS` `S`. Toasts slide in like a swing tag swinging on
  a thread and settle with a small pendulum ease.
- [ ] **Custom cursor (desktop only)** — `CSS/GSAP` `S`. Over product images the
  cursor becomes a small round "View" lens; over the gallery, a needle. Hide it on
  touch devices.
- [ ] **Bangla/English switch flip** — `CSS` `S`. When the language changes, text
  flips like a turned page instead of jumping.
- [ ] **Festival skin** — `CSS tokens` `M`. An admin-chosen theme for Pohela
  Boishakh (red-white, alpona border), Eid (crescent pattern in the header) and the
  wedding season (haldi yellow, marigold garlands at the edges). It only swaps
  colours and a few decorations, so there are no layout changes.

## 2. Home

Built. How it differs from the first sketch below:

- The saree unfold is its own section right after the hero (folded → open as it
  scrolls in), with a woven paar/buti/aanchal texture drawn in code, not a photo.
- Category bolts unroll on scroll; there is no hover unroll yet.
- The colour band switches on tap (swatches are tabs), not on scroll.
- "Made by hand" uses real numbers only: pieces on sale, delivered orders and the
  review average. No invented weaving hours.

- [x] **Saree unfold hero** — `3D` `L`. A saree lies folded; as the page loads (or on
  scroll) the aanchal unfolds and drapes, showing the featured print as a real
  texture. Static photo fallback. This would be the "wow, who built this" moment.
- [x] **Hero text woven in** — `GSAP + SVG` `M`. The headline letters appear as if
  woven, with horizontal weft lines filling each glyph row by row.
- [x] **Category tiles as fabric bolts** — `GSAP` `M`. Category tiles look like rolled
  bolts of cloth. On hover/tap a bolt unrolls a little to show the fabric.
- [x] **Lookbook parallax depth** — `GSAP ScrollTrigger` `S`. The model photo, the
  fabric close-up and the text move at three different speeds.
- [x] **Colour story band** — `GSAP` `M`. A horizontal strip of dye swatches
  (indigo, lal, haldi, sobuj). Scrolling through it recolours the section's
  background, and products in that colour slide up.
- [x] **Reviews as stitched notes** — `CSS` `S`. Review cards are pinned with a
  cross-stitch at the top corner, and each one hangs at a slightly different angle.
- [x] **Sale countdown flip digits** — `CSS` `S`. Upgrade the clock to split-flap
  digits. Extend the existing `sale-countdown`, don't build a new one.
- [x] **"Made by hand" counter** — `GSAP` `S`. "12,480 hours of weaving in this
  collection" counts up once, with the loom footer art echoed small beside it.

## 3. Shop / New / Sale (product listing)

Built. Notes: the colour preview works on hover (mouse), focus and tap (tap
pins the colour; tap again to clear). The price cut and the "New" label play as
the card scrolls into view (CSS scroll-driven animation; browsers without it
show the plain version). "Clear filters" keeps the page's own preset
(Sale / New).

- [x] **Filter shuffle** — `GSAP Flip` `M`. When filters or the sort order change,
  cards slide to their new positions instead of the grid re-rendering in one jump.
- [x] **Second image on hover** — `CSS` `S`. The card crossfades to the second photo
  (back or drape view). On touch: swipe the card image.
- [x] **Colour dots preview** — `CSS` `S`. Hovering a colour dot swaps the card image
  to that colour.
- [x] **Sale page "price cut"** — `SVG` `S`. The old price gets a strike-through
  that is cut like scissors through thread, then the new price drops in.
- [x] **New arrivals "fresh off the loom"** — `CSS` `S`. A small woven "New" label
  slides out from behind the card the first time it scrolls into view.
- [x] **Empty results** — `SVG` `S`. An empty loom with a single loose thread and the
  line "Nothing woven here yet". The thread tugs when you hover "Clear filters".

## 4. Collections (index + detail)

- [ ] **Collection cover → page morph** — `VT` `M`. The cover image expands into the
  collection hero.
- [ ] **Horizontal lookbook scroll** — `GSAP ScrollTrigger` `M`. On the collection
  page, vertical scroll drives a horizontal walk through looks, like flipping
  through a printed lookbook.
- [ ] **Shop-the-look hotspots** — `CSS` `M`. Pulsing dots on the look photo; tapping
  one opens the item's quick view.
- [ ] **Story chapters** — `GSAP` `M`. The collection's text is told in 3–4 short
  chapters (village, weaver, motif, final saree), each pinned with its photo.

## 5. Product page

- [ ] **Drape view in 3D** — `3D` `L`. A "See it draped" button opens a cloth
  simulation of the saree on a simple dress form, using the product image as the
  texture. Drag to rotate. This is the second biggest wow moment after the home hero.
- [ ] **Fabric close-up lens** — `CSS` `S`. A magnifier that follows the finger or
  cursor and shows the weave. Reuse the zoom image from `gallery-zoom`.
- [ ] **Colour change ripple** — `GSAP` `S`. When you pick a colour, the new image
  is revealed with a dye-ripple mask spreading from the swatch you tapped.
- [ ] **Size pick feedback** — `CSS` `S`. The selected size chip gets a stitched
  border that is drawn around it.
- [ ] **Weaver's note** — `CSS` `S`. A small card that looks like a handwritten
  note ("Woven in Tangail by …, 9 days"), with a handwriting-reveal animation.
  Only if the admin fills in the data.
- [ ] **Sticky bag bar spring** — `CSS` `S`. The existing `sticky-bag-bar` slides in
  with a soft spring, and its button pulses once when a size gets chosen.
- [ ] **Low stock thread** — `SVG` `S`. "Only 3 left" shows a thread spool that is
  almost empty.

## 6. Quick view, search, cart drawer

- [ ] **Quick view opens from the card** — `GSAP Flip` `S`. The dialog grows out of
  the card that was clicked, and shrinks back on close.
- [ ] **Search typing feedback** — `CSS` `S`. Results stagger in. The input
  underline is a thread that grows as you type.
- [ ] **Cart drawer free-shipping thread** — `SVG` `S`. The existing
  `free-shipping-note` becomes a thread that is sewn across. When the target is
  reached, the thread ties a knot and a small "Free delivery unlocked" label pops.
- [ ] **Remove item** — `CSS` `S`. The removed line folds up like cloth, and the
  rows below close the gap smoothly.
- [ ] **Quantity number roll** — `CSS` `S`. Digits roll up/down instead of changing
  in place.

## 7. Checkout & confirmation

Keep checkout calm. Trust is more important than wow here.

- [ ] **Step progress as a stitch line** — `SVG` `S`. Address → Delivery → Payment
  are joined by a running stitch that fills in as each step is done.
- [ ] **Order placed: the saree is wrapped** — `SVG/GSAP` `M`. On the confirmation
  page, a parcel folds closed, a jute string ties it, and a Rooq woven label is
  stamped on it. Then the order number appears. This is the best emotional moment,
  so spend effort here.
- [ ] **Delivery journey link** — `S`. Reuse the home `order-journey` scenes on
  confirmation as "What happens next", starting at step 1.
- [ ] **Coupon applied** — `CSS` `S`. The discount line slides in with a small
  scissor-cut tag.

## 8. Wishlist, compare, profile

- [ ] **Wishlist as a clothes line** — `CSS` `M`. Saved items hang from a rope with
  wooden pegs and sway a little on scroll. Removing one unpegs it and it falls away.
- [ ] **Compare: lock and slide** — `GSAP` `S`. Column headers stick, and adding or
  removing a product slides the columns.
- [ ] **Profile order timeline** — `SVG` `S`. Order status is a thread with knots at
  each status (placed, packed, shipped, delivered).
- [ ] **Greeting by time of day** — `S`. "Shubho shokal, Ayesha" with a small
  sun/moon line drawing that changes with the hour.

## 9. Login & sign-up

- [ ] **Auth sheet as a woven label** — `CSS` `S`. The sign-in panel has a stitched
  edge, and switching login ↔ register flips the label over.
- [ ] **Password show/hide eye** — `SVG` `S`. The eye blinks.
- [ ] **Welcome after sign-up** — `GSAP` `S`. The member's name is "embroidered" in
  with a stroke-draw animation.

## 10. About, contact, FAQ, legal

- [ ] **About: weaver scroll story** — `GSAP ScrollTrigger` `L`. Sticky scenes
  (cotton → yarn → dye → loom → saree), each with a photo or illustration. It
  can reuse art from the footer loom scene.
- [ ] **About: map of weaving villages** — `SVG` `M`. A Bangladesh map where
  Tangail, Narayanganj (jamdani) and Pabna light up, each with a short note.
- [ ] **Contact: letter fold** — `CSS/GSAP` `S`. After submit, the form folds into
  an envelope and slides out.
- [ ] **FAQ open/close** — `CSS` `S`. Answers unfold like cloth (height + slight
  skew) instead of popping open.
- [ ] **Legal pages** — no motion. Just a clean reading layout and a sticky
  table of contents.

## 11. Error, 404, empty states

- [ ] **404: lost thread** — `SVG` `S`. A tangled thread you can drag/untangle
  with the cursor or finger; the "Back to shop" button sits at the thread's end.
- [ ] **Error page: dropped stitch** — `SVG` `S`. "We dropped a stitch" with a
  retry button.
- [ ] **Empty bag / wishlist** — `SVG` `S`. An empty hanger that swings once.

## 12. Small surprises (easter eggs)

- [ ] **Logo long-press** — `S`. Holding the logo for two seconds weaves the logo
  letters out of thread.
- [ ] **Konami-style "Boishakh mode"** — `S`. A hidden key sequence turns on the
  festival skin for fun.
- [ ] **Optional sound** — `S`. A soft loom "clack" on Add to bag, **off by default**,
  with a toggle in the footer.

---

## Suggested shortlist (most wow per effort)

If you only build a few, build these in this order:

1. **Fly to bag** (S): it shows up on every product and you feel it every time.
2. **Order placed: the saree is wrapped** (M): the happiest moment in the journey.
3. **Thread page transitions + card → product morph** (M): the whole site feels
   like one piece.
4. **Free-shipping thread knot** (S): fun, and it nudges bigger orders.
5. **Filter shuffle** (M): listing pages feel alive.
6. **Colour change ripple** on the product page (S).
7. **404 lost thread** (S): people share this kind of thing.
8. **Saree unfold hero** (L): the signature piece, built last when the rest is done.

## Before you build each one

- Read the `frontend-design` and `react-best-practices` skills.
- One component per file, under `components/storefront/<area>/`, client-only,
  dynamically imported.
- Check it on a mid-range Android phone over a throttled network.
- Check it with reduced motion turned on.
