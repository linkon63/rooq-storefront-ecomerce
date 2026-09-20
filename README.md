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

#### Changed

- **Header top bar:** the e-mail address is gone, the opening hours lead the left side, and the right side now carries two numbers — one to call and one for WhatsApp. They come from Admin → Settings → Contact: the first saved number is the call line, the second the WhatsApp line, and a shop with one number saved uses it for both.
- **"Follow Us On" on the home page:** each logo now sits in a tile filled with its own brand colour — Facebook blue, Instagram pink, YouTube red — instead of the shop green.
- **Home page:** the "Real organic food, the way it used to taste" section is hidden for now.
- **Footer on tablets and desktop:** rearranged into even columns — the logo with the social buttons beneath it, then the link lists, then Contact — with matching gutters between all four, and the payment badges and copyright centred in one strip at the bottom. The phone footer is unchanged.
- The footer no longer repeats the help phone number beside the logo; it is still in the Contact column and on the call button above.
- **Logo:** the logo file carried a third of its canvas as empty margin, so it always sat inset from whatever was beside it and printed far smaller than its setting suggested. It is now trimmed to the artwork and renders correctly in the header, the footer, the admin panel, the invoice, the favicon and link previews.
- **Footer social buttons** now carry each platform's own colour instead of the shop green.
- **Footer payment methods** now show each provider's logo in its brand colour — bKash, Nagad, Rocket, VISA and Mastercard — with a note icon for cash on delivery.
- The footer's Contact column no longer lists the opening hours; they are still in the header and on the contact page.
- **"Get Latest Updates & Big Deals"** now sits on a photo of the product range instead of the rotating stock backdrops, and the section takes the photo's own proportions so the whole picture is visible rather than a strip cut out of it.

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
