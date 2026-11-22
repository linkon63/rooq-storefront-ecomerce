# Vercel Deployment Observations: Broken Images & Slow Load Times

> **Status (2026-11-21):** done — custom `next/image` loader (`utils/image-loader.ts`)
> resizes via `/api/v1/media/:id?w=` instead of `/_next/image`; `hoverImage` loads on
> first hover; admin fallback is `/images/no-image.svg`; the app runs on Supabase's
> transaction pooler. Still open: #2, #4, #5 and the long-term blob move.

This document summarizes why some images intermittently fail to load and why page loads on Vercel can be slow, ordered as a step-by-step checklist so each issue can be fixed one by one.

---

## Summary of the Architecture

- **Framework:** Next.js `16.3.0` (App Router), React `19.2.4`, Prisma `7.10.1` (`@prisma/adapter-pg`), PostgreSQL.
- **Image storage & serving:** Uploaded images are processed with `sharp` in `lib/server/media/process-image.ts` (converted to WebP, max edge `1600px`, target `<= 250KB`), stored in PostgreSQL (`media` + `media_blobs`), and served via `GET /api/v1/media/[id]` (`app/api/v1/media/[id]/route.ts`).
- **Database pool:** `lib/server/prisma-client.ts` creates a `pg.Pool` with `max: Number(process.env.DATABASE_POOL_MAX ?? 3)`, `idleTimeoutMillis: 10_000`, `connectionTimeoutMillis: 10_000`, and `withConnectRetry` (up to 4 attempts).

---

## Part 1: Why Some Images Show as Broken

### 1. `/_next/image` → `/api/v1/media/[id]` → PostgreSQL Connection Exhaustion (Primary Cause)
- **What happens:**
  - Storefront components (e.g. `components/storefront/product-card/product-card.tsx`, hero slider, category tiles, collection highlights, reviews) use `next/image` (`<Image src="/api/v1/media/<id>" ... />`) **without `unoptimized`**.
  - `ProductCard` mounts **both** `product.image` and `product.hoverImage` in the DOM immediately, doubling the number of image requests per card.
  - On a single page load (e.g., Home), the browser sends **30–50+ concurrent requests** to `/_next/image`.
  - For any image/size not yet cached by Vercel's Image Optimization CDN, Vercel fetches `/api/v1/media/[id]`.
  - Under a burst of 30–50+ requests, Vercel spins up multiple concurrent Serverless Function instances. Each instance opens its own `pg.Pool` (`max: 3` connections).
  - Combined with SSR page queries, this can exceed the hosted Postgres `max_connections` limit (`P2037`) or time out during `withConnectRetry` (4 retries × up to `10s` `connectionTimeoutMillis`).
  - When `/api/v1/media/[id]` fails or times out, `/_next/image` returns an error (`500`/`502`), rendering a **broken image**. Images that happen to get a connection—or are already cached in `lib/server/media/memory-cache.ts` or Vercel's CDN—load normally.
- **How to fix (1 by 1):**
  - [x] **Bypass Next.js Image Optimization for already-optimized DB media:** Since `processImage()` already converts uploads to WebP under `250KB`, set `images: { unoptimized: true }` in `next.config.ts` (or pass `unoptimized` to `<Image>` for `/api/v1/media/...`). This removes the `/_next/image` proxy hop and lets Vercel's Edge CDN cache `/api/v1/media/[id]` directly via `MEDIA_CACHE_CONTROL` (`public, max-age=31536000, s-maxage=31536000, immutable`).
  - [x] **Avoid eager-loading `hoverImage` on `ProductCard`:** In `components/storefront/product-card/product-card.tsx`, only render/load `product.hoverImage` on hover/focus instead of mounting it on initial page load.
  - [ ] **(Long-term) Move `media_blobs` out of PostgreSQL:** Store binary image blobs in object storage (e.g., Vercel Blob, Cloudflare R2, or S3) so image traffic never touches database connections.

### 2. `EXTERNAL` Media Redirects in `/api/v1/media/[id]`
- **What happens:**
  - `app/api/v1/media/[id]/route.ts` returns `NextResponse.redirect(media.externalUrl, 302)` when `media.provider === "EXTERNAL"`.
  - `next.config.ts` only whitelists `images.unsplash.com` and `lh3.googleusercontent.com` in `images.remotePatterns`.
  - Next.js Image Optimization (`/_next/image`) does not reliably follow `302` redirects to external hosts.
