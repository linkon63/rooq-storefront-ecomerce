# Porting guide — NestJS module → Next.js route handlers

Rooq is one Next.js 16 app: storefront, admin and API. The NestJS backend is
gone; every `/api/v1/...` path it served is now a route handler here, with the
same path, body and JSON response. The **auth module is the worked example** —
copy its shape.

## Folder layout

```
app/api/v1/<module>/**/route.ts     thin: parse → call service → return
lib/server/<module>/service.ts      business logic + Prisma (server-only)
lib/server/<module>/schemas.ts      zod request schemas (+ inferred input types)
lib/server/<module>/queries.ts      reusable reads / Prisma selects (optional)
utils/mappers/<module>.ts           pure row → response mappers (no I/O)
utils/<topic>.ts                    other pure helpers (pricing, slug, size, colour …)
lib/constants/error-messages.ts     ERROR_MESSAGES — every error string
lib/constants/*.ts                  other constants (auth, media, pagination, store)
lib/store/                          Redux Toolkit (client state only)
```

Rules (mandatory):

- **TypeScript strict, no `any`.** `pnpm typecheck` must stay at zero errors.
- **One component per file, ~200 lines max.** Split otherwise.
- **Pure functions → `utils/`.** Anything doing I/O (Prisma, fetch, sharp,
  mail, cookies) → `lib/`.
- **No inline error strings.** Add a key to `ERROR_MESSAGES` (grouped by domain;
  parametrised messages are small functions) and reference it — in services and in
  UI toasts alike. Most messages from the old backend are already there.
- **Never import `lib/server/**` from a client component.** Every file there
  starts with `import "server-only"`.
- Avoid barrel files (`index.ts` re-exports); import the file you need.

## Next 16 essentials

- `params` is a **Promise**. `route()` awaits it for you, so handlers receive
  plain params: `route<{ id: string }>(async (req, { params }) => params.id)`.
- Sibling dynamic segments must use **the same name**. The old backend had
  `products/:id` and `products/:productId/media`. In Next both must be `[id]`:
  `app/api/v1/products/[id]/route.ts` + `app/api/v1/products/[id]/media/route.ts`.
  The same applies to `attributes/[id]/values` and `variants/[id]/media`.
- Static segments win over dynamic ones: `news/manage`, `news/slug/[slug]`,
  `category/reorder` and `campaigns/sections` can sit next to `[id]`.
- Route handlers are not cached. Do not add `export const dynamic`.
- `proxy.ts` replaces middleware (it only guards `/admin/*` pages, not the API).
- Read `node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/route.md` before writing routes.

## The handler wrapper — `lib/server/http.ts`

```ts
import { route, created, ok, noContent, paginated } from "@/lib/server/http";
```

`route(handler)`:

- awaits `params`;
- serialises a plain return value as `200` JSON (return a `Response` to choose the status);
- maps thrown errors to the old Nest body `{ statusCode, message, error, path }`:
  - `HttpError` (from `lib/server/http-error.ts`) → its status and message;
  - `ZodError` → `400` with `message: string[]`;
  - Prisma `P2002` → `409` "Another category already uses that slug…", `P2003` → `409`
    (blocked delete / missing link), `P2025` → `404`, validation → `400`, cannot reach the DB → `503`
    (a straight port of `AllExceptionsFilter`, with the wording in `ERROR_MESSAGES.database`);
  - anything else → `500` with a `reference` code, logged with the stack.

Status codes: **Nest answered every POST with 201** (no `@HttpCode` was used), so
POST handlers return `created(...)`. GET/PATCH/DELETE return plain data (200).

Throw errors with the factories:

```ts
import { badRequest, notFound, conflict, forbidden } from "@/lib/server/http-error";
throw notFound(ERROR_MESSAGES.product.notFound(id));
```

## Validation — `lib/server/validation.ts`

```ts
const body = await parseBody(request, createThingSchema); // JSON body
const query = parseQuery(request, listThingsQuery);        // ?page=&limit=&size=M&size=L
const { id } = parseParams(params, idParam);               // uuid check → 400
```

- Body schemas use **`z.strictObject`**. Unknown keys answer
  `"property foo should not exist"`, the same as `whitelist + forbidNonWhitelisted`.
- Query values arrive as strings: use `z.coerce.number()`, `queryBoolean`, and
  `queryList` (accepts `?size=M&size=L` and `?size=M,L`).
