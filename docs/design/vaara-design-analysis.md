# Vaara storefront: design analysis

Reference study of [vaara.com](https://vaara.com) (luxury activewear, Shopify custom theme
"Vaara Main"), taken on 2026-11-13. It records the colours, fonts, header, type sizes and
section spacing Vaara uses on each page type, so we can judge what to borrow for Rooq.

**Method.** Eleven pages were fetched with `curl` and the theme stylesheets (`app.css`,
`custom.css`, `guide.css`, `hero-featured-products.css`) were parsed rule by rule, media
queries included. Every number below comes from that CSS. JavaScript was not run and no
screenshots were taken, so anything rendered only by JS is not covered.

**In one line:** the photos do the work. The chrome is a thin 55 px header, small light
type, one warm near-black, no radius, no shadows, and one serif heading size reused on
almost every page.

---

## 1. Breakpoints

Desktop-first `max-width` queries. Most rules switch at **1024 px** (phone/tablet vs
desktop); headings also step down between 1024 and 1511 px (laptop).

| Name used here | Width |
| --- | --- |
| Large desktop | ≥ 1512 px |
| Laptop | 1024–1511 px (some rules also at ≤ 1199 px) |
| Tablet / phone | ≤ 1023 px |
| Phone | ≤ 743 px (small phone ≤ 427 px, ≤ 389 px) |

Mouse vs touch is handled separately with `@media (pointer: fine)` and
`@media (hover: none) and (pointer: coarse)`, not by width.

## 2. Colour

One warm near-black does everything; borders and overlays are that colour at an alpha.

| Role | Value |
| --- | --- |
| Text, dark backgrounds, logo | `#2c231d` (warm espresso brown, not black) |
| Page background | `#ffffff` |
| Light text on dark | `#eaeaea` |
| Borders | `rgba(44, 35, 29, .1)` (the brown at 10%) |
| Overlay | `rgba(44, 35, 29, .7)` |
| Dark button hover | `#2c231dcc` (the brown at 80%) |
| Warm neutrals (surfaces) | `#f7f1ec`, `#f2e7df`, `#493b31` |
| Accents, used rarely | `#fe6347` (tomato), `#be2239` (sale / error) |

The header and some sections swap theme through two variables: `--theme-background` and
`--theme-color` (`#fff` / `#2c231d`, or `#2c231d` / `#eaeaea` on dark sections).

Shape: `border-radius: 0` everywhere except round icons (`50%`). No box shadows on content.

## 3. Typography

### Fonts

| Font | Kind | Used for |
| --- | --- | --- |
| **AtlasGrotesk** (Commercial Type, paid) | Grotesk sans | Body, UI, labels, card text, nav, forms |
| **Financier** (Klim, paid) | Serif | Every page title and section heading |

Weights: **300 is the most used weight** (light), then 400; 500 appears once (the alternate
uppercase collection title); 700 almost never. Emphasis comes from the serif and from
uppercase, not from bold.

### The text styles

Vaara reuses a handful of styles across all pages. Sizes are in px; "—" means the
size does not change at that width.

| Style | Font / weight | ≥ 1512 | 1024–1511 | ≤ 1023 | Line height | Case | Where it appears |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Hero display | Financier 300 | 50 | — | 40 | 1.1 | Sentence | Full-screen hero titles (Home, Legging Guide) |
| **Heading** | Financier 300 | **34** | **30** | **34** | 1.24 | Sentence | Collection title, Search query, Login, Contact, "You may also like", "Shop the look", home text blocks, hero-grid titles, Our Story sections, cart upsell |
| Text page title | AtlasGrotesk 300 | 32 | 32 | 32 | 1.25 | Sentence | Delivery & Returns, Privacy, Terms |
| Product title | Financier 300 | 28 | 24 | 28 | 1.14–1.31 | Sentence | Product page name |
| Sub-heading | AtlasGrotesk 300 | 24 | 20–24 | 24 | 1.33 | Sentence | Cart title, accordion titles on text pages |
| Article heading | AtlasGrotesk 300 | 20 | 20 | 20 | 1.4 | Sentence | `h3` inside text pages |
| Body | AtlasGrotesk 300 | 13 | 13 | **16** | 1.6 (1.5 phone) | Sentence | Hero text, inputs, search line, cart links |
| **Label** | AtlasGrotesk 400 / 300 | **12** | **12** | **14** | 1.25 | UPPERCASE | Card name, links, buttons, form labels, side nav, swatch and size labels, editorial subtitles, contact group titles |
| Card price | AtlasGrotesk | 12 | 12 | 14 (touch) | — | — | Product grid |
| Micro | AtlasGrotesk | 11 | 11 | 11 | 17 px | UPPERCASE | Announcement bar; badges (11 px, capitalised) |
| Collection title, alternate | AtlasGrotesk 500 | 50 | 50 | 40 | 1.0, tracking −1.28 px | UPPERCASE | Optional variant class; **not** used on `/collections/all` |

