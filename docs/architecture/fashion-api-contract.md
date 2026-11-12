# Fashion API contract

All paths are under `/api/v1`. Errors use `{ statusCode, message, error, path }`.
Lists use `{ data, meta: { page, limit, total, totalPages } }`. Money is sent as
**numbers** (mappers convert `Decimal`). Image fields are **URL strings** built
with `mediaSrc()` (`/api/v1/media/<id>`). Requests that set an image take an
`…Url` from `POST /upload`, or a `…MediaId`; services resolve URLs with
`mediaIdFromUrl()`. Enum values match `prisma/schema.prisma`. Auth: **P** = public,
**U** = signed in, **A** = `admin` or `superadmin`.

Owners: **catalog**: products, variants, colours, sizes, size charts, collections,
inventory, back-in-stock, search. **content**: reviews. **commerce**: returns,
plus the cart/order changes listed at the end.

Shared pure helpers already exist. Use them instead of re-implementing:
`utils/catalog/price.ts` (`effectivePrice`, `effectiveCompareAt`, `isOnSale`,
`discountPercent`, `roundMoney`), `utils/catalog/stock.ts` (`lowStockCount`),
`utils/catalog/size-chart.ts` (`convertMeasurement`, `chartColumns`),
`utils/color.ts` (`isLightColor` for swatch borders), `utils/slug.ts`.

## Shared types

```ts
type Department = "MEN" | "WOMEN" | "KIDS" | "UNISEX";
type Fit = "SLIM" | "REGULAR" | "RELAXED" | "OVERSIZED";
type Season = "SPRING_SUMMER" | "AUTUMN_WINTER" | "ALL_SEASON";
type Occasion = "CASUAL" | "WORK" | "FORMAL" | "PARTY" | "SPORT" | "LOUNGE" | "WEDDING" | "TRAVEL";
type Pattern = "SOLID" | "STRIPED" | "CHECKED" | "PRINTED" | "FLORAL" | "GRAPHIC" | "TEXTURED" | "COLOR_BLOCK";
type SizeGroup = "ALPHA" | "NUMERIC" | "SHOE" | "ONE_SIZE";

type Image = { id: string; url: string; alt: string | null; width: number | null; height: number | null };
type ColorRef = { id: string; slug: string; name: string; hex: string };
type SizeRef = { id: string; slug: string; label: string; sizeGroup: SizeGroup; sortOrder: number };
```

## Catalog: products

### `GET /products` (P), shop listing with filters and facets

| Query | Type | Meaning |
| --- | --- | --- |
| `page`, `limit` | int | default 1 / 20, max 200 |
| `search` (alias `q`) | string | name, style code, SKU, brand, ILIKE |
| `category` | slug list | includes descendant categories (`men` → all Men) |
| `categoryId`, `brandId` | uuid | old-client aliases |
| `department` | list of `Department` | |
| `size` | size slug list | product has an **active, in-stock** variant in that size |
| `color` | colour slug list | product has an active variant in that colour |
| `brand` | brand slug list | |
| `material` | string list | ILIKE on `material` / `composition` |
| `fit`, `pattern`, `season`, `occasion` | enum lists | `occasion` uses `occasions has some` |
| `minPrice`, `maxPrice` | number | on `Product.price` |
| `inStock` | bool | at least one active variant with `stock > 0` |
| `onSale` | bool | `compareAtPrice > price` (Prisma field reference) **or** an active `ProductDiscount` |
| `new` | bool | `publishedAt` within the last 30 days (the "New arrivals" view) |
| `collection`, `tag` | slug | |
| `sort` | `newest` \| `price_asc` \| `price_desc` \| `popular` \| `rating` | `newest` = publishedAt desc; `popular` = soldCount desc |
| `facets` | bool, default `true` | include `facets` |
| `scope=admin` | A only | include `draft`/`inactive`; `includeArchived=true` also includes archived |

Every listed value is **URL-synced** on the storefront (`/shop?department=WOMEN&size=alpha-m&color=black,sage&sort=price_asc`).

