# Rooq: project overview

**Rooq** is a fashion e-commerce platform for clothing, footwear and
accessories. One Next.js application contains all three parts:

| Part | Where | Who uses it |
| --- | --- | --- |
| Storefront | `app/(store)` → `/`, `/shop`, `/product/…`, `/cart`, `/checkout`, `/profile`, … | Shoppers (guest or signed in) |
| Admin panel | `app/admin` → `/admin/*` (guarded by `proxy.ts`) | Staff with the `admin` or `superadmin` role |
| REST API | `app/api/v1/**/route.ts` → `/api/v1/*` | The storefront and admin clients, same origin |

There is no separate backend service. The API that used to be a NestJS app is
now a set of Next.js route handlers with the **same paths, request bodies and
JSON responses**, so the UI kept working through the move. Data lives in
PostgreSQL through Prisma, and **product images are stored in the database** and
served by `GET /api/v1/media/:id`.

## Fashion features

The catalogue is built for apparel, not generic products.

**Catalogue and discovery**

- Departments (Men, Women, Kids, Unisex) and a nested category tree with breadcrumbs.
- **Variants = colour × size.** Colours have a swatch hex and a filter family (Navy and Sky are both Blue). Sizes are grouped (alpha XS–XXL, numeric waist, shoe, one size) and sorted within their group.
- **Per-colour galleries:** picking a colour swaps the gallery; shared images show for every colour.
- **Faceted shop filters**, synced to the URL: size (in stock only), colour, brand, department, category, material, fit, pattern, season, occasion, price range, in stock, on sale, new arrivals. Each facet shows a count of products.
- Product details: material and composition, care instructions, fit, season, occasions, pattern, model info ("Model is 180 cm and wears M"), feature bullets, attributes such as neckline and sleeve length.
- **Size guide** from structured size charts (per category, overridable per product), with a cm/inch toggle.
- **Collections and lookbooks**, including "shop the look" scenes and "complete the look" on the product page. *New arrivals* and *Sale* are live views of the catalogue.
- Search across name, style code, SKU and brand. Related products.
- **Wishlist**; **compare** and **recently viewed** (client-side, persisted per browser).

**Buying**

- Cart by exact variant (size and colour required), guest or signed-in cart.
- Coupons (percentage or fixed, limits, minimum order) and automatic product offers.
- Delivery zones with charges and a free-shipping threshold from settings.
- Guest checkout; payment by cash on delivery, card, bKash, Nagad, Rocket or bank transfer.
- Order history and tracking, a printable invoice with yearly numbering (`INV-YYYY-NNNNNN`).
- **Back-in-stock alerts** per size and colour.
- **Returns and exchanges** within the return window: refund, or swap for another size or colour.
- **Reviews with fit feedback** (runs small / true to size / runs large), photos, a verified-purchase badge, and the reviewer's size and colour.
- E-mail/phone + password or Google sign-in, password reset, address book, in-app notifications.

**Running the store (admin)**

- Products with a **variant matrix generator** (pick colours × sizes → SKUs) and bulk price and stock editing.
- Master data: colours, sizes, size charts, categories, brands, tags, attributes, units, suppliers.
- **Inventory ledger:** every stock change is a recorded movement (restock, sale, return, exchange, adjustment …), with low-stock and out-of-stock alerts on the dashboard.
- Orders (status timeline, cancellation reasons, invoices, payments, shipments), returns, back-in-stock demand, reviews moderation.
- Marketing: collections and lookbooks, home-page sections and campaigns, coupons, product discounts, news/journal.
- Wholesale (B2B) quote requests that convert into orders.
- Reports, dashboard, store settings and policies, roles and permissions, activity log.

## Tech stack

