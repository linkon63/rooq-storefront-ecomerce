# Deployment (Vercel + Prisma Postgres)

Rooq is a single Next.js 16 app: the storefront, `/admin` and `/api/v1`. It
deploys as one Vercel project. The only external dependency is a Postgres
database (Prisma Postgres recommended). Images live in that database, so there
is no object storage to configure.

## 1. Database

1. Create a **Prisma Postgres** database (console.prisma.io, or Vercel →
   Storage → Prisma Postgres), in the region closest to your Vercel functions.
2. Copy its **direct TCP connection string** (`postgres://…@db.prisma.io:5432/postgres?sslmode=require`).
   Rooq connects through the `pg` driver adapter (`@prisma/adapter-pg`), so the
   standard Postgres URL is what it needs. An Accelerate `prisma+postgres://` URL is not used.
3. Create a second database for Preview deployments. Previews must never write to production.

## 2. Vercel project

| Setting | Value |
| --- | --- |
| Framework preset | Next.js |
| Root directory | the repository root (this app) |
| Install command | `pnpm install` (runs `prisma generate` via `postinstall`) |
| Build command | `pnpm build` (= `prisma generate && next build`) |
| Output | default (`.next`) |
| Node.js version | 20.x or newer (24 recommended) |
| Function region | same region as the database |

Set the environment variables from [environment-variables.md](environment-variables.md)
for **Production** and **Preview** separately. At minimum set `DATABASE_URL`,
`JWT_SECRET`, `NEXT_PUBLIC_APP_URL` and
`NEXT_PUBLIC_SITE_URL`. `NEXT_PUBLIC_*` values are baked in at build time, so
redeploy after changing them.

The generated Prisma client (`lib/generated/prisma`) is git-ignored and is
rebuilt on every install/build, so a schema change only needs a new migration.
There is no generated code to commit.

## 3. Migrations

Migrations live in `prisma/migrations` and are applied with
`prisma migrate deploy`, which only runs migrations that are not applied yet and never resets data:

```bash
DATABASE_URL="<production url>" pnpm db:migrate:deploy
```

Recommended: run it as a **release step** before (or right after) promoting a
deployment, from CI or your machine. If you prefer it automatic, override the
Production build command with `pnpm db:migrate:deploy && pnpm build`. Keep
the Preview build command as `pnpm build`, so a preview branch can never
migrate production.

If Prisma's schema engine cannot reach the database from your network (error
`P1001`), `pnpm db:migrate:pg` applies the same pending migrations through the
`pg` driver and records them in `_prisma_migrations` exactly like `migrate deploy`.

Never run `prisma migrate dev` or `prisma db push` against production.

## 4. Seed (first deploy only)

```bash
DATABASE_URL="<production url>" SEED_ADMIN_EMAIL="you@your-domain" SEED_ADMIN_PASSWORD="<strong password>" pnpm db:seed
```

The seed is idempotent. It creates the roles (`superadmin`, `admin`, `user`),
the staff account, the size and colour masters, the category tree and a demo
fashion catalogue. Sign in at `/admin/login` and change the password straight
away. Skip or prune the demo catalogue for a real launch.

## 5. sharp on Vercel

Image uploads are processed with [sharp](https://sharp.pixelplumbing.com)
(WebP, 1600 px long edge, quality 80).

- sharp ships prebuilt binaries per platform (`@img/sharp-linux-x64` on Vercel).
  Vercel installs on Linux, so the right binary is picked automatically. Do not
  commit `node_modules`, and do not install with `--no-optional`.
- `pnpm-workspace.yaml` allows sharp's build step (`allowBuilds`), and
  `next.config.ts` keeps it out of the bundle (`serverExternalPackages`).
- Uploads run in the Node.js runtime (route handlers default to it). Do not set
  `export const runtime = "edge"` on routes that touch sharp, Prisma or bcrypt.
- **Request body limit.** Vercel Functions accept request bodies up to **4.5 MB**.
  The app accepts uploads up to 5 MB (`MAX_UPLOAD_MB` in `lib/constants/media.ts`),
  so a file between 4.5 and 5 MB is rejected by Vercel with `413` before it
  reaches the app. Either lower `MAX_UPLOAD_MB` to 4, or resize images in the
  browser before upload.

## Media caching

`GET /api/v1/media/[id]` answers with
`Cache-Control: public, max-age=31536000, immutable` and an `ETag` (the sha256
checksum), and returns `304` for a matching `If-None-Match`. An id's bytes never
change (a new upload gets a new id), so this is safe to cache forever.

- **Browsers** cache each image for a year.
- **`next/image`** fetches `/api/v1/media/**` (allowed in `images.localPatterns`)
  and caches the resized variants it generates. On Vercel that is the Image
  Optimization cache, which is billed per source image.
- **Vercel's CDN** caches function responses only when they carry `s-maxage`
  (or a `CDN-Cache-Control` / `Vercel-CDN-Cache-Control` header). Adding
  `s-maxage=31536000` to `MEDIA_CACHE_CONTROL` lets the edge serve repeat
  requests without invoking the function or reading the database. This is a
  recommended production tweak.

Database size grows by roughly 100–250 KB per uploaded image. Watch the
Prisma Postgres storage quota, and keep regular backups (Prisma Postgres
backups, or `pg_dump`; the dump includes every image).

## 6. Connection handling

- One `PrismaClient` per function instance (`lib/server/prisma.ts`), on a `pg` pool.
- Serverless functions can scale out to many instances. Each holds its own small
  pool, so keep an eye on the database connection limit. If you hit it, cap the
  pool size (the `pg` pool `max` option passed to `PrismaPg` in
  `lib/server/prisma-client.ts`), or put a connection pooler in front of the database.
- Long work belongs in a single transaction (`prisma.$transaction`). Do not hold
  connections across awaits on slow third-party calls.

## 7. Checklist

- [ ] Production and Preview databases created; `DATABASE_URL` set per environment
- [ ] `JWT_SECRET` set (different per environment)
- [ ] `NEXT_PUBLIC_SITE_URL` / `NEXT_PUBLIC_APP_URL` set to the real domain
- [ ] `pnpm db:migrate:deploy` run against production
- [ ] `pnpm db:seed` run once; staff password changed
- [ ] Resend domain verified and `RESEND_*` / `STORE_EMAIL` set (otherwise mail is a logged dry run)
- [ ] Google OAuth origins include the production domain (if `NEXT_PUBLIC_GOOGLE_CLIENT_ID` is set)
- [ ] Upload a test image in the admin and open its `/api/v1/media/<id>` URL; check the `Cache-Control` and `ETag` headers
- [ ] `/admin` redirects to `/admin/login` when signed out (`proxy.ts`)

## Rollback

Vercel → Deployments → promote the previous deployment. Migrations are
forward-only: if a release added a migration, ship a new migration that undoes it
rather than editing an applied one.
