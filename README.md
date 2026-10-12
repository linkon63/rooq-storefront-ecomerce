# Organishi — Storefront & Admin

The Organishi web app: the customer storefront (shop, cart, checkout, account)
and the admin panel (`/admin`), built with Next.js. It talks to the NestJS API in
[`mycommerce-backend`](../mycommerce-backend).

- **Stack:** Next.js 16 (App Router), React 19, Tailwind CSS 4, Swiper, Recharts, Sonner
- **Package manager:** pnpm
- **Design:** [Figma](https://www.figma.com/design/n7CxByfjTSzRNkLRcLZ8zN/Dev-Team?node-id=13464-164&t=KBNH9MtqN8HqniJo-1) · UI rules in [STYLE_GUIDE.md](STYLE_GUIDE.md)

> This Next.js version has breaking changes from older releases — read
> [AGENTS.md](AGENTS.md) and `node_modules/next/dist/docs/` before changing framework code.

## Installation

### Prerequisites

- Node.js 20+
- pnpm
- The backend API running (see [`mycommerce-backend/README.md`](../mycommerce-backend/README.md))

### 1. Install dependencies

```bash
pnpm install
```

### 2. Environment variables

```bash
cp .env.example .env
```

| Variable | Required | What it is |
| --- | --- | --- |
| `NEXT_PUBLIC_API_BASE_URL` | Yes | Backend API base, e.g. `http://localhost:5010/api/v1` |
| `NEXT_PUBLIC_GOOGLE_CLIENT_ID` | No | Google OAuth web client ID — enables "Sign in with Google" |
| `NEXT_PUBLIC_GTM_ID` | No | Google Tag Manager ID — leave unset to disable tracking |
| `RESEND_API_KEY` | No | Resend key for the contact form and newsletter e-mails |
| `RESEND_FROM_EMAIL` / `RESEND_TO_EMAIL` | No | Sender and inbox for those e-mails |
| `NEXT_PUBLIC_SITE_URL` | No | Public site URL used in the sitemap (defaults to `https://organishi.com`) |

The full list lives in [`docs-ecomx/ENVIRONMENT_VARIABLES.md`](../docs-ecomx/ENVIRONMENT_VARIABLES.md).

### 3. Run

```bash
pnpm dev      # development server on http://localhost:3002
pnpm build    # production build
pnpm start    # serve the production build
pnpm lint     # ESLint
```

- Storefront: <http://localhost:3002>
- Admin panel: <http://localhost:3002/admin>

## Project layout

```
app/(store)/        storefront routes — home, shop, product, cart, checkout, contact, faq, profile …
app/admin/          admin panel
app/_providers/     auth, cart, wishlist, compare context
components/storefront/  storefront UI (home sections, shop, checkout, shared header/footer)
lib/                API clients, pricing (cart-pricing.ts), contact & delivery helpers
public/             static assets
```

Storefront colours come from the tokens in `app/globals.css` (`bg-brand`, `text-brand-sky-dark`, …) —
change the palette there, not per component.

## Release Notes

Newest first. While working, add every user-facing change under **Unreleased**.
Cutting a release turns that section into a numbered version — see
[How to release](#how-to-release).

### Unreleased

#### Added

- **Admin → Orders:** every order now has an **Invoice** button beside its status controls. It opens the customer's own invoice — the same sheet the shopper gets on the confirmation page after checkout, with the shop letterhead, the items, the offers and coupon taken off, the delivery charge and the amount payable — and prints it on its own, without the admin panel around it. It works for guest and account orders alike, on the order list's mobile panel as well as the desktop one.

- **Admin image uploads:** every image picker in the admin panel (products, product variants, care guides, categories, brands, news, campaigns, hero banners, and the logo, icon and favicon in General settings) now turns away images larger than 1 MB as soon as they are picked. An error names each rejected file and its size and asks for it to be compressed or resized. Images within the limit in the same pick are still added, and the image already chosen stays in place. Each picker now shows the limit in a highlighted "Max 1 MB per image" badge so it is clear before choosing a file, and the error pops up as a toast headed "Image too large — max 1 MB".

#### Changed

- **Checkout:** an order can no longer be placed with a phone number that is not a Bangladeshi mobile number. Place Order now checks it, scrolls to the phone box, turns it red and asks for a number like 01712345678 — and the number is saved in the plain 11-digit form, so `+8801712345678` and `+880 1712-345678` are accepted and stored the same way. Picking a saved address whose number is not a Bangladeshi one asks for that address to be edited first.
- **Profile → Address Book:** saving an address now needs a Bangladeshi mobile number too, and stores it in the same 11-digit form.

#### Fixed

- **"Get Latest Updates & Big Deals" on the home page:** on small phones the **Subscribe Now** button squeezed the e-mail box until the placeholder was unreadable. The field and the button now sit one above the other below 640px and go back side by side on wider screens, the field is large enough that iPhones stop zooming the page in when it is tapped, and the band grows instead of clipping its text when the wording wraps onto more lines.

### v0.3.0 — 2026-09-20

#### Added

- **Admin → Products → Edit:** a variant that has already been sold can now be taken off the shop. Removing it archives it instead of deleting it — it disappears from the storefront, from search and from the cart, but stays on the orders it was part of. Archived variants are listed at the bottom of the Variant Options section with **Put back on sale**.
- **Admin → Products:** the ⋮ menu now has **View Product** — a summary of the product without leaving the list: its photos, price, cost, total stock, brand, category, unit, tags, description and every variant with its SKU, price and stock.

#### Changed

- **Floating contact button:** it stays open until the ✕ is tapped (or Escape, or one of the channels is picked) — tapping the page behind it no longer closes it.
- **Product page:** a **Back** button now sits beside the breadcrumb, returning to wherever the shopper came from — a category, search results, the wishlist — or to the shop when the page was opened from a fresh link.
- **Contact page:** the Chat on Messenger card is gone; Live Chat is WhatsApp only.
- **Header top bar:** the e-mail address is gone, the opening hours lead the left side, and the right side now carries two numbers — one to call and one for WhatsApp. They come from Admin → Settings → Contact: the first saved number is the call line, the second the WhatsApp line, and a shop with one number saved uses it for both.
- **"Follow Us On" on the home page:** each logo now sits in a tile filled with its own brand colour — Facebook blue, Instagram pink, YouTube red — instead of the shop green.
- **Home page:** the "Real organic food, the way it used to taste" section is hidden for now.
- **"Our Most Loved Items"** is now curated from Admin → Tags: a product tagged **Best Seller**, **Highlight** or **Hero** appears there, up to four at a time. The shelf carries a "Best Sellers" badge, and it rearranges itself around how many products are tagged — one is a single spotlight, four fill the row. Until any of those tags is used it keeps showing the biggest savings as before.
- **"Our Most Loved Items"** sits on a soft green band now, so the rail stands apart from the white sections around it.
- **Footer on tablets and desktop:** rearranged into even columns — the logo with the social buttons beneath it, then the link lists, then Contact — with matching gutters between all four, and the payment badges and copyright centred in one strip at the bottom. The phone footer is unchanged.
- The footer no longer repeats the help phone number beside the logo; it is still in the Contact column and on the call button above.
- **Logo:** the logo file carried a third of its canvas as empty margin, so it always sat inset from whatever was beside it and printed far smaller than its setting suggested. It is now trimmed to the artwork and renders correctly in the header, the footer, the admin panel, the invoice, the favicon and link previews.
- **Footer social buttons** now carry each platform's own colour instead of the shop green.
- **Footer payment methods** now show each provider's logo in its brand colour — bKash, Nagad, Rocket, VISA and Mastercard — with a note icon for cash on delivery.
- The footer's Contact column no longer lists the opening hours; they are still in the header and on the contact page.
- **"Get Latest Updates & Big Deals"** now sits on a photo of the product range instead of the rotating stock backdrops, in a shorter band.

#### Fixed

- **Admin → Products → Add product:** the page never raised a toast — a rejected save only wrote a line under the form, so it looked like nothing happened. Every failure now pops a toast, and a successful save confirms with one.
- **Admin → Products → Add / Edit:** a refused save said only "Another product with these details already exists". It now names the value and the field: "«Oil» already uses the web address (slug) «oil» — change the product name, or edit the slug", or «SKU «OIL-1L» already belongs to another product». The offending box turns red with a one-line hint beside it.
- **Admin → Products → Add product:** a duplicate web address is now caught before anything is written, and a save that fails partway removes what it had already created — so a failed attempt no longer leaves a product behind whose name and SKUs then block the retry.
- **Admin → Products:** the ⋮ actions menu on the last rows of the list was cut off by the edge of the table card. It now floats above the page and flips above the button when there is no room below.
- **Admin → Products → Edit:** a product with variants opened as a **Single product** with none of its options selected, so saving it wiped the variants. It now opens as a variant product with the saved options and values already selected, and saving updates those variants instead of creating duplicates.
- **Admin → Products → Edit:** taking a variant option (or one of its values) out of a product did nothing — the variants stayed on the product and were back in the list on the next edit. Saving now deletes the variants the configuration list no longer covers, after asking you to confirm which ones go. A variant that has already been ordered is kept and reported instead.
- **Admin → Products → Edit:** the **Base SKU** of a variant product was read from its default variant, so every save appended that variant's option codes again and SKUs grew each time ("OIL-SKU-5LITRE-1LITRE-500ML-…"). It is now what the product's variant SKUs have in common, and new variant SKUs stay short.
- **Admin → Products → Edit:** the **Variants configuration list** listed every possible mix of the selected option values, so a product with 2 packagings and 4 volumes showed 8 rows even though only 4 are sold — and saving created the four it invented. It now lists the product's real variants; mixes that have no variant sit below the list as **Combinations not sold as a variant**, one tap away from being added, and a newly added row can be removed again.
- **Admin → Products:** the variant names in a product's expanded row and in the variant picker were falling back to the bare SKU; they show their options again (for example "Weight: 500 g").

### v0.2.0 — 2026-09-19

Mobile-first storefront pass, checkout rework and brand refresh.

#### Added

- **Buy Now sheet (phones):** Buy Now on product cards and the product page opens a bottom sheet to pick the variant and quantity, with Add to Cart and Buy Now buttons.
- **FAQ page** at `/faq`, linked from the footer and listed in the sitemap.
- **Contact page redesign:** hotline, e-mail and address cards, Live Chat (WhatsApp with a pre-filled message, and Messenger when a Facebook page is set), a support strip, the message form beside the map, and delivery charges.
- **Floating contact button** on every screen — call, WhatsApp and e-mail. Tablets and desktop also get a back-to-top button.
- **Footer contact CTA** in Bangla with Call and WhatsApp buttons.
- **Checkout:** the whole cart is listed with checkboxes so shoppers choose what to order. On phones a compact order summary sits at the top.
- **Guest checkout** needs only name, phone, address and an Inside / Outside Dhaka choice; e-mail is optional.
- Signed-in shoppers get their account phone number filled in at checkout.
- Place Order scrolls to the first missing field, focuses it and names it.
- Place Order and Proceed to Checkout pulse to draw attention.
- **Cart:** each line shows its chosen variant (e.g. "Weight: 500 g"). On phones, Proceed to Checkout is docked to the bottom.
- Logo-derived brand colour tokens in `app/globals.css`.

#### Changed

- **Mobile header:** the top bar is hidden, search opens from an icon, and Wishlist moved into the menu. The header now shares the footer's background tint.
- **Hero** is a single swipeable slider on phones (auto-advances every 3 s).
- **Home section titles:** 22 px bold on phones, semibold on larger screens.
- **Footer on phones:** centred logo over the description, two link columns, and an icon-only contact row.
- The storefront green now matches the logo and meets text-contrast guidelines.
- The terms checkbox starts ticked. Unticking it disables Place Order.
- Toasts appear at the top on phones.
- **Cart quantity** stops at 1. Removing a line is done with the delete icon.

#### Fixed

- "Cart item … not found" and "None of the selected items were found in your cart" after a signed-in order. The cart is now re-read from the server.
- Two variants of the same product no longer merge into one cart line, and quantity/remove act on the right variant.
- The cart page no longer shakes when the quantity changes. Prices no longer flicker, and the scrollbar gutter is stable.
- The empty area above the floating contact button no longer blocks clicks.
- Bangladeshi phone numbers are validated and normalised on profile update.

### v0.1.0

Baseline — everything before release notes were kept. See `git log`.

## How to release

**With Claude Code:** run `/release` (or `/release minor`, `/release patch`).
Claude reads the changes, picks the version, updates this section and `package.json`.

**By hand:**

1. Choose the version (we are pre-1.0):
   - **minor** (`0.2.0 → 0.3.0`): new features or behaviour changes
   - **patch** (`0.2.0 → 0.2.1`): fixes only
   - **major** (`1.0.0`): production launch or a breaking change
2. Rename **Unreleased** to `### vX.Y.Z — YYYY-MM-DD`, group entries under Added / Changed / Fixed, and add a fresh empty **Unreleased** above it.
3. Bump `package.json`: `pnpm version <minor|patch|major> --no-git-tag-version`
4. Commit `chore(release): vX.Y.Z` and tag it: `git tag vX.Y.Z`