```ts
type ProductCard = {
  id: string; slug: string; name: string;
  brand: { id: string; slug: string; name: string };
  category: { id: string; slug: string; name: string };
  department: Department;
  price: number; compareAtPrice: number | null; isOnSale: boolean; discountPercent: number;
  image: Image | null;          // primary image of the default colour
  hoverImage: Image | null;     // second image of the default colour
  colors: (ColorRef & { image: Image | null })[];   // swatches, in variant order
  sizes: (SizeRef & { inStock: boolean })[];
  defaultVariantId: string | null;
  inStock: boolean; lowStockCount: number | null;    // "Only 3 left"
  ratingAvg: number; ratingCount: number;
  tags: string[]; isNew: boolean; isFeatured: boolean;
};

// 200
{ data: ProductCard[]; meta; facets?: {
    departments: { value: Department; count: number }[];
    categories: { id; slug; name; count }[];
    sizes: (SizeRef & { count: number })[];      // grouped by sizeGroup on the client
    colors: (ColorRef & { family: string | null; count: number })[];
    brands: { id; slug; name; count }[];
    fits: { value: Fit; count }[]; materials: { value: string; count }[];
    price: { min: number; max: number };
} }
```

Facet counts are **disjunctive**: each facet is counted with every *other* active
filter applied but not its own. That way picking `size=M` still shows how many
products L would add. Each count is the number of distinct products.

With `scope=admin`, each row adds `status, styleCode, archivedAt, variantCount,
totalStock, lowStockVariantCount, createdAt, updatedAt`.

### `GET /products/slug/:slug` (P) · `GET /products/:id` (P; `?includeArchived=true` A)

```ts
type VariantPublic = {
  id: string; sku: string; colorId: string; sizeId: string;
  price: number; compareAtPrice: number | null;   // effective
  inStock: boolean; lowStockCount: number | null; isDefault: boolean;
};
type VariantAdmin = VariantPublic & {
  barcode: string | null; priceOverride: number | null; compareAtOverride: number | null; costPrice: number | null;
  stock: number; lowStockThreshold: number; isActive: boolean; position: number;
};

type ProductDetail = {
  id; slug; name; styleCode: string | null; shortDescription; description; status;
  brand: { id; slug; name; logoUrl: string | null };
  category: { id; slug; name }; breadcrumbs: { slug: string; name: string }[];
  department; material; composition; careInstructions; fit; season; occasions; pattern; modelInfo;
  features: string[];
  price; compareAtPrice; isOnSale; discountPercent;
  colors: (ColorRef & { images: (Image & { position: number })[] })[];  // gallery per colour
  sharedImages: (Image & { position: number })[];                       // colorId = null, shown for every colour
  sizes: SizeRef[];                                                      // sorted by sizeGroup, sortOrder
  variants: VariantPublic[];              // VariantAdmin[] for A
  defaultVariantId: string | null;
  sizeChart: SizeChart | null;            // product → category → parent category
  attributes: { attribute: string; value: string }[];
  tags: { slug; name }[]; collections: { slug; name; type }[];
  rating: { average: number; count: number; fit: FitSummary };
  delivery: { chargeInside: number; chargeNearCity: number; chargeOutside: number;
              freeShippingThreshold: number | null; returnWindowDays: number };  // from Setting
  related: ProductCard[];                 // same category, max 8, in stock first
  completeTheLook: ProductCard[];         // other products in any CollectionLook with this product
  seo: { metaTitle; metaDescription; metaKeywords };
  // legacy flat gallery for the current admin UI
  media: { id: string; mediaId: string; url: string; alt: string | null; colorId: string | null; position: number; isPrimary: boolean }[];
};
```

The storefront shows variants only when `isActive` and the product is `active`
and not archived. A size with no in-stock variant in the chosen colour renders
**disabled**. Add-to-cart needs a size, and needs a colour when there is more than one.

### Product writes (A)

- `POST /products` → 201 ProductDetail. `PATCH /products/:id` takes the same fields, all optional.
  `DELETE /products/:id` archives it (`archivedAt = now`, `status = inactive`) → `{ message }`.
