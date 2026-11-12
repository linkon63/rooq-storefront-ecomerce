# Rooq — Storefront, Admin & API

Rooq is a fashion e-commerce web app in one Next.js project: the customer
storefront (shop, product, cart, checkout, account), the admin panel (`/admin`)
and the REST API (`/api/v1/*`, route handlers). Data lives in Postgres through
Prisma; product images are stored in the database and served by
`GET /api/v1/media/:id`. There is no separate backend.

- **Stack:** Next.js 16 (App Router), React 19, Tailwind CSS 4, Prisma 7 (Postgres, `pg` adapter), zod, jose, sharp, Redux Toolkit, GSAP, three.js
- **Package manager:** pnpm
- **Architecture notes:** [docs/architecture/porting-guide.md](docs/architecture/porting-guide.md) · [docs/architecture/fashion-api-contract.md](docs/architecture/fashion-api-contract.md) · UI rules in [STYLE_GUIDE.md](STYLE_GUIDE.md)

> This Next.js version has breaking changes from older releases — read
> [AGENTS.md](AGENTS.md) and `node_modules/next/dist/docs/` before changing framework code.

## Installation

### Prerequisites

- Node.js 20+ (24 recommended)
- pnpm
- A PostgreSQL database (any Postgres 14+; Prisma Postgres works)

### 1. Install dependencies

```bash
pnpm install          # also runs `prisma generate` (postinstall)
```

### 2. Environment variables

```bash
cp .env.example .env
```

| Variable | Required | What it is |
| --- | --- | --- |
| `DATABASE_URL` | Yes | Postgres connection string |
| `JWT_SECRET` | Yes | Secret that signs access tokens — a long random string |
| `JWT_EXPIRES_IN` | No | Token lifetime, e.g. `7d` (default) |
| `NEXT_PUBLIC_APP_URL` | Yes | Public app origin, used in e-mail links (password reset), e.g. `http://localhost:3002` |
| `NEXT_PUBLIC_SITE_URL` | No | Public site URL used in metadata, `robots.txt` and the sitemap (default `https://rooq.store`) |
| `SEED_ADMIN_EMAIL` | No | Staff account the seed creates (default `admin@rooq.local`) |
| `SEED_ADMIN_PASSWORD` | No | Its first password (default `ChangeMe123!` — change it for any shared database) |
| `RESEND_API_KEY` | No | Resend key for transactional e-mail (password reset, orders, back-in-stock). Without it mail is a logged dry run |
| `RESEND_FROM_EMAIL` / `RESEND_TO_EMAIL` / `STORE_EMAIL` | No | Sender, contact-form inbox and store notification inbox |
| `NEXT_PUBLIC_GOOGLE_CLIENT_ID` | No | Google OAuth web client ID — enables "Sign in with Google" |
| `NEXT_PUBLIC_GTM_ID` | No | Google Tag Manager ID — leave unset to disable tracking |

The API is served by this app at `/api/v1` (same origin), so there is no API URL to configure. `.env` is git-ignored; never commit it.

### 3. Database

```bash
pnpm db:migrate:deploy   # apply prisma/migrations to DATABASE_URL (or: pnpm db:migrate:pg — see below)
pnpm db:seed             # roles, admin account, sizes, colours, categories, demo fashion catalogue, images (~3 min on a remote DB)
```

- `pnpm db:migrate` — create a new migration while developing (`prisma migrate dev`).
- `pnpm db:migrate:pg` — fallback that applies pending migrations through the `pg` driver, for networks where Prisma's schema engine cannot connect (P1001). It records them in `_prisma_migrations` like `migrate deploy` does.
- `pnpm db:studio` — browse the data. `pnpm db:generate` — regenerate the client into `lib/generated/prisma` (git-ignored).
- The seed is idempotent; rerunning it updates the demo data instead of duplicating it.
- Images are stored in Postgres (`media` + `media_blobs`, WebP, max 1600 px) and served by `GET /api/v1/media/:id`; nothing is written to `public/`, so no S3 bucket or writable disk is needed.
- Schema reference: `docs/database/` — `rooq-erd.drawio` (open in diagrams.net), `schema.dbml` (paste into dbdiagram.io) and `README.md` (every table and relation).

### 4. Run

```bash
pnpm dev        # http://localhost:3002
pnpm build      # prisma generate && next build
pnpm start      # serve the production build on port 3002
pnpm typecheck  # tsc --noEmit
pnpm lint       # ESLint
```

- Storefront: <http://localhost:3002>
- Admin panel: <http://localhost:3002/admin> — sign in with the seeded staff account (`SEED_ADMIN_EMAIL` / `SEED_ADMIN_PASSWORD`, defaults above). It is the superadmin, so Staff & Roles is visible.
- API: <http://localhost:3002/api/v1> (`GET /api/v1` is a liveness probe)
- Use another port with `pnpm exec next start -p <port>` (or `next dev -p <port>`).

## Project layout