Two patterns stand out:

1. **Small text grows on phones.** Labels go 12 → 14 px and body 13 → 16 px below 1024 px,
   so text stays readable on a phone and inputs never trigger iOS zoom.
2. **One heading size for nearly every page.** The 34 px light serif (30 px on laptops) is
   the title of Collection, Search, Login and Contact pages *and* the section heading on
   Home, Product and Cart. A page title and a section heading look the same.

## 4. Header (same on every page)

```
┌──────────────────────────────────────────────────────────────────────┐
│        COMPLIMENTARY EXPRESS SHIPPING ON QUALIFYING ORDERS           │  announcement, 11 px caps
├──────────────────────────────────────────────────────────────────────┤
│ [VAARA logo]   NEW IN   SHOP   EXPLORE            ⌕   account   bag  │  55 px
└──────────────────────────────────────────────────────────────────────┘
   grid: auto | 1fr | auto | auto        side padding 30 px (15 px phone)
```

| Part | Desktop | Phone (≤ 1023 px) |
| --- | --- | --- |
| Announcement bar | 11 px uppercase, line height 17 px, 8 px top/bottom padding (about 33 px) | Same text; min-height 34 px when the message wraps |
| Header bar height | **55 px** (`min-height: 55px`, `--header-height: 55px`) | **55 px** |
| Header on product page | 55 px | **100 px** (adds a back/breadcrumb row); 64 px when breadcrumbs are open |
| Side padding | 30 px | 15 px |
| Gap between header items | 30 px | — |
| Logo | SVG, 115 × 15 px, fill = `--theme-color` | Same |
| Icon buttons | 15 px apart | 10 px apart (staging layout) |
| Nav | NEW IN · SHOP · EXPLORE, each opening a mega menu | Drawer with image cards |

- Height is the **same on every page and at every width**; the one exception is the extra
  back row on phone product pages.
- On pages that open with a full-screen hero (Home, Legging Guide) the header is
  transparent: the page is pulled up under it with `margin-top: calc(-1 * var(--header-height))`
  and the header shows white text until you scroll.
- Sticky pieces (the collection filter bar) offset from `--header-height` and
  `--announcement-height`, never from a typed number.
- Mega menu groups: product types (Leggings, Bras, Tops … Accessories, Shop All); edits and
  fabric lines (The Ski Drop, SKINSENSE® 2.0, The Club Edit, ICONS, SCULPTMAX®, VITAFUSE®,
  Studio Edit, Lounge Edit); content (The Legging Guide, Our Story).

## 5. Page frame and spacing

| Token | Desktop | ≤ 1199 px | ≤ 1023 px | ≤ 743 px |
| --- | --- | --- | --- | --- |
| `.container` side margin | 32 px each side (`max-width: calc(100% - 64px)`) | 24 px | 24 px | 16 px |
| Column gutter (`--bs-gutter-x`) | 24 px | 24 px | 16 px | 16 px |
| Product grid gap (row × column) | 20 × 3 px | — | 15 × 3 px | 15 × 3 px |
| Footer padding (top / bottom) | 96 / 64 px | — | 48 / 96 px | 48 / 48 px (≤ 427) |

Vertical padding values repeat across pages: **40, 48, 64, 80, 96, 120, 152, 184 px**.
Section tops on desktop are usually 96–122 px; on phones 40–78 px.