- Body:
  `{ name, slug?, styleCode?, shortDescription?, description?, status?, isFeatured?, brandId, categoryId, unitId?, supplierId?, sizeChartId?, price, compareAtPrice?, costPrice?, department?, material?, composition?, careInstructions?, fit?, season?, occasions?, pattern?, modelInfo?, features?, tagIds?, attributeValueIds?, metaTitle?, metaDescription?, metaKeywords?, publishedAt? }`.
  `slug` defaults to `slugify(name)`. `publishedAt` is set when the product first becomes `active`.
- Gallery:
  - `POST /products/:id/media`: multipart `file` + `colorId?`, `alt?`, `isPrimary?`. It can also take JSON `{ url | mediaId, colorId?, alt? }`. Answers 201 with a `media[]` item.
  - `GET /products/:id/media` (P).
  - `PATCH /product-media/:id` `{ colorId?: string | null, position?, isPrimary?, alt? }`.
  - `DELETE /product-media/:id`.
  - `PATCH /products/:id/media/reorder` `{ items: { id, position }[] }`.
- The old `variants/:id/media` and `variant-media/:id` endpoints are **retired**: colour galleries replace per-variant images.

## Catalog: variants

| Method & path | Auth | Body → response |
| --- | --- | --- |
| `GET /products/:id/variants` | P | `VariantPublic[]` (A: `VariantAdmin[]` with `color`, `size`) |
| `POST /products/:id/variants` | A | `{ colorId, sizeId, sku?, barcode?, price?, compareAtPrice?, costPrice?, stock?, lowStockThreshold?, isDefault? }` → 201 VariantAdmin. Writes an `INITIAL` movement when stock > 0 |
| `GET /variants/:id` | P | VariantPublic (+ `product { id, slug, name }`, `color`, `size`) |
| `PATCH /variants/:id` | A | same fields (no `stock`; use inventory) + `isActive?` |
| `DELETE /variants/:id` | A | hard delete if it has no order, cart or movement history; otherwise sets `isActive=false` → `{ message }` |
| `POST /products/:id/variants/generate` | A | **matrix generator**, below |
| `PATCH /variants/bulk` | A | **bulk edit**, below |

**Matrix generator.** Body:
`{ colorIds: string[], sizeIds: string[], skuPattern?: string, price?: number, compareAtPrice?: number, stock?: number, lowStockThreshold?: number, dryRun?: boolean }`.

- `skuPattern` defaults to `"{style}-{color}-{size}"`. `{style}` is styleCode, or the slug in upper case. `{color}` is the first 3 letters of the colour slug, upper case. `{size}` is the size label, upper case, with spaces removed.
- Creates every missing colour × size pair. Existing pairs are skipped.
- Answers `200 { created: VariantAdmin[], skipped: { colorId, sizeId, reason: "exists" | "sku_taken" }[] }` (201 when anything was created). With `dryRun`, it answers the planned `{ sku, colorId, sizeId }[]` and writes nothing.
- An empty colour or size list gives 400 `ERROR_MESSAGES.variant.matrixEmpty`.

**Bulk edit.** Body:
`{ items: { id, price?: number | null, compareAtPrice?: number | null, stock?: number, lowStockThreshold?: number, isActive?: boolean }[], reason?: string }`.

- `stock` is the new **absolute** level. The difference is written as an `ADJUSTMENT` movement. Everything runs in one transaction.
- Answers `{ updated: number }`.

## Catalog: colours and sizes (master data)

| Path | Auth | Notes |
| --- | --- | --- |
| `GET /colors` | P | `?active=true` · `(ColorRef & { family, sortOrder, isActive, variantCount })[]` sorted by `sortOrder` |
| `POST /colors`, `PATCH /colors/:id` | A | `{ name, slug?, hex: "#RRGGBB", family?, sortOrder?, isActive? }` |
| `DELETE /colors/:id` | A | 409 `ERROR_MESSAGES.color.inUse` while variants use it |
| `GET /sizes` | P | `?group=ALPHA&active=true` · `(SizeRef & { isActive, variantCount })[]` |
| `POST /sizes`, `PATCH /sizes/:id` | A | `{ label, slug?, sizeGroup, sortOrder?, isActive? }`. The pair `(sizeGroup, label)` is unique |
| `PATCH /sizes/reorder` | A | `{ items: { id, sortOrder }[] }` |
| `DELETE /sizes/:id` | A | 409 `ERROR_MESSAGES.size.inUse` while variants or charts use it |

