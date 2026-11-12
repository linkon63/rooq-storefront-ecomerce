# API reference (`/api/v1`)

The REST API is part of the Next.js app: route handlers under [`app/api/v1`](../app/api/v1). It keeps the paths, request bodies and JSON responses of the earlier NestJS backend, so existing clients work unchanged. Request and response shapes for the fashion endpoints are in [architecture/fashion-api-contract.md](architecture/fashion-api-contract.md). How to add a route is in [architecture/porting-guide.md](architecture/porting-guide.md).

> This index is generated from the route files that exist in the repository (**135 operations** on 2026-11-12). More modules are still being ported. The [Not yet in this index](#not-yet-in-this-index) section lists the groups that have no route file yet.

## Conventions

- **Base URL:** same origin, `/api/v1`. `GET /api/v1` answers `{ status: "ok" }` (liveness probe).
- **Auth:** `Authorization: Bearer <jwt>` first, then the httpOnly `access_token` cookie that login/register set. The admin UI sends its `admin_access_token` as a Bearer token, and the storefront sends `customer_access_token`. Disabled or soft-deleted users are rejected.
- **Auth column:** **P** public · **P+** public, but a signed-in user is recognised (e.g. extra fields for staff) · **U** any signed-in user (owner checks happen in the service) · **A** `admin` or `superadmin` · **S** `superadmin` only. `superadmin` passes every role check.
- **Status codes:** `POST` answers `201` (as the old backend did), other methods `200`, unless a route says otherwise.
- **Errors:** `{ statusCode, message, error, path }`. Validation errors are `400` with `message: string[]`; unknown body keys are rejected (`property foo should not exist`). A duplicate unique value is `409`, a blocked delete (row still referenced) is `409`, a missing row is `404`, an unreachable database is `503`, and anything else is `500` with a `reference` code. Every message comes from `ERROR_MESSAGES` (`lib/constants/error-messages.ts`).
- **Lists:** `{ data: T[], meta: { page, limit, total, totalPages } }`. `?page` defaults to 1, `?limit` to 20 (max 200).
- **Money** is sent as numbers. **Images** are URL strings (`/api/v1/media/<id>`). To set an image, send the `url` returned by `POST /upload` or a `…MediaId`.

## Auth & media

### `/auth`

| Method | Path | Auth | Notes |
| --- | --- | --- | --- |
| `POST` | `/auth/change-password` | U | { currentPassword, newPassword }. |
| `POST` | `/auth/forgot-password` | P | { email } → emails a reset link. |
| `POST` | `/auth/google` | P | Body: { accessToken } (Google OAuth access token). |
| `POST` | `/auth/login` | P | Body: { identifier \| email, password, rememberMe? } |
| `POST` | `/auth/logout` | P | Clears the access_token cookie. |
| `GET` | `/auth/me` | U | The signed-in user. |
| `PATCH` | `/auth/me` | U | Update name / email / phone. |
| `POST` | `/auth/refresh-token` | U | New access token for the signed-in user. |
| `POST` | `/auth/register` | P |  |
| `POST` | `/auth/reset-password` | P | { token, password }. |

### `/upload`

| Method | Path | Auth | Notes |
| --- | --- | --- | --- |
| `POST` | `/upload` | A | Stores the image in the database and answers `{ url, id }` where url = "/api/v1/media/<id>". |

### `/media`

| Method | Path | Auth | Notes |
| --- | --- | --- | --- |
| `GET` | `/media/:id` | P | Streams a database-stored image with a one-year immutable cache and a checksum ETag (304 on If-None-Match). |

## Catalog

### `/products`

| Method | Path | Auth | Notes |
| --- | --- | --- | --- |
| `GET` | `/products` | P+ | Shop listing with filters, sort and facets (scope=admin for staff). |
| `POST` | `/products` | A | Create (admin). |
| `GET` | `/products/:id` | P+ | `includeArchived=true` for archived. |
| `PATCH` | `/products/:id` | A |  |
| `DELETE` | `/products/:id` | A | Archive (soft delete). |
| `GET` | `/products/:id/media` | P | The flat gallery. |
| `POST` | `/products/:id/media` | A | Multipart `file` (+ colorId, alt, isPrimary) or JSON { url \| mediaId, … }. |
| `PATCH` | `/products/:id/media/reorder` | A | { items: { id, position }[] }. |
| `POST` | `/products/:id/restore` | A | Un-archive as a draft (admin). |
| `GET` | `/products/:id/reviews` | P | Approved reviews + rating/fit summary. |
| `POST` | `/products/:id/reviews` | U | JSON, or multipart with up to 5 `photos`. |
| `GET` | `/products/:id/size-chart` | P | Product → category → parent chart, or null. |
| `GET` | `/products/:id/variants` | P+ | Staff get VariantAdmin rows incl. archived ones. |
| `POST` | `/products/:id/variants` | A |  |
| `POST` | `/products/:id/variants/generate` | A | Sizes × colours matrix (201 when anything was created). |
| `GET` | `/products/slug/:slug` | P | Storefront product page. |

### `/variants`

| Method | Path | Auth | Notes |
| --- | --- | --- | --- |
| `GET` | `/variants/:id` | P |  |
| `PATCH` | `/variants/:id` | A |  |
| `DELETE` | `/variants/:id` | A | Deletes, or archives when it has order/stock history. |
| `PATCH` | `/variants/bulk` | A | Bulk price / stock / active edit in one transaction. |

### `/product-media`

| Method | Path | Auth | Notes |
| --- | --- | --- | --- |
| `PATCH` | `/product-media/:id` | A | Colour, position, primary flag, alt text. |
| `DELETE` | `/product-media/:id` | A |  |

### `/colors`

| Method | Path | Auth | Notes |
| --- | --- | --- | --- |
| `GET` | `/colors` | P | Colour master (?active=true). |
| `POST` | `/colors` | A |  |
| `GET` | `/colors/:id` | P |  |
| `PATCH` | `/colors/:id` | A |  |
| `DELETE` | `/colors/:id` | A | 409 while variants use it. |

### `/sizes`

| Method | Path | Auth | Notes |
| --- | --- | --- | --- |
| `GET` | `/sizes` | P | Size master (?group=ALPHA&active=true), in display order. |
| `POST` | `/sizes` | A |  |
| `GET` | `/sizes/:id` | P |  |
| `PATCH` | `/sizes/:id` | A |  |
| `DELETE` | `/sizes/:id` | A | 409 while variants or size charts use it. |
| `PATCH` | `/sizes/reorder` | A | { items: { id, sortOrder }[] }. |

### `/size-charts`

| Method | Path | Auth | Notes |
| --- | --- | --- | --- |
| `GET` | `/size-charts` | A | Every chart with its categories (admin). |
| `POST` | `/size-charts` | A |  |
| `GET` | `/size-charts/:id` | P+ | Staff also see inactive ones + categories. |
| `PATCH` | `/size-charts/:id` | A | `rows` replaces every row; `categoryIds` sets which categories default to this chart. |
| `DELETE` | `/size-charts/:id` | A |  |

## Content

### `/reviews`

| Method | Path | Auth | Notes |
| --- | --- | --- | --- |
| `GET` | `/reviews` | A | Every review, paginated (`?status&productId&rating&search`). |
| `POST` | `/reviews` | A | Create a review on behalf of a user. |
| `PATCH` | `/reviews/:id` | U | The author edits; staff may also approve/reject. |
| `DELETE` | `/reviews/:id` | U | The author or staff. |
| `GET` | `/reviews/pending` | A | The moderation queue, paginated. |

### `/news`

| Method | Path | Auth | Notes |
| --- | --- | --- | --- |
| `GET` | `/news` | P | Published articles. |
| `POST` | `/news` | A | Multipart with an optional `image` cover, or JSON. |
| `GET` | `/news/:id` | P+ | Drafts only for staff. |
| `PATCH` | `/news/:id` | A | `image` replaces the cover, `coverImageUrl=""` removes it. |
| `DELETE` | `/news/:id` | A |  |
| `GET` | `/news/manage` | A | Every article including drafts. |
| `GET` | `/news/slug/:slug` | P | One published article. |

### `/sections`

| Method | Path | Auth | Notes |
| --- | --- | --- | --- |
| `GET` | `/sections` | P |  |
| `POST` | `/sections` | A |  |
| `GET` | `/sections/:id` | P |  |
| `PATCH` | `/sections/:id` | A |  |
| `DELETE` | `/sections/:id` | A | Refused while campaigns still use it. |

### `/campaigns`

| Method | Path | Auth | Notes |
| --- | --- | --- | --- |
| `GET` | `/campaigns` | P+ | Live campaigns; staff tokens see every campaign. |
| `POST` | `/campaigns` | A | Multipart with up to 10 `images`, or JSON with `keepImages` URLs. |
| `GET` | `/campaigns/:id` | P+ | Staff see any campaign. |
| `PATCH` | `/campaigns/:id` | A | `keepImages` (JSON array of URLs) + new `images` replace the gallery. |
| `DELETE` | `/campaigns/:id` | A |  |
| `PATCH` | `/campaigns/:id/status` | A | Active / inactive. |
| `GET` | `/campaigns/sections` | A | Sections for the campaign form. |

### `/policies`

| Method | Path | Auth | Notes |
| --- | --- | --- | --- |
| `GET` | `/policies` | P | { title, content }, … }` or null |
| `PATCH` | `/policies` | A |  |

### `/settings`

| Method | Path | Auth | Notes |
| --- | --- | --- | --- |
| `GET` | `/settings` | P+ | The fraud-check API key is only shown to staff. |
| `PATCH` | `/settings` | A | Create or update the store settings |

## Commerce

### `/orders`

| Method | Path | Auth | Notes |
| --- | --- | --- | --- |
| `GET` | `/orders` | A | Search, filter, paginate. |
| `POST` | `/orders` | U | Place an order from the cart. |
| `GET` | `/orders/:id` | U | Own order, or any order for staff. |
| `DELETE` | `/orders/:id/cancel` | U | Cancel your own order before it ships. |
| `PATCH` | `/orders/:id/status` | A | { status?, note?, paymentStatus? }. |
| `POST` | `/orders/guest` | P |  |
| `GET` | `/orders/my-orders` | U | Own orders, newest first. |
| `POST` | `/orders/pos` | A | Ring up an in-store sale (paid + delivered). |

### `/coupons`

| Method | Path | Auth | Notes |
| --- | --- | --- | --- |
| `GET` | `/coupons` | A |  |
| `POST` | `/coupons` | A |  |
| `GET` | `/coupons/:id` | P | Next needs one name for sibling dynamic segments, so the old `:code` param arrives as `id` here. |
| `PATCH` | `/coupons/:id` | A |  |
| `DELETE` | `/coupons/:id` | A |  |
| `POST` | `/coupons/apply` | P | { code, subtotal } → { coupon, discount, total }. |

### `/product-discounts`

| Method | Path | Auth | Notes |
| --- | --- | --- | --- |
| `GET` | `/product-discounts` | A |  |
| `POST` | `/product-discounts` | A |  |
| `GET` | `/product-discounts/:id` | P |  |
| `PATCH` | `/product-discounts/:id` | A |  |
| `DELETE` | `/product-discounts/:id` | A |  |

### `/addresses`

| Method | Path | Auth | Notes |
| --- | --- | --- | --- |
| `GET` | `/addresses` | U | Default first, then newest |
| `POST` | `/addresses` | U |  |
| `GET` | `/addresses/:id` | U |  |
| `PATCH` | `/addresses/:id` | U |  |
| `DELETE` | `/addresses/:id` | U |  |
| `PATCH` | `/addresses/:id/set-default` | U |  |

### `/profile`

| Method | Path | Auth | Notes |
| --- | --- | --- | --- |
| `POST` | `/profile/avatar` | U | Multipart field `avatar`; stored in the database as WebP. |
| `DELETE` | `/profile/avatar` | U |  |
| `GET` | `/profile/me` | U |  |
| `PATCH` | `/profile/me` | U |  |

### `/notifications`

| Method | Path | Auth | Notes |
| --- | --- | --- | --- |
| `GET` | `/notifications` | U | The signed-in user's, newest first |
| `POST` | `/notifications` | A | The old endpoint let any signed-in customer post a notification to any other user. |
| `DELETE` | `/notifications/:id` | U |  |
| `PATCH` | `/notifications/:id/read` | U |  |
| `PATCH` | `/notifications/read-all` | U | → { count } |

## Admin & platform

### `/users`

| Method | Path | Auth | Notes |
| --- | --- | --- | --- |
| `GET` | `/users` | S |  |
| `POST` | `/users` | S |  |
| `GET` | `/users/:id` | S |  |
| `PUT` | `/users/:id` | S |  |
| `DELETE` | `/users/:id` | S | Soft delete |

### `/roles`

| Method | Path | Auth | Notes |
| --- | --- | --- | --- |
| `GET` | `/roles` | S | With permissions and (password-free) users |
| `POST` | `/roles` | S |  |
| `PATCH` | `/roles/:id` | S |  |
| `DELETE` | `/roles/:id` | S |  |
| `PATCH` | `/roles/:id/permissions` | S | Replace the role's permission set |

### `/permissions`

| Method | Path | Auth | Notes |
| --- | --- | --- | --- |
| `GET` | `/permissions` | S |  |
| `POST` | `/permissions` | S |  |

### `/dashboard`

| Method | Path | Auth | Notes |
| --- | --- | --- | --- |
| `GET` | `/dashboard/sales-trend` | A |  |
| `GET` | `/dashboard/summary` | A |  |
| `GET` | `/dashboard/top-products` | A |  |

### `/reports`

| Method | Path | Auth | Notes |
| --- | --- | --- | --- |
| `GET` | `/reports/discounts` | A | ?startDate&endDate&page&limit&format=json\|csv\|pdf |
| `GET` | `/reports/inventory` | A | ?startDate&endDate&page&limit&format=json\|csv\|pdf |
| `GET` | `/reports/overview` | A | Every report's summary (csv / pdf export too) |
| `GET` | `/reports/purchases` | A | ?startDate&endDate&page&limit&format=json\|csv\|pdf |
| `GET` | `/reports/sales` | A | ?startDate&endDate&page&limit&format=json\|csv\|pdf |
| `GET` | `/reports/users` | A | ?startDate&endDate&page&limit&format=json\|csv\|pdf |

### `/activity-logs`

| Method | Path | Auth | Notes |
| --- | --- | --- | --- |
| `GET` | `/activity-logs` | A | Newest first, with the acting user |
| `GET` | `/activity-logs/user/:userId` | A |  |

## Not yet in this index

These route groups belong to the API but had no route file when this page was generated. They are being ported from the old backend with the same paths. Regenerate this page when they land.

| Area | Group |
| --- | --- |
| Catalog | `/category` |
| Catalog | `/brands` |
| Catalog | `/attributes` |
| Catalog | `/attribute-values` |
| Catalog | `/tags` |
| Catalog | `/units` |
| Catalog | `/suppliers` |
| Catalog | `/collections` |
| Catalog | `/collection-looks` |
| Catalog | `/inventory` |
| Catalog | `/back-in-stock` |
| Catalog | `/search` |
| Commerce | `/cart` |
| Commerce | `/wishlist` |
| Commerce | `/payments` |
| Commerce | `/shipments` |
| Commerce | `/wholesale-requests` |
| Commerce | `/returns` |

## Outside `/api/v1`

| Method | Path | Auth | Notes |
| --- | --- | --- | --- |
| `POST` | `/api/contact` | P | Contact form → e-mail to `STORE_EMAIL` (Resend). |
| `POST` | `/api/resend/newsletter` | P | Newsletter sign-up → e-mail to `RESEND_TO_EMAIL`. |