## 6. Page by page

Sizes are desktop → phone. "Heading" is the 34 / 30 / 34 px Financier style from §3.

| Page (URL) | Header | Page title | Top / bottom padding of the main block | Sections, in order |
| --- | --- | --- | --- | --- |
| **Home** `/` | 55 px, transparent over hero | Hero display 50 → 40 | Hero 80 vh (88 svh phone) | Full-screen hero → product carousel with intro text block (40 px top/bottom) → hero grid ("SKINSENSE® 2.0", Heading) → product carousel → full-screen hero → footer |
| **Collection** `/collections/all`, `/collections/the-club-edit` | 55 px | Heading (34 / 30 / 34) + item count as 12 px uppercase superscript (14 px phone) | 96 / 81 px → 76 / 60 px | Title block (centred) → sticky filter bar (max 800 px wide, 648 px on laptops) → 4-column product grid → optional collection description (120 px above and below, text max 520 px) → footer |
| **Product** `/products/...` | 55 px; 100 px on phone | Product title 28 / 24 / 28; price 16 px (13 px tablet, 16 px phone) | Info column 100 px top → 30 px | Gallery + info (page padding 0 15% → 0 16 px; info max 50% wide) → description (20 px above, 30 px below) → colour swatches (12 px uppercase label) → sizes (12 px uppercase legend, 20 px below) → "Product notes" accordion (13 px titles) → "Shop the look" (Heading) → "You may also like" (Heading; block padding 48 px → 96 / 32 px → 64 / 16 px) → footer |
| **Cart** `/cart` | 55 px | Cart title 24 / 20 / 24, 40 px below (11 px phone) | 152 / 64 px → 78 px (tablet) → 46 / 66 px | Bag lines or empty state → "Before you checkout, have you considered…" (Heading) → footer |
| **Search** `/search?q=` | 55 px | "You searched for:" body 13 px (16 phone) above the query in Heading | 96 / 80 px → 40 / 64 px (24 px sides) | Search header → filter bar → product grid → footer |
| **Login** `/account/login` | 55 px | Heading | 184 px top and bottom → 94 (laptop) → 40 / 56 (≤ 1199) → 64 / 88 px (phone) | Background image + form column (offset one column, 8.3%) → footer |
| **Contact** `/pages/contact-us` | 55 px | Heading | 8 vw / 9 vw → 100 / 56 px (≤ 1199) → 12 vw / 96 px (phone) | Image on the left, text column from 58% of the width; contact groups with 12 px uppercase titles, text 16 px below → footer |
| **Text pages** `/pages/delivery-returns`, privacy, terms | 55 px | Text page title 32 px, 40 px below | 122 / 122 px (120 laptop) → 48 / 48 px | Sticky side nav (12 px uppercase links) + article (offset 8.3%); accordion titles 24 px; `h3` 20 px; paragraphs 29 px apart (24 phone) → footer |
| **Our Story** `/pages/our-story` | 55 px | Heading (as `h1`) | Each section at least 110 vh (80 vh ≤ 1199) | Editorial B (image + text, 12 px uppercase subtitle, 24 px gaps) → three Editorial A sections (full-height image with centred Heading) → footer |
| **Legging Guide** `/pages/the-legging-guide` | 55 px, transparent over hero | Hero display 50 → 40 | Hero 80 vh (88 svh phone) | Full-screen hero → comparison block (heading 34 px, 40 px phone) → four guide features (image + text; text padding 15% 12% 16%, 50 / 20 px phone) → footer |

What stays constant on every page:

- Header 55 px, announcement bar 11 px caps, same footer (96 / 64 px padding).
- Page and section titles are the same Heading style; labels are 12 px caps (14 px phone);
  body is 13 px light (16 px phone).
- Side margins come from the one `.container` rule (32 / 24 / 16 px).

What varies: the top padding of each page's first block (96–184 px desktop) is set per
template, and the immersive pages (Home, Guide, Our Story) use viewport heights instead.

## 7. Product grid and card

**Grid** (`.products-grid`)