| Layer | Choice |
| --- | --- |
| Framework | **Next.js 16** (App Router, route handlers, `proxy.ts`), **React 19** |
| Language | **TypeScript**, strict. `pnpm typecheck` must stay at zero errors |
| Styling | **Tailwind CSS 4** |
| Database | **PostgreSQL** (Prisma Postgres) via **Prisma 7** with the `pg` driver adapter. The client is generated to `lib/generated/prisma` |
| Validation | **zod 4** (`z.strictObject` bodies, which reject unknown keys) |
| Auth | JWT HS256 with **jose**, passwords with **bcryptjs**, httpOnly cookie or Bearer token, Google OAuth |
| Images | **sharp** (WebP, 1600 px, q80), stored as `bytea` in Postgres |
| Client state | **Redux Toolkit** + react-redux (`lib/store`) |
| Animation | **GSAP** (`@gsap/react` `useGSAP`) and **three.js** (`@react-three/fiber`, `@react-three/drei`). Client-only, dynamically imported, and switched off under `prefers-reduced-motion` |
| E-mail | **Resend** (a logged dry run without an API key) |
| Other UI | sonner (toasts), swiper, recharts (admin reports), react-icons, Radix dialog, Leaflet (store map) |
| Tooling | pnpm, ESLint 9 (`eslint-config-next`), tsx for scripts |

## Folder conventions

```
app/(store)/                 storefront pages (server components by default)
app/admin/                   admin panel; app/admin/_components = shared admin UI
app/api/v1/<module>/…/route.ts   API route handlers: parse → call service → return
components/                  shared React components (one component per file)
components/ui/               design-system primitives
lib/                         libraries and anything with I/O or side effects
  lib/server/                server-only code ("server-only"): prisma, http wrapper,
                             validation, auth, media, mail, per-module services
  lib/store/                 Redux Toolkit store, typed hooks, slices
  lib/constants/             constants: ERROR_MESSAGES, success messages, auth, media …
  lib/*-api.ts               typed API clients used by client components
utils/                       pure functions only: formatting, pricing, slug, mappers,
                             validation helpers, size-chart maths (no I/O)
types/                       shared TypeScript types
prisma/                      schema.prisma, migrations, seed
docs/                        this documentation
```

The rules, which apply to every change:

1. **`utils/` = pure functions.** Same input → same output, no I/O, no framework
   or library side effects. Examples: `utils/catalog/price.ts`
   (`effectivePrice`, `discountPercent`), `utils/slug.ts`, `utils/media-url.ts`,
   `utils/mappers/*` (database row → API response).
2. **`lib/` = libraries and I/O.** The Prisma client, services, auth, HTTP helpers, API
   clients, the Redux store, sharp, mail. Files in `lib/server/` start with
   `import "server-only"` and are never imported by client components.
3. **One error-messages file.** Every error string, whether an API response or a UI toast,
   comes from [`lib/constants/error-messages.ts`](../lib/constants/error-messages.ts)
   (`ERROR_MESSAGES`, grouped by domain, `as const`; parametrised messages are
   small functions). No inline error literals anywhere else.
4. **Small components.** One component per file, about 200 lines at most. Split
   larger ones, and prefer composition over boolean-prop variants.
5. **Redux for client state.** Cart UI, session, product lists, compare and
   recently viewed live in slices under `lib/store/slices`, combined in
   `lib/store/root-reducer.ts`. Server data is fetched in server components by
   calling services directly, not via Redux.
6. **Animation is progressive.** GSAP and three.js load only on the client
   (`next/dynamic`), never block content, and respect `prefers-reduced-motion`.
7. **TypeScript strict, no `any`.**

Project skills used while building (in `.claude/skills`): `react-best-practices`
and `composition-patterns` for all React/Next code; `frontend-design` and
`web-design-guidelines` for UI work.

## How a request flows

```
browser ──► app/(store)/shop/page.tsx (server component)
              └─► lib/server/catalog/products/service.ts ──► prisma ──► Postgres
browser (client component) ──► fetch /api/v1/cart  (lib/storefront-api.ts)
              └─► app/api/v1/cart/route.ts → route(withAuth(…)) → service → mapper (utils/)
<img src="/api/v1/media/<id>"> ──► media route → media_blobs.data (cached 1 year)
```

## Further reading

- [Database design](database/README.md): ER diagram, DBML, every table and relationship.
- [API reference](api.md): every `/api/v1` route and its auth.
- [Porting guide](architecture/porting-guide.md) and [fashion API contract](architecture/fashion-api-contract.md).
- [Environment variables](environment-variables.md) · [Deployment](deployment.md).