- Spread `paginationQuery` into list schemas.
- Multipart: `readFormData(request)` and `assertImageFile(form.get("file"))` (`lib/server/media/upload.ts`).

## Auth — `lib/server/auth/*`

Old semantics: a global JWT guard (every route needs a token unless `@Public()`),
plus `@Roles(...)`, where `superadmin` always passes. In Next, **route handlers are
public by default**, so **wrap every route that was not `@Public()`**:

```ts
import { withAuth } from "@/lib/server/auth/guard";
import { ROLES } from "@/lib/constants/auth";

export const GET = route(withAuth((req, { user }) => service.mine(user.id)));                 // signed in
export const POST = route(withAuth(handler, { roles: [ROLES.admin, ROLES.superadmin] }));      // @Roles('admin','superadmin')
export const GET = route(withAuth((req, { user }) => service.list(user?.id), { public: true })); // @Public, user may be null
```

- Token: `Authorization: Bearer` first, then the httpOnly `access_token` cookie.
  The admin UI sends `admin_access_token` as a Bearer token. The storefront sends
  `customer_access_token` the same way.
- `user` = `CurrentUser` `{ id, name, email, phone, role: { id, name, permissions[] } | null, createdAt, updatedAt }`.
  Disabled or soft-deleted users are rejected.
- Imperative helpers: `requireAuth(request)`, `requireRoles(request, ...roles)`, `assertRoles(user, roles)`.
- Role names: `ROLES.superadmin` = "superadmin", `ROLES.admin` = "admin", `ROLES.customer` = "user".
  `@Roles('admin')` in the old code = `{ roles: [ROLES.admin] }`, and superadmin passes too.
- Password hashing and tokens: `lib/server/auth/password.ts`. JWT: `lib/server/auth/jwt.ts` (jose, HS256).

### Worked example (the real files)

`app/api/v1/auth/me/route.ts`:

```ts
export const GET = route(withAuth((_request, { user }) => auth.me(user.id)));
export const PATCH = route(
  withAuth(async (request, { user }) => auth.updateMe(user.id, await parseBody(request, updateMeSchema))),
);
```

`lib/server/auth/service.ts` holds the logic and throws `HttpError`s with
`ERROR_MESSAGES.auth.*`. `lib/server/auth/schemas.ts` holds the zod schemas. The user
response comes from `toUserResponse()` in `utils/mappers/user.ts`, fed by
`userSelect` (`lib/server/users/select.ts`).

## Media — images are bytes in Postgres

- `Media` (metadata) plus `MediaBlob` (bytes, 1:1). **Never select `blob`.** Use
  `mediaRefSelect` from `lib/server/media/select.ts` for every image relation:
  `include: { imageMedia: { select: mediaRefSelect } }`.
- Build the URL with `mediaSrc(media)` (DATABASE → `/api/v1/media/<id>`, EXTERNAL →
  its URL) or `mediaUrl(id)` from `utils/media-url.ts`. **The API keeps answering with
  the old string fields** (`imageUrl`, `logoUrl`, `coverImageUrl`, `avatar`, `url`), built by mappers.
- Accepting an image: `const file = assertImageFile(form.get("file"))`, then
  `const saved = await saveImage(await fileToBuffer(file), { alt, uploadedById: user.id })`.
  This gives WebP, a 1600 px long edge, quality 80, and sha256 dedupe. Then store
  `saved.id` in the FK column (`imageMediaId`, `logoMediaId`, …).
- When the client sends an image **URL** (from `POST /upload`), convert it back
  with `mediaIdFromUrl(url)` and store the id.
- Limits: 5 MB, jpeg/png/webp/avif/gif (`lib/constants/media.ts`). Videos and
  Google avatars use `saveExternalMedia(url)`.
- Serving: `GET /api/v1/media/[id]` (ETag, immutable cache, 304). `next/image`
  accepts these paths (`images.localPatterns`).
- Deleting a gallery link deletes only the join row. Free the image with
  `releaseMedia(ids, tx?)` (`lib/server/media/release.ts`): it counts references across all 14
  relations and deletes only orphans. Never rely on `P2003` — most FKs to `media` are SET NULL / CASCADE.

## Server components: call services, not HTTP

Pages and layouts are server components. They should **import the service and
call it directly**, not `fetch('/api/v1/...')`. That saves a network hop and needs
no absolute URL.