## Catalog: size charts

```ts
type SizeChart = {
  id; name; slug; description: string | null; howToMeasure: string | null; department: Department | null; isActive: boolean;
  columns: string[];                                   // ["Chest", "Length", "Sleeve"]
  rows: { sizeId: string; sizeLabel: string; position: number; values: Record<string, number> }[];  // cm
  categories?: { id; name; slug }[];                   // A only
};
```

- `GET /size-charts` (A) lists all. `GET /size-charts/:id` (P).
- `GET /products/:id/size-chart` (P) returns the resolved chart, or `null`.
- `POST /size-charts` and `PATCH /size-charts/:id` (A) take:
  `{ name, slug?, description?, howToMeasure?, department?, isActive?, rows: { sizeId, measurements: { label, valueCm }[] }[], categoryIds?: string[] }`.
  `rows` **replaces** all rows and measurements in one transaction. `categoryIds` sets `Category.sizeChartId`.
  A product override uses `Product.sizeChartId`.
- `DELETE /size-charts/:id` (A) unlinks categories and products (SetNull).
- The UI toggles cm and inches with `convertMeasurement`.

## Catalog: collections and lookbooks

```ts
type CollectionSummary = { id; slug; name; type: "COLLECTION" | "LOOKBOOK"; description; coverImageUrl: string | null;
                           isFeatured; position; startsAt; endsAt; productCount: number };
type Look = { id; title; description; position; imageUrl: string | null; products: ProductCard[] };
type CollectionDetail = CollectionSummary & { products: ProductCard[]; looks: Look[]; metaTitle; metaDescription };
```

| Path | Auth | Notes |
| --- | --- | --- |
| `GET /collections` | P | `?type=&featured=true`. Public results are active and inside their `startsAt`–`endsAt` window. A sees all with `?scope=admin` |
| `GET /collections/slug/:slug` | P | CollectionDetail. Products are ordered by `position` and paginated with `?page&limit` like `/products` (facets optional) |
| `GET /collections/:id` | A | CollectionDetail with `productIds` |
| `POST /collections`, `PATCH /collections/:id` | A | `{ name, slug?, type?, description?, isActive?, isFeatured?, position?, startsAt?, endsAt?, coverImageUrl? \| coverMediaId?, productIds?: string[] (ordered, replaces), metaTitle?, metaDescription? }` |
| `DELETE /collections/:id` | A | cascades membership and looks |
| `POST /collections/:id/looks` | A | `{ title?, description?, imageUrl? \| mediaId?, productIds: string[], position? }` → 201 Look |
| `PATCH /collection-looks/:id`, `DELETE /collection-looks/:id` | A | same fields |

"New arrivals" and "Sale" are **virtual** views of `GET /products` (`?new=true&sort=newest`, `?onSale=true`), not collection rows.

## Catalog: inventory (A)

- `GET /inventory`: `?page&limit&search&productId&lowStock=true&outOfStock=true`. Each row:
  `{ id, sku, barcode, stock, lowStockThreshold, isLowStock, isActive, price, product: { id, name, slug, status }, color: ColorRef, size: SizeRef }`.
- `GET /inventory/variant/:variantId` returns that row plus its last 20 movements.
- `POST /inventory/adjust` takes `{ variantId, change?: number, setTo?: number, type?: "RESTOCK" | "ADJUSTMENT" | "CORRECTION", reason?: string }`. Send exactly one of `change` or `setTo`. Answers 201 `{ variant, movement }`. Stock may never go below 0 (`ERROR_MESSAGES.inventory.negativeStock`).
  If stock goes from 0 to above 0, it triggers the back-in-stock notify for that variant.
- `GET /inventory/logs` (alias `/inventory/movements`): `?variantId&productId&type&from&to&page&limit`. Each movement:
  `{ id, type, quantity, stockAfter, reason, createdAt, variant: { id, sku, product: { id, name } , color, size }, order: { id, orderNumber } | null, returnRequest: { id, requestNumber } | null, createdBy: { id, name } | null }`.