- 4 columns on desktop, 2 below 1024 px; `grid-auto-flow: row dense`.
- Gap 20 px between rows, **3 px between columns**: the images almost touch.
- **Feature tiles:** 21 of 250 products on `/collections/all` are `--big` (2 columns ×
  2 rows), at positions 3, 13, 27, 37, 51, 61 … — two in every 24, the first on the right,
  the second on the left.
- Portrait images, roughly 3:4 to 1:1.4 (`padding-top: 130%` on collection cards).

**Card**

| Element | Mouse (pointer: fine) | Touch |
| --- | --- | --- |
| Info (name, price, swatches) | Hidden (`opacity: 0`), fades in on hover over the photo, 20 px padding, row height 50 px | Always shown under the photo, 8 px padding |
| Name | 12 px uppercase, weight 400 | 14 px |
| Price | 12 px; compare-at price struck through at 60% opacity, 8 px left | 14 px |
| Photos | Swiper with dots, 3–6 images per product | Swipe |
| Swatches | Rectangles 30 × 20 px; active one gets a 1 px underline 5 px below | Same |
| Sizes | Shown on hover; unavailable sizes styled apart | — |
| Quick add | 12 px "+" icon | — |
| Badge | "New", 11 px, capitalised, 2 × 8 px padding, 10 px from the top | Bottom-aligned |

## 8. Motion

- Almost everything is an opacity fade: `transition: opacity .3s` (about 50 rules).
- Easing: `cubic-bezier(0, .25, .25, 1)` (40 uses), and `cubic-bezier(.83, 0, .17, 1)` for
  larger reveals.
- Header fades in over 1.2 s; card info fades in about 0.15–0.3 s; heroes use a parallax
  background.
- No bounce, no scale-up effects.

## 9. Free font alternatives

AtlasGrotesk and Financier are commercial; copying them needs a licence. These free fonts
are close and all load through `next/font/google` (SIL Open Font License, self-hosted at
build time). Weights and axes below are from the Google Fonts list bundled with Next.js.

| Replaces | Recommended | Weights / axes | Other options |
| --- | --- | --- | --- |
| AtlasGrotesk (sans) | **[Hanken Grotesk](https://fonts.google.com/specimen/Hanken+Grotesk)** | 100–900 variable, italic | [Geist](https://fonts.google.com/specimen/Geist) (cooler, technical) · [Inter Tight](https://fonts.google.com/specimen/Inter+Tight) (tight, good in caps) · Archivo (already in Rooq) |
| Financier (serif) | **[Newsreader](https://fonts.google.com/specimen/Newsreader)** | 200–800 variable, optical size 6–72, italic | [Source Serif 4](https://fonts.google.com/specimen/Source+Serif+4) (sturdier, optical size) · [Instrument Serif](https://fonts.google.com/specimen/Instrument+Serif) (400 only, headlines only) |
| Bangla, sans | **[Hind Siliguri](https://fonts.google.com/specimen/Hind+Siliguri)** (Rooq already uses it) | 300–700 | [Noto Sans Bengali](https://fonts.google.com/noto/specimen/Noto+Sans+Bengali) (100–900 variable) |
| Bangla, serif | **[Noto Serif Bengali](https://fonts.google.com/noto/specimen/Noto+Serif+Bengali)** | 100–900 variable | — |

Why these: Hanken Grotesk has a true 300 weight that stays readable at 12–13 px, which is
where Vaara's labels and body live. Newsreader is a light, editorial serif like Financier,
and its optical-size axis keeps 50 px heroes fine and 24 px headings sturdy from one file.

## 10. Sources

- Pages fetched: `/`, `/collections/all`, `/collections/the-club-edit`,
  `/products/skinsense-seamless-knit-legging-black`, `/cart`, `/search?q=legging`,
  `/account/login`, `/pages/contact-us`, `/pages/delivery-returns`, `/pages/our-story`,
  `/pages/the-legging-guide`.
- Theme stylesheets: `app.css`, `custom.css`, `guide.css`, `hero-featured-products.css`
  (theme "Vaara Main", Shopify asset path `/cdn/shop/t/362/assets/`).
- `/collections/all/products.json` for product types and image counts.