```tsx
// app/(store)/product/[slug]/page.tsx
import { getProductDetail } from "@/lib/server/catalog/products/service";
export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await getProductDetail(slug);
  …
}
```

- The signed-in shopper: `getSessionUser()`. Staff under `/admin`: `getAdminSessionUser()`.
  Both come from `lib/server/auth/current-user.ts` and are cached per request with `React.cache`.
- Pass the smallest serialisable props to client components. Convert `Decimal` with `Number(...)`
  in the mapper, never on the client.
- Storefront loaders live in `lib/storefront/catalog-data.ts`: they call the services in-process,
  round-trip the result through JSON (`utils/json.ts`) so pages get the documented response shapes,
  and cache public reads with `cachedRead()` (60 s, tag `storefront-catalog`). Any successful
  write under a catalogue path (`CATALOG_WRITE_PREFIXES`) revalidates that tag from `route()`.
- Client components use the browser clients: `lib/admin/http.ts` + `lib/admin-api/*.ts` (admin),
  `lib/storefront-api.ts`, `lib/shop-api.ts`, `lib/cart-api.ts` (storefront). Both share the
  `sendRequest()` transport in `lib/api.ts`, so errors are parsed the same way everywhere.

## Pagination contract

Lists answer `{ data: T[], meta: { page, limit, total, totalPages } }`:

```ts
const { page, limit, skip, take } = pageWindow(query.page, query.limit); // utils/pagination.ts
const [rows, total] = await prisma.$transaction([prisma.x.findMany({ skip, take, … }), prisma.x.count({ where })]);
return paginated(rows.map(toX), { page, limit, total });
```

The default `limit` is 20 and the maximum is 200 (`lib/constants/pagination.ts`).

## Prisma

- Import the client with `import { prisma } from "@/lib/server/prisma"`. Generated types
  come from `@/lib/generated/prisma/client` (models, the `Prisma` namespace) and
  `@/lib/generated/prisma/enums`.
- Money is `Decimal(12,2)`. Do the arithmetic in pure utils on numbers rounded to
  2 dp, or with `Prisma.Decimal`. Serialise Decimals as numbers in mappers.
- Multi-row writes (stock, orders, returns) go in `prisma.$transaction(async (tx) => …)`.
  Every stock change writes a `StockMovement` with `stockAfter`.
- Soft delete: products use `archivedAt`, variants `isActive=false`, users `deletedAt`.
  Do not hard-delete rows that order history points at.
- Schema changes go to the integrator. Do not run `migrate`/`db push` yourself.

## Scripts that touch the DB

Server modules import `server-only`. Run scripts with the react-server condition:

```bash
pnpm exec tsx --conditions=react-server scripts/<file>.ts
```

`scripts/smoke-foundation.ts` is an example that exercises routes in-process via `NextRequest`.

## Module ownership (old controller → owner)

| Old module(s) | Paths | Owner |
| --- | --- | --- |
| auth, upload, media | `/auth/*`, `/upload`, `/media/:id` | foundation (done) |
| product, category, brands, attribute, tags, unit, supplier, inventory, search + **colors, sizes, size-charts, collections, back-in-stock** | `/products…`, `/variants…`, `/product-media…`, `/category…`, `/brands…`, `/attributes…`, `/attribute-values…`, `/tags…`, `/units…`, `/suppliers…`, `/inventory…`, `/search…`, `/colors…`, `/sizes…`, `/size-charts…`, `/collections…`, `/back-in-stock…` | catalog |
| review, news, sections, campaign, policies, settings | `/reviews…`, `/products/:id/reviews`, `/news…`, `/sections…`, `/campaigns…`, `/policies`, `/settings` | content |
| cart, wishlist, order, payment, shipment, coupon, product-discount, wholesale, address, profile, notification, **returns** | `/cart…`, `/wishlist…`, `/orders…`, `/payments…`, `/shipments…`, `/coupons…`, `/product-discounts…`, `/wholesale-requests…`, `/addresses…`, `/profile…`, `/notifications…`, `/returns…` | commerce |
| user, role, dashboard, report, activity-log | `/users…`, `/roles…`, `/permissions`, `/dashboard…`, `/reports…`, `/activity-logs…` | admin/platform |

The request and response shapes for the fashion endpoints are in
[`fashion-api-contract.md`](fashion-api-contract.md).