- `GET /inventory/low-stock`: `?limit=20` → variants where `0 < stock <= lowStockThreshold`, plus `outOfStock` counts. This feeds the **dashboard alert card**.

Every stock change in any module goes through one inventory helper,
`lib/server/catalog/inventory/stock.ts` → `moveStock(tx, { variantId, quantity, type, reason?, orderId?, returnRequestId?, userId? })`.
The helper updates `stock` and writes the movement row inside the caller's transaction.
**Catalog exports it; commerce calls it** for SALE, CANCELLATION, RETURN and EXCHANGE.

## Catalog: back-in-stock

- `POST /back-in-stock` (P; the user is optional) takes `{ variantId, email }`. It is idempotent per `(variantId, email)` and answers 201 `{ id, status }`. When the variant is in stock it answers 400 `ERROR_MESSAGES.backInStock.alreadyInStock`.
- `GET /back-in-stock` (A): `?status=PENDING&productId&variantId&page&limit`. Each row:
  `{ id, email, status, createdAt, notifiedAt, user: { id, name } | null, variant: { id, sku, stock, color: ColorRef, size: SizeRef, product: { id, name, slug } } }`.
- `GET /back-in-stock/summary` (A) → `{ variantId, sku, productName, colorName, sizeLabel, stock, pending: number }[]`, most-requested first.
- `POST /back-in-stock/notify` (A) takes `{ variantId }`. It emails every `PENDING` request when stock > 0 and marks them `NOTIFIED`. Answers `{ notified: number }`. The inventory helper runs the same logic automatically.
- `DELETE /back-in-stock/:id` (A).

## Content: reviews with fit feedback and photos

```ts
type FitFeedback = "RUNS_SMALL" | "TRUE_TO_SIZE" | "RUNS_LARGE";
type FitSummary = { RUNS_SMALL: number; TRUE_TO_SIZE: number; RUNS_LARGE: number; total: number; verdict: FitFeedback | null };
type Review = {
  id; rating: 1|2|3|4|5; title: string | null; comment: string | null; fitFeedback: FitFeedback | null;
  status: "PENDING" | "APPROVED" | "REJECTED"; isApproved: boolean;    // isApproved kept for the current admin UI
  isVerifiedPurchase: boolean; createdAt;
  user: { id; name; avatar: string | null };
  variant: { color: string; size: string } | null;                       // "Wears M"
  photos: Image[];
  product?: { id; name; slug };                                          // admin lists
};
```

- `GET /products/:id/reviews` (P): `?page&limit&sort=newest|rating_desc|rating_asc&rating=1..5&withPhotos=true`. Only APPROVED reviews. Answers `{ data: Review[], meta, summary: { average, count, distribution: Record<1|2|3|4|5, number>, fit: FitSummary } }`.
- `POST /products/:id/reviews` (U): **multipart** with fields `rating`, `title?`, `comment?`, `fitFeedback?`, `variantId?` and `photos` (up to 5 files, 5 MB each, saved with `saveImage`). JSON without photos is also accepted.
  - 409 `ERROR_MESSAGES.review.alreadyReviewed` if the user already reviewed this product.
  - `isVerifiedPurchase` is true when the user has a delivered order item for the product.
  - New reviews are `APPROVED` (the old default).
  - Updates `Product.ratingAvg` and `ratingCount` in the same transaction (approved reviews only).
- `PATCH /reviews/:id` (owner: rating, title, comment, fitFeedback; A: also `status` or `isApproved`). `DELETE /reviews/:id` (owner or A). Both recompute the aggregates.
- Admin: `GET /reviews` (A) `?status&productId&rating&search&page&limit`, `GET /reviews/pending`, `POST /reviews` (A, on behalf of a user; old endpoint).

## Commerce: returns and exchanges