```
app/(store)/            storefront routes (server components read services via lib/storefront)
app/admin/              admin panel (client pages; _components, _hooks per page)
app/api/v1/<module>/    API route handlers (thin — call lib/server)
lib/server/             server-only code: prisma, http wrapper, validation, auth, media, services
lib/admin/, lib/admin-api/   admin browser client (transport + per-domain calls)
lib/storefront/         storefront server loaders (cached, in-process service calls)
lib/constants/          ERROR_MESSAGES (every error string) and other constants
lib/store/              Redux Toolkit store (client state)
lib/generated/prisma/   generated Prisma client (not committed)
utils/                  pure functions: formatting, pricing, mappers, validation helpers
types/                  shared TypeScript types
prisma/                 schema.prisma, migrations, seed
docs/                   architecture (porting guide, API contract), database (ERD, DBML), design
```

## Release Notes

Newest first. While working, add every user-facing change under **Unreleased**.
Cutting a release turns that section into a numbered version — see
[How to release](#how-to-release).

### Unreleased

_Nothing yet._

### v0.4.1 — 2026-11-02

#### Fixed

- **Product page:** picking a variant (for example, another weight) now shows that variant's own photos. They lead the gallery, followed by the product's photos, and the main image jumps to the variant's first photo; before, the gallery only ever showed the product's photos. The cart, the wishlist and the Buy Now sheet on phones now show the chosen variant's photo too.

### v0.4.0 — 2026-10-22

#### Added

- **Admin → Settings → General:** a **Show Certification Section** switch under UI Settings turns the homepage's "Our Product Quality & Recognition" certificates on or off. It is on by default, so the homepage looks the same until it is switched off. Switched off, the section leaves no blank space behind: "Our Most Loved Items" runs straight into "What Customer Say About Us" as one band.

- **Invoice (checkout confirmation and Admin → Orders):** reworked for customers. It now has its own **Invoice No.** (`INV-2026-000123`), shown beside the **Order ID** instead of the order ID standing in for it; the number is fixed per order, so a reprint carries the same one. Each product shows its SKU and weight or size under its name. The logo sits on the right of the letterhead, with the shop name, address, phone and www.organishi.com on the left, and the invoice title and details in their own band below. The delivery address no longer repeats "Inside Dhaka", and the total reads "Payable on Delivery" once instead of twice. The footer gives the phone, contact hours, the Facebook page and a WhatsApp number that opens a chat, in place of the e-mail address. Printing no longer adds the browser's date, page title and web address to the top and bottom of the page, and the floating chat button stays off the paper.

- **Checkout:** a highlighted note with a pulsing dot now tells shoppers about free delivery (for example, on orders over ৳2500). Guests see it in the delivery form right under **Delivery Area**; signed-in shoppers, who have no Delivery Area field, see it under the delivery charge in the order summary. The wording is set in the storefront's environment and the note is hidden when it is not set; it does not change the total — the shop waives the charge on the order from the admin panel.

- **Admin → Orders:** cancelling an order now asks why first. **Cancel** opens a confirmation with a **Reason** box — out of stock, the customer changed their mind, an unreachable number — and will not go through until something is written. The reason is kept on the order and shown at the top of the order whenever it is opened again, so there is no guessing a week later why it was stopped. An order a customer cancelled themselves reads "Cancelled by the customer".

- **Admin → Orders:** every order now has an **Invoice** button beside its status controls. It opens the customer's own invoice — the same sheet the shopper gets on the confirmation page after checkout, with the shop letterhead, the items, the offers and coupon taken off, the delivery charge and the amount payable — and prints it on its own, without the admin panel around it. It works for guest and account orders alike, on the order list's mobile panel as well as the desktop one. Cancelled orders have no button — nothing was sold, so there is nothing to invoice — while a returned order keeps it, since its invoice is what the refund is settled against.

- **Admin image uploads:** every image picker in the admin panel (products, product variants, care guides, categories, brands, news, campaigns, hero banners, and the logo, icon and favicon in General settings) now turns away images larger than 1 MB as soon as they are picked. An error names each rejected file and its size and asks for it to be compressed or resized. Images within the limit in the same pick are still added, and the image already chosen stays in place. Each picker now shows the limit in a highlighted "Max 1 MB per image" badge so it is clear before choosing a file, and the error pops up as a toast headed "Image too large — max 1 MB".

#### Changed

- **Checkout:** an order can no longer be placed with a phone number that is not a Bangladeshi mobile number. Place Order now checks it, scrolls to the phone box, turns it red and asks for a number like 01712345678 — and the number is saved in the plain 11-digit form, so `+8801712345678` and `+880 1712-345678` are accepted and stored the same way. Picking a saved address whose number is not a Bangladeshi one asks for that address to be edited first.
- **Profile → Address Book:** saving an address now needs a Bangladeshi mobile number too, and stores it in the same 11-digit form.

#### Fixed

- **Printing the invoice on A5 paper (checkout confirmation and Admin → Orders):** the invoice was fixed to A4, so the print dialog offered no paper choice and an A5 print came out broken — the details dropped under the title, the addresses stacked, and the Amount column was cut off. It now prints on whatever paper is picked in the print dialog, keeping the same layout on A5 as on A4 with tighter margins so every column fits, and a longer invoice moves the totals and the footer to the next page whole instead of splitting "Subtotal" from "Payable".

- **Prices with a percentage offer:** a product on a percentage discount showed a price in poisha — ৳382.5 for 15% off ৳450 — on the product cards, the product page, the cart, checkout and the invoice. Offer prices are now whole taka, rounded down so the shopper always saves at least the advertised percentage (৳382 in that example), and the cart, checkout and the order charge the same figure the product page shows.

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
