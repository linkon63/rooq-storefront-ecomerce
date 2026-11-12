# Rooq storefront — design plan

Brief: Rooq is a contemporary fashion label and store (clothing, footwear,
accessories). Audience: style-conscious shoppers aged 18–40. Primary job:
**browse looks and buy quickly on a phone**.

The subject's own vernacular is where the identity comes from: indigo dye and
raw denim, the woven label stitched into a collar, the swing tag on a hanger,
the selvedge edge of a bolt of cloth. Nothing here is borrowed from a generic
"luxury" or "SaaS" kit.

## Pass 1 — first plan

- Colour: white page, black ink, one red sale accent.
- Type: a high-contrast serif display with a neutral sans for body.
- Layout: full-bleed hero photo with centred headline and a "Shop now" button,
  then rows of rounded product cards.

## Review against the brief

That first plan is the template every fashion site gets: the serif+sans pair
reads as the "luxury" default, a centred photo hero needs photography we do not
have, red-on-white sale tags are the high-street cliché, and rounded cards are
the SaaS kit. Revised:

| Axis | Pass 1 | Revised — and why |
| --- | --- | --- |
| Colour | white / black / red | **Indigo ink instead of black**, a cool *chalk* ground instead of white or cream, and **dye pink** as the one accent. Indigo is the colour of the trade (denim, dye vats); pink against indigo is a confident colour-block that suits an 18–40 audience and is not the cream/terracotta or black/acid-green default. |
| Type | serif display + sans | **One family, Archivo, used at two widths.** Display is Archivo *Expanded* (wdth 125, weight 800) — wide, flat, like a woven label; body is Archivo at normal width. The width axis is the hierarchy device, not a second typeface. |
| Hero | stock photo + centred CTA | **A three.js cloth form**: an indigo sheet with a pink lining, draping slowly in the light. It is the one memorable moment; everything else is quiet. Static gradient fallback for reduced motion / low power. |
| Cards | rounded white boxes with shadows | **No card boxes.** Images sit square-cornered on a pale *selvedge* tint; name and price sit under them, left-aligned. Badges are shaped like **woven labels** (2 px radius, stitched dashed inner border). |

## Tokens

### Colour

| Token | Hex | Role |
| --- | --- | --- |
| `--color-ink` | `#1B1F3B` | Indigo ink. Text, primary buttons, header. 15.4:1 on chalk. |
| `--color-chalk` | `#F3F4F6` | Page ground. Cool, not cream. |
| `--color-selvedge` | `#DDE2EE` | Image wells, quiet surfaces, hover fills. |
| `--color-stone` | `#5B6178` | Secondary text. 5.9:1 on chalk. |
| `--color-dye` | `#FF4F9A` | Accent fill (sale label, focus ring, hero lining). Never small text. |
| `--color-dye-deep` | `#C2185B` | Accent text: sale prices, "Only 3 left". 5.6:1 on chalk. |
| `--color-line` | `#C9CEDC` | Borders and dividers that carry meaning (inputs, selected states). |

Success / error reuse ink and dye-deep with an icon so colour is never the only signal.

### Type (Archivo, variable `wdth` + `wght`)

| Role | Setting | Size (mobile → desktop) |
| --- | --- | --- |
| Display | wdth 125, wght 800, tracking −0.02em, line-height 0.95 | 44 → 96 px |
| H1 page title | wdth 118, wght 750 | 30 → 44 px |
| H2 section | wdth 112, wght 700 | 22 → 30 px |
| Product name | wdth 100, wght 500 | 15 px |
| Body | wdth 100, wght 400, line-height 1.55 | 16 px |
| Small / meta | wdth 100, wght 400 | 13 px |
| Price | wdth 100, wght 600, tabular numerals | 15 px |

Sentence case everywhere. No all-caps labels, no eyebrows above headings, no
single accented word in a headline. Body measure ≤ 68 ch.

### Shape and space

- Radius has hierarchy: images **0**, buttons and inputs **4 px**, woven-label
  badges **2 px**, colour swatches and size chips are the only round things
  (swatches are true circles because fabric swatches are cut round).
- 4 px grid. Page gutter 16 px on phones, 24 px tablet, 40 px desktop. Max
  content width 1440 px.
- Shadows: none, except the sheet/drawer overlays (one large soft shadow).

## Layout

Mobile first; the phone is the primary device.

```
Home (phone)                       Product (phone)            Shop (phone)
┌──────────────────────┐           ┌──────────────────┐       ┌──────────────────┐
│ ≡  rooq       ⌕  ♡ ⊡ │ header    │ gallery (swipe)  │       │ Women  · 128     │
├──────────────────────┤           │ ● ○ ○            │       │ [Filter 3] [Sort]│
│  ~~~ cloth (3D) ~~~  │ hero      ├──────────────────┤       ├────────┬─────────┤
│ Dressed for the week │           │ Name       ৳2,450│       │ img    │ img     │
│ you actually have.   │           │ colour ●●●○      │       │ name   │ name    │
│ [Shop women][Men]    │           │ size  XS S M L XL│       │ price  │ price   │
├──────────────────────┤           │ Size guide       │       ├────────┼─────────┤
│ Women Men Kids  ▸    │ depts     │ [Add to bag    ] │ sticky│ …      │ …       │
│ New in ───────── ▸   │ rail      │ Details / Care   │       └────────┴─────────┘
│ [img][img][img]      │           │ Delivery/returns │
│ Lookbook: shop look  │           │ Complete the look│
│ Sale ─────────── ▸   │           │ Reviews (fit)    │
└──────────────────────┘           └──────────────────┘
```

- Left-aligned text throughout; only the hero headline spans the full width.
- Product grid: 2 columns on phones, 3 at `md`, 4 at `xl`. Gap 16/24 px.
- Product page: gallery left (sticky) and buy panel right from `lg`; on phones
  the "Add to bag" bar is sticky at the bottom once the panel scrolls away.
- Shop filters: a bottom sheet on phones, a left rail from `lg`. Every filter
  writes the URL.

## Motion

- **One orchestrated moment**: the hero. The cloth drapes (three.js) while
  GSAP runs a single load sequence — headline lines slide up from a mask,
  then the two department buttons. ≤ 900 ms total.
- Scroll reveals only on the three home "chapter" headings (not every card).
- Everything else moves only in answer to the shopper: drawer slides, gallery
  cross-fade on colour change, size chip press.
- `prefers-reduced-motion: reduce` → no three.js canvas (static gradient),
  no GSAP sequence (content rendered in final position).

## Principles

1. **The garment is the hero.** Images get the space; chrome stays thin.
2. **Two taps to the bag.** Colour pre-selected, size is the only required
   choice, out-of-stock sizes disabled but still visible (with "Notify me").
3. **Labels, not stickers.** Status (New, Sale −20%, Only 3 left) is a woven-label badge.
4. **Spend boldness once.** The cloth hero and the expanded display type carry
   the identity; listings, forms and checkout are calm and fast.

## Copy voice

Plain, direct, a little dry. "Add to bag", "Choose a size", "Only 2 left in M",
"Back in stock? We'll email you." Errors say what happened and what to do; they
come from `ERROR_MESSAGES` (`lib/constants/error-messages.ts`).