- **How to fix:**
  - [ ] Use `mediaSrc()` (`utils/media-url.ts`) directly where appropriate, or set `unoptimized` on `<Image>` for external URLs (as already done in `app/admin/(panel)/dashboard/_components/top-products-card.tsx`), or proxy/whitelist the external domains.

### 3. Missing Static Fallback Image in Admin
- **What happens:**
  - `app/admin/_components/admin-ui.tsx` and `app/admin/(panel)/discounts/discount-product-picker.tsx` fall back to `/images/no-image-icon-6.png`, which does not exist in `public/images/`.
- **How to fix:**
  - [x] Add `public/images/no-image-icon-6.png` or replace the fallback with an existing asset / inline placeholder.

---

## Part 2: Why Vercel Load Times Are Sometimes Long

### 4. `StoreLayout` Calls `cookies()`, Forcing Every Storefront Page to Be Dynamic (SSR)
- **What happens:**
  - `app/(store)/layout.tsx` calls `getMessages()`, which calls `cookies()` in `lib/i18n/server.ts`.
  - Because `StoreLayout` wraps every route under `app/(store)/` (`/`, `/shop`, `/product/[slug]`, `/new`, `/sale`, `/collections`, etc.), Next.js treats **all storefront pages as dynamic**.
  - None of the storefront HTML can be served statically or via ISR from Vercel's Edge CDN; every visit hits a Serverless Function (and pays cold-start latency when idle).
- **How to fix:**
  - [ ] Stop calling `cookies()` in the shared `StoreLayout` for default-locale traffic (e.g., handle locale via URL/middleware rewrite or client-side switching) so public storefront pages can be cached at the edge with ISR (`revalidate`).

### 5. Heavy Parallel DB Fan-Out on Cache Miss + `RoutePrefetch`
- **What happens:**
  - Public catalog reads in `lib/storefront/catalog-data.ts` use `unstable_cache` (`CATALOG_REVALIDATE_SECONDS = 60` in `lib/constants/storefront.ts`) and are invalidated on any admin catalog write (`route()` in `lib/server/http.ts`).
  - On a cache miss or cold instance, `app/(store)/(home)/page.tsx` (`Promise.all` of 10 calls), `app/(store)/layout.tsx` (3 calls), and 4 `<Suspense>` sections (`SaleCountdown`, `FeaturedCollections`, `ProductHighlights`, `MadeByHand`) fire ~15+ parallel queries through a `max: 3` connection pool.
  - Meanwhile, `components/storefront/shell/route-prefetch.tsx` prefetches `/shop`, `/new`, and `/sale` on idle from every page. Because those pages are also dynamic (due to `cookies()`), each prefetch triggers additional SSR + DB work.
- **How to fix:**
  - [ ] Fixing #4 (enabling ISR/edge caching) will dramatically reduce how often `RoutePrefetch` and page visits hit SSR/DB.
  - [ ] Consider increasing `CATALOG_REVALIDATE_SECONDS` if 60s is shorter than needed, since admin writes already call `revalidateTag(CATALOG_CACHE_TAG, "max")`.

### 6. Direct TCP Postgres Connection in Serverless
- **What happens:**
  - `docs/environment-variables.md` documents using a direct TCP `DATABASE_URL` (`:5432`).
  - In serverless environments (Vercel), direct TCP connections incur full TCP + TLS handshake overhead on cold starts and hit Postgres connection limits much faster than a pooled endpoint.
- **How to fix:**
  - [x] Use a pooled connection string (e.g., PgBouncer / Prisma Accelerate / Neon or Supabase transaction pooler) for `DATABASE_URL` in Vercel's environment variables, while keeping a direct URL only for migrations if needed.

---

## Suggested Order to Fix (1 by 1)

1. **Quickest impact on broken images:** Set `unoptimized: true` in `next.config.ts` (or on `/api/v1/media/...` `<Image>` usages) + lazy-load `hoverImage` in `ProductCard`.
2. **Quickest impact on DB stability:** Switch Vercel's `DATABASE_URL` to a pooled connection string.
3. **Biggest impact on page load speed:** Remove `cookies()` from `app/(store)/layout.tsx` / `lib/i18n/server.ts` so storefront pages can be statically/ISR cached at the edge.
4. **Cleanup:** Fix `EXTERNAL` media handling / missing `/images/no-image-icon-6.png`.
5. **Long-term architecture:** Migrate `media_blobs` from PostgreSQL to object storage (Vercel Blob / R2 / S3).