```ts
type ReturnStatus = "REQUESTED" | "APPROVED" | "REJECTED" | "REFUNDED" | "EXCHANGED" | "CANCELLED";
type ReturnReason = "TOO_SMALL" | "TOO_LARGE" | "NOT_AS_DESCRIBED" | "DAMAGED" | "WRONG_ITEM" | "QUALITY" | "CHANGED_MIND" | "OTHER";
type ReturnRequest = {
  id; requestNumber: string;  // "RET-2026-4F7K2Q"
  status: ReturnStatus; resolution: "REFUND" | "EXCHANGE";
  customerNote; adminNote; refundAmount: number | null; createdAt; approvedAt; resolvedAt;
  order: { id; orderNumber; placedAt };
  user: { id; name; email } | null;
  items: { id; quantity; reason: ReturnReason; note; restocked: boolean;
           orderItem: { id; productName; sku; colorName; sizeLabel; unitPrice: number; quantity: number; image: string | null };
           exchangeVariant: { id; sku; color: ColorRef; size: SizeRef } | null }[];
};
```

Customer endpoints (U):

- `GET /orders/:id/returnable` → `{ eligible: boolean, reason?: string, deadline: string | null, items: { orderItemId, productName, sku, colorName, sizeLabel, quantity, returnableQuantity, image }[] }`.
- `POST /returns` takes `{ orderId, resolution, customerNote?, items: { orderItemId, quantity, reason, note?, exchangeVariantId? }[] }` and answers 201. The rules:
  - The order must belong to the user and be `delivered`.
  - The request must fall within `Setting.returnWindowDays` of delivery. Delivery time comes from `Shipment.deliveredAt`, or else the `delivered` status log.
  - `quantity` may not exceed ordered minus already requested (requests that are not rejected or cancelled count).
  - `EXCHANGE` needs `exchangeVariantId`, which must be an active variant of the same product.
  - Errors come from `ERROR_MESSAGES.returns.*`.
- `GET /returns/my` lists the user's own requests, paginated. `GET /returns/:id` is for the owner or A. `POST /returns/:id/cancel` is for the owner, only while `REQUESTED`.

Admin endpoints (A):

- `GET /returns`: `?status&search(orderNumber|requestNumber|email)&from&to&page&limit`.
- `PATCH /returns/:id/status` takes `{ status, adminNote?, refundAmount?, restock?: boolean (default true) }`.
  The allowed transitions are:
  - `REQUESTED → APPROVED | REJECTED | CANCELLED`
  - `APPROVED → REFUNDED` when the resolution is REFUND
  - `APPROVED → EXCHANGED` when the resolution is EXCHANGE

  Side effects, each in one transaction:
  - **APPROVED + restock**: `moveStock(+qty, RETURN)` for each item; set `restocked = true`.
  - **EXCHANGED**: `moveStock(-qty, EXCHANGE)` on the exchange variant (400 when stock is short).
  - **REFUNDED**: `refundAmount` defaults to Σ unitPrice × qty. Records a `Payment` with status `refunded` and sets `Order.paymentStatus` to `refunded` or `partially_refunded`.
  - When every unit of the order has been returned, `Order.status` becomes `returned`.
  - Sends a notification to the customer (type `RETURN`).
- The dashboard shows the open-return count (`status = REQUESTED`).

## Commerce: cart, wishlist and orders (fashion deltas)

- The cart stays **by variant**. Cart lines answer `variant: { id, sku, price, compareAtPrice, inStock, lowStockCount, color: ColorRef, size: SizeRef, product: { id, slug, name, image } }`.
- An order line writes the **snapshot**: `productName`, `productSlug`, `sku`, `colorName`, `colorHex`, `sizeLabel`, `unitPrice`, `listPrice`, `discountAmount`, `totalPrice`, and `imageMediaId` (the variant colour's primary image).
- Placing an order runs `moveStock(-qty, SALE, orderId)`. Cancelling runs `moveStock(+qty, CANCELLATION)`. Both increment or decrement `Product.soldCount`.
- The shipping address is written to `OrderAddress` (1:1). Responses still answer `shippingAddress: { email, fullName, phone, addressLine1, addressLine2, city, state, postalCode, country }`.
- A coupon sets `Order.couponId` and `couponCode`, and increments `usedCount`. It honours `isActive`, `startsAt`, `expiresAt`, `maxUsage` (null means unlimited) and `minOrderAmount`.
- The wishlist stays by product. **Compare** and **recently viewed** are client-only Redux slices persisted to localStorage, with no API.
